import { useEffect, useState } from 'react';
import { getLocalStorageItem } from '@utils';
import { Form, Timer } from '@functional';

/**
 * Компонент обратного отсчета.
 * @returns {JSX.Element} Возвращает JSX элемент с компонентом обратного отсчета.
 */
const Root = () => {
  /**
   * Состояние заголовка обратного отсчета.
   */
  const [title, setTitle] = useState(() => getLocalStorageItem('countdown', 'title') ?? null);

  /**
   * Состояние даты окончания обратного отсчета.
   */
  const [date, setDate] = useState(() => getLocalStorageItem('countdown', 'date') ?? null);

  /**
   * Состояние отображения формы ввода.
   */
  const [showForm, setShowForm] = useState(false);

  /**
   * Состояние завершения таймера.
   */
  const [endTimer, setEndTimer] = useState(false);

  /**
   * Эффект для инициализации состояния отображения формы.
   * @description
   * Этот эффект выполняется один раз при монтировании компонента.
   * Он проверяет наличие данных обратного отсчета в localStorage и
   * устанавливает соответствующее значение для состояния showForm.
   */
  useEffect(() => {
    const isCountdownStored = Boolean(localStorage.getItem('countdown'));
    setShowForm(!isCountdownStored);
  }, []);

  return (
    <div className="max-w-md w-full mx-auto border-2 rounded bg-white p-3 grid gap-3">
      <h1 className="text-2xl font-bold text-center">{title ?? 'Countdown'}</h1>
      {showForm ? (
        <Form
          setShowForm={setShowForm}
          setTitle={setTitle}
          setDate={setDate}
        />
      ) : (
        <Timer
          setShowForm={setShowForm}
          setTitle={setTitle}
          date={date}
          setDate={setDate}
          endTimer={endTimer}
          setEndTimer={setEndTimer}
        />
      )}
    </div>
  );
};

export default Root;
