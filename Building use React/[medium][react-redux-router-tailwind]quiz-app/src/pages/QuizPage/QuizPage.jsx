import { useDispatch, useSelector } from 'react-redux';
import { quizSelectors } from '@features';
import { useNavigate } from 'react-router-dom';
import { incrementScore, nextQuestion } from '@features/quiz/quizSlice.js';
import { useEffect, useState } from 'react';
import { Button } from '@ui';

/**
 * Компонент страницы квиза.
 * Отображает текущий вопрос, варианты ответов и управляет процессом прохождения квиза.
 * @returns {JSX.Element} Возвращает JSX элемент страницы квиза
 */
const QuizPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { questions, currentQuestionIndex, score, quizCompleted } = useSelector(quizSelectors.selectQuizData);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [answered, setAnswered] = useState(false);

  // Эффект для перенаправления на главную страницу, если нет вопросов
  useEffect(() => {
    if (questions.length === 0) {
      navigate('/');
    }
  }, [questions, navigate]);

  // Эффект для перенаправления на страницу результатов при завершении квиза
  useEffect(() => {
    if (quizCompleted) {
      navigate('/result');
    }
  }, [quizCompleted, navigate]);

  // Если нет вопросов, возвращаем null
  if (questions.length === 0) {
    return null;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const correctAnswer = decodeURIComponent(currentQuestion.correct_answer);
  const allAnswers = [...currentQuestion.incorrect_answers, currentQuestion.correct_answer].sort();

  /**
   * Обработчик отправки ответа.
   * Проверяет правильность ответа и обновляет состояние.
   */
  const handleSubmitAnswer = () => {
    if (selectedAnswer === correctAnswer) {
      dispatch(incrementScore());
    }
    setAnswered(true);
  };

  /**
   * Обработчик перехода к следующему вопросу.
   * Сбрасывает состояние ответа и переходит к следующему вопросу.
   */
  const handleNextQuestion = () => {
    setAnswered(false);
    setSelectedAnswer('');
    dispatch(nextQuestion());
  };

  /**
   * Определяет цвет ответа в зависимости от его правильности и выбора пользователя.
   * @param {string} answer - Текст ответа
   * @returns {string} CSS класс для стилизации ответа
   */
  const getAnswerColor = (answer) => {
    if (!answered) return '';
    if (decodeURIComponent(answer) === correctAnswer) return 'font-bold text-green-500';
    if (decodeURIComponent(answer) === selectedAnswer) return 'font-bold text-red-500';
    return '';
  };

  /**
   * Вычисляет процент правильных ответов.
   * @returns {number} Процент правильных ответов
   */
  const calculateScorePercentage = () => {
    if (questions.length === 0) return 0;
    return Math.round((score / questions.length) * 100);
  };

  return (
    <div className="grid gap-2 max-w-2xl mx-auto w-full p-3 bg-white rounded-md">
      <h2 className="text-xl font-bold text-center">Question {currentQuestionIndex + 1} / {questions.length}</h2>
      <p className="text-center">{decodeURIComponent(currentQuestion.question)}</p>
      <div className="grid gap-3 my-3">
        {allAnswers.map((answer, index) => (
          <label key={index} className="inline-flex gap-2 items-center cursor-pointer">
            <input
              type="radio"
              name="answer"
              value={decodeURIComponent(answer)}
              checked={selectedAnswer === decodeURIComponent(answer)}
              onChange={(e) => setSelectedAnswer(e.target.value)}
              disabled={answered}
              className="sr-only"
            />
            <span className={`radio !w-[20px] !h-[20px] ${getAnswerColor(answer)}`} />
            <span className={`${getAnswerColor(answer)}`}>{decodeURIComponent(answer)}</span>
          </label>
        ))}
      </div>
      {answered ? (
        <Button onClick={handleNextQuestion}>Next Question</Button>
      ) : (
        <Button onClick={handleSubmitAnswer} disabled={!selectedAnswer}>
          Submit Answer
        </Button>
      )}
      <div className="text-center">
        Score: <span className="font-bold">{calculateScorePercentage()}%</span>
      </div>
    </div>
  );
};

export default QuizPage;
