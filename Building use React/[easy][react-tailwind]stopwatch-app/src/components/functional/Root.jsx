/**
 * @fileoverview Этот файл содержит компонент Root, который реализует функциональность секундомера.
 * Секундомер позволяет запускать, приостанавливать и сбрасывать отсчет времени.
 */
import { useState } from 'react';
import { addLeadingZero, capitalizeFirstLetter } from '@utils';
import { Button } from '@ui';

/**
 * Основной компонент секундомера.
 * @returns {JSX.Element} Компонент секундомера.
 */
function Root() {
  // Флаг, указывающий, запущен ли секундомер.
  const [isRunning, setIsRunning] = useState(false);
  // Текущее время секундомера в секундах.
  const [time, setTime] = useState(0);
  // ID интервала для обновления времени.
  const [timeInterval, setTimeInterval] = useState(null);

  /**
   * Запускает секундомер.
   * Если секундомер уже запущен, функция ничего не делает.
   */
  const startTimer = () => {
    if (isRunning) return;
    clearInterval(timeInterval); // Очищаем предыдущий интервал, если он существует
    setIsRunning(true);
    setTimeInterval(setInterval(updateTime, 1000));
  };

  /**
   * Приостанавливает секундомер.
   * Если секундомер не запущен, функция ничего не делает.
   */
  const pauseTimer = () => {
    if (!isRunning) return;
    setIsRunning(false);
    clearInterval(timeInterval);
  };

  /**
   * Сбрасывает секундомер в исходное состояние.
   */
  const resetTimer = () => {
    clearInterval(timeInterval);
    setIsRunning(false);
    setTime(0);
  };

  /**
   * Обновляет время секундомера, увеличивая его на 1 секунду.
   */
  const updateTime = () => {
    setTime(prevState => prevState + 1);
  };

  /**
   * Обрабатывает клик по кнопкам управления секундомером.
   * @param {string} type - Тип операции ('start', 'pause' или 'reset').
   */
  const handleOperationClick = (type) => {
    const actions = {
      start: startTimer,
      pause: pauseTimer,
      reset: resetTimer,
    };

    // Вызываем соответствующую функцию, если она существует в объекте actions
    if (type in actions) actions[type]();
  };

  return (
    <div className="border shadow rounded max-w-sm mx-auto w-full p-4 md:p-8">
      <div className="grid gap-3">
        <h1 className="text-center font-bold text-3xl leading-none">StopWatch</h1>
        <div className="text-center font-bold text-2xl  md:text-7xl leading-none">
          <span>{addLeadingZero(Math.floor(time / 60))}</span>:<span>{addLeadingZero(time % 60)}</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          {['start', 'pause', 'reset'].map((type, idx) => (
            <Button key={idx} type={type}
                    onClick={() => handleOperationClick(type)}>{capitalizeFirstLetter(type)}</Button>))}
        </div>
      </div>
    </div>
  );
}

export default Root;
