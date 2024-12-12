import { useDispatch } from 'react-redux';
import { useCallback, useState } from 'react';
import { Button, Input, Select } from '@ui';
import { quizActions, CONFIG_FEATURES } from '@features';
import { useNavigate } from 'react-router-dom';
import { showToast } from '@utils';
import { resetQuiz } from '@features/quiz/quizSlice.js';

/**
 * Компонент страницы настроек квиза.
 * Позволяет пользователю настроить параметры квиза и начать его.
 * @returns {JSX.Element} Возвращает JSX элемент страницы настроек квиза
 */
const QuizSettingsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [quizSettings, setQuizSettings] = useState({
    amount: 10,
    category: '',
    difficulty: '',
    type: '',
  });

  /**
   * Обработчик изменения значений в полях ввода.
   * @param {string} field - Имя поля, которое изменяется
   * @returns {function} Функция-обработчик события изменения
   */
  const handleInputChange = (field) => (event) => {
    setQuizSettings((prev) => ({ ...prev, [field]: event.target.value }));
  };

  /**
   * Обработчик отправки формы.
   * Проверяет заполнение всех полей, отправляет запрос на получение вопросов
   * и обрабатывает результат.
   * @param {Event} e - Событие отправки формы
   */
  const handleFormSubmit = useCallback(async (e) => {
    e.preventDefault();
    // Проверка заполнения всех обязательных полей
    if (quizSettings.category.length === 0 || quizSettings.difficulty.length === 0 || quizSettings.type.length === 0) {
      showToast('Please select all required fields', 'error');
      return;
    }
    try {
      // Отправка запроса на получение вопросов
      const response = await dispatch(quizActions.fetch(quizSettings));
      if (response.meta.requestStatus === 'fulfilled') {
        // Если запрос успешен, переходим на страницу квиза
        navigate('/quiz');
      }
      if (response.meta.requestStatus === 'rejected') {
        // Если запрос не удался, показываем сообщение об ошибке и сбрасываем настройки
        showToast('No questions found matching the provided criteria', 'error');
        dispatch(resetQuiz())
        setQuizSettings({
          amount: 10,
          category: '',
          difficulty: '',
          type: '',
        })
      }
    } catch (error) {
      console.error('An error occurred:', error);
      showToast('An error occurred while fetching data', 'error');
    }
  }, [quizSettings, dispatch]);

  return (
    <form className="grid gap-2 max-w-2xl mx-auto w-full p-3 bg-white rounded-md" onSubmit={handleFormSubmit}>
      <h1 className="text-center font-bold text-xl">Configure Quiz</h1>
      <p className="text-center">Set up all the fields and then start solving Quiz</p>
      <FormField label="Amount">
        <Input
          type="number"
          value={quizSettings.amount}
          onChange={handleInputChange('amount')}
        />
      </FormField>
      <FormField label="Category">
        <Select
          fullWidth
          options={CONFIG_FEATURES.CATEGORIES}
          value={quizSettings.category}
          onChange={handleInputChange('category')}
        />
      </FormField>
      <FormField label="Difficulty">
        <Select
          fullWidth
          options={CONFIG_FEATURES.DIFFICULTY_LEVELS}
          value={quizSettings.difficulty}
          onChange={handleInputChange('difficulty')}
        />
      </FormField>
      <FormField label="Type">
        <Select
          fullWidth
          options={CONFIG_FEATURES.QUIZ_TYPES}
          value={quizSettings.type}
          onChange={handleInputChange('type')}
        />
      </FormField>
      <Button type="submit">Start Quiz</Button>
    </form>
  );
};

/**
 * Компонент поля формы.
 * Отображает метку и дочерний элемент (поле ввода или выбора).
 * @param {Object} props - Свойства компонента
 * @param {string} props.label - Текст метки поля
 * @param {React.ReactNode} props.children - Дочерний элемент (поле ввода или выбора)
 * @returns {JSX.Element} Возвращает JSX элемент поля формы
 */
const FormField = ({ label, children }) => (
  <label className="grid gap-1">
    <span className="font-semibold text-sm">{label}:</span>
    {children}
  </label>
);

export default QuizSettingsPage;
