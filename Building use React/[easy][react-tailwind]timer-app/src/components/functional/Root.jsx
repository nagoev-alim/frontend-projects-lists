import { useCallback, useEffect, useState } from 'react';
import { showToast } from '@utils';
import { TimerDisplay, TimerInput } from '@functional';

/**
 * Компонент Root.
 * @returns {JSX.Element} Возвращает JSX элемент таймера.
 */
function Root() {
  // Оставшееся время в секундах.
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  // Флаг, указывающий, запущен ли таймер.
  const [isRunning, setIsRunning] = useState(false);
  // Введенное пользователем время.
  const [inputTime, setInputTime] = useState('');
  // Флаг, указывающий, отображать ли таймер.
  const [showTimer, setShowTimer] = useState(false);
  // Вычисление минут и секунд из оставшегося времени.
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;

  /**
   * Обрабатывает отправку формы с введенным временем.
   * @param {Event} event - Объект события отправки формы.
   * @throws {Error} Если введенное время не является числом.
   */
  function handleFormSubmit(event) {
    event.preventDefault();
    const newTime = Number(inputTime.trim());

    if (isNaN(newTime)) {
      showToast('Please enter a valid number', 'error');
      return;
    }

    if (newTime <= 0 || newTime > 59) {
      showToast('Please enter a number from 1 to 59', 'error');
      return;
    }

    setSecondsRemaining(newTime * 60);
    setShowTimer(true);
    setInputTime('');
  }

  /**
   * Обработчик кнопки управления таймером (запуск/пауза).
   * Переключает состояние запуска таймера.
   */
  const handleControlButton = useCallback(() => {
    setIsRunning(prev => !prev);
  }, []);

  /**
   * Обработчик кнопки сброса таймера.
   * Останавливает таймер, обнуляет оставшееся время и скрывает таймер.
   */
  const handleResetButton = useCallback(() => {
    setIsRunning(false);
    setSecondsRemaining(0);
    setShowTimer(false);
  }, []);


  /**
   * Эффект для управления таймером.
   * Запускает или останавливает таймер в зависимости от состояния isRunning и secondsRemaining.
   */
  useEffect(() => {
    let interval;
    if (isRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining(prev => prev - 1);
      }, 1000);
    } else if (!isRunning && secondsRemaining !== 0) {
      clearInterval(interval);
    }
    return () => {
      clearInterval(interval);
    };
  }, [isRunning, secondsRemaining]);

  /**
   * Эффект для обработки завершения таймера.
   * Останавливает таймер, скрывает его и отображает уведомление при достижении нуля.
   */
  useEffect(() => {
    if (secondsRemaining === 0 && isRunning) {
      setIsRunning(false);
      setShowTimer(false);
      showToast('Timer completed!', 'success');
    }
  }, [secondsRemaining, isRunning]);

  return (
    <div className="bg-white border shadow rounded max-w-md w-full p-4 grid gap-3">
      {!showTimer ? (
        <TimerInput
          inputTime={inputTime}
          setInputTime={setInputTime}
          handleFormSubmit={handleFormSubmit}
        />
      ) : (
        <TimerDisplay
          minutes={minutes}
          seconds={seconds}
          isRunning={isRunning}
          handleControlButton={handleControlButton}
          handleResetButton={handleResetButton}
        />
      )}
    </div>
  );
}

export default Root;
