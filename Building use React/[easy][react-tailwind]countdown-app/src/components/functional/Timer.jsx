import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@ui';

const Timer = ({ setShowForm, setTitle, date, setDate, endTimer, setEndTimer }) => {
  /**
   * Преобразует строковую дату в миллисекунды.
   */
  const parsedDate = useMemo(() => Date.parse(date), [date]);

  /**
   * Состояние для хранения оставшегося времени в миллисекундах.
   */
  const [time, setTime] = useState(() => {
    const currentTime = Date.now();
    return parsedDate > currentTime ? parsedDate - currentTime : 0;
  });

  /**
   * Эффект для обновления таймера и проверки его завершения.
   * @description
   * Этот эффект создает интервал, который каждую миллисекунду обновляет оставшееся время.
   * Когда время истекает, эффект очищает интервал, устанавливает время в 0,
   * отмечает таймер как завершенный, обновляет заголовок и сбрасывает дату.
   * @returns {function} Функция очистки, которая останавливает интервал при размонтировании компонента.
   */
  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = Date.now();
      const remainingTime = parsedDate - currentTime;

      if (remainingTime <= 0) {
        clearInterval(interval);
        setTime(0);
        setEndTimer(true);
        setTitle('Countdown Completed 🎊');
        setDate(null);
      } else {
        setTime(remainingTime);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [parsedDate, setDate, setEndTimer, setTitle]);

  /**
   * @function calculateTime
   * Вычисляет оставшееся время для каждой единицы времени (дни, часы, минуты, секунды).
   * @description
   * Эта функция использует useMemo для оптимизации производительности,
   * пересчитывая значения только при изменении времени.
   * Она разбивает оставшееся время на дни, часы, минуты и секунды,
   * форматируя каждое значение как строку с ведущим нулем при необходимости.
   */
  const calculateTime = useMemo(() => {
    const MILLISECONDS_PER_DAY = 86400000;
    const MILLISECONDS_PER_HOUR = 3600000;
    const MILLISECONDS_PER_MINUTE = 60000;
    const MILLISECONDS_PER_SECOND = 1000;

    const timeUnits = [
      { label: 'Days', divisor: MILLISECONDS_PER_DAY },
      { label: 'Hours', divisor: MILLISECONDS_PER_HOUR, modulo: 24 },
      { label: 'Minutes', divisor: MILLISECONDS_PER_MINUTE, modulo: 60 },
      { label: 'Seconds', divisor: MILLISECONDS_PER_SECOND, modulo: 60 },
    ];

    return timeUnits.map(({ label, divisor, modulo }) => {
      const value = modulo
        ? Math.floor((time / divisor) % modulo)
        : Math.floor(time / divisor);
      return {
        label,
        value,
        displayValue: value.toString().padStart(2, '0'),
      };
    });
  }, [time]);

  /**
   * @function handleResetClick
   * Обработчик сброса таймера обратного отсчета.
   * @description
   * Эта функция сбрасывает состояние таймера обратного отсчета к исходному.
   * Она очищает заголовок, дату, показывает форму для нового ввода,
   * сбрасывает флаг завершения таймера и очищает локальное хранилище.
   * Функция оптимизирована с использованием useCallback для предотвращения
   * ненужных перерендерингов.
   */
  const handleResetClick = useCallback(() => {
    setTitle(null);
    setDate(null);
    setShowForm(true);
    setEndTimer(false);
    try {
      localStorage.removeItem('countdown');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }, [setTitle, setDate, setShowForm, setEndTimer]);

  return (
    <div className="grid gap-3">
      {!endTimer && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {calculateTime.map(({ label, displayValue }) => (
            <li className="grid gap-1 place-items-center bg-neutral-900 rounded text-white p-2" key={label}>
              <p className="text-4xl font-bold">{!isNaN(parseInt(displayValue, 10)) ? displayValue : null}</p>
              <span className="font-medium">{label}</span>
            </li>
          ))}
        </ul>
      )}
      <Button onClick={handleResetClick}>
        New Countdown
      </Button>
    </div>
  );
};

export default Timer;
