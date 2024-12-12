import { useCallback, useMemo, useState } from 'react';
import { showToast } from '@utils';
import { Button, Input } from '@ui';

/**
 * Компонент формы для создания нового обратного отсчета
 * @returns {JSX.Element} Форма для ввода данных обратного отсчета
 */
const Form = ({ setShowForm, setTitle, setDate }) => {
  /**
   * Состояние для хранения введенных пользователем данных
   */
  const [inputs, setInputs] = useState({ title: '', date: '' });

  /**
   * Минимально допустимая дата для выбора (сегодняшний день)
   */
  const minDate = useMemo(() => new Date().toISOString().split('T')[0], []);

  /**
   * @function handleInputChange
   * Обработчик изменения значений в полях ввода формы.
   * @description
   * Эта функция обновляет состояние inputs, сохраняя введенные пользователем данные.
   * Она использует деструктуризацию для извлечения name и value из целевого элемента события.
   * Затем обновляет соответствующее поле в состоянии inputs, сохраняя при этом остальные поля неизменными.
   */
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setInputs((prevInputs) => ({
      ...prevInputs,
      [name]: value.trim(),
    }));
  }, []);

  /**
   * @function handleFormSubmit
   * Обработчик отправки формы.
   * @description
   * Эта функция вызывается при отправке формы. Она выполняет следующие действия:
   * 1. Предотвращает стандартное поведение отправки формы.
   * 2. Проверяет, заполнены ли поля формы.
   * 3. Если поля не заполнены, показывает сообщение об ошибке.
   * 4. Если поля заполнены, обновляет состояние приложения и сохраняет данные в localStorage.
   * 5. Сбрасывает форму и скрывает её.
   *
   * @throws {Error} Может вызвать ошибку при неудачной попытке сохранения в localStorage.
   */
  const handleFormSubmit = useCallback((e) => {
    e.preventDefault();
    const { title, date } = inputs;

    if (!title.trim() || !date.trim()) {
      showToast('Please fill all the fields.', 'error');
      return;
    }

    try {
      setTitle(title.trim());
      setDate(date.trim());
      setShowForm(false);
      setInputs({ title: '', date: '' });
      localStorage.setItem('countdown', JSON.stringify({ title: title.trim(), date: date.trim() }));
    } catch (error) {
      console.error('Failed to save countdown data:', error);
      showToast('Failed to save countdown. Please try again.', 'error');
    }
  }, [inputs, setTitle, setDate, setShowForm]);

  return (
    <form className="grid gap-3" onSubmit={handleFormSubmit}>
      <label className="grid gap-1">
        <span className="font-medium text-sm">Name</span>
        <Input
          name="title"
          placeholder="What are you counting down to?"
          value={inputs.title}
          onChange={handleInputChange}
        />
      </label>
      <label className="grid gap-1">
        <span className="font-medium text-sm">Date</span>
        <Input
          type="date"
          name="date"
          min={minDate}
          value={inputs.date}
          onChange={handleInputChange}
        />
      </label>
      <Button  type="submit">
        Submit
      </Button>
    </form>
  );
};

export default Form;
