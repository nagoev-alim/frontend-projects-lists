'use client';

import { useState, useCallback, useMemo } from 'react';
import { Button } from '@ui';
/**
 * @fileoverview Компонент DateCounter
 * @description Этот компонент представляет собой интерактивный счетчик дат.
 * Пользователь может увеличивать или уменьшать количество дней относительно базовой даты,
 * а также изменять шаг изменения. Компонент отображает результирующую дату.
 */

/**
 * @function DateCounter
 * @description Компонент для управления счетчиком дат. Позволяет пользователю изменять количество дней
 * относительно базовой даты и шаг изменения.
 * @returns {JSX.Element} Возвращает JSX элемент с интерфейсом счетчика дат.
 */
const DateCounter = () => {
  // Текущее значение счетчика дней.
  const [count, setCount] = useState(0);
  // Текущее значение шага изменения счетчика.
  const [step, setStep] = useState(1);
  // Базовая дата, от которой начинается отсчет.
  const baseDate = useMemo(() => new Date(), []);

  /**
   * @constant {Date} currentDate - Текущая дата, вычисленная на основе базовой даты и счетчика дней.
   * @description Использует useMemo для оптимизации производительности, пересчитывая значение
   * только при изменении baseDate или count.
   */
  const currentDate = useMemo(() => {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + (count || 0));
    return date;
  }, [baseDate, count]);

  /**
   * @function handleCountChange
   * @description Обработчик изменения счетчика дней. Увеличивает или уменьшает значение счетчика на величину шага.
   */
  const handleCountChange = useCallback((increment) => {
    setCount((prevCount) => prevCount + (increment ? step : -step));
  }, [step]);

  /**
   * @function handleStepChange
   * @description Обработчик изменения шага счетчика. Увеличивает или уменьшает значение шага на 1, но не менее 1.
   */
  const handleStepChange = useCallback((increment) => {
    setStep((prevStep) => Math.max(1, prevStep + (increment ? 1 : -1)));
  }, []);

  /**
   * @function renderDateMessage
   * @description Формирует сообщение о дате на основе текущего значения счетчика.
   */
  const renderDateMessage = useMemo(() => {
    if (count === 0) return 'Today is ';
    if (count > 0) return `${count} days from today is `;
    return `${Math.abs(count)} days ago was `;
  }, [count]);

  return (
    <div className="bg-white border-2 shadow rounded max-w-md w-full p-3 grid gap-3">
      <h1 className="text-center font-bold text-3xl">Date Counter</h1>
      <div className="flex justify-center items-center gap-3">
        <Button onClick={() => handleCountChange(false)}>-</Button>
        <p>Count Days: {count}</p>
        <Button onClick={() => handleCountChange(true)}>+</Button>
      </div>
      <div className="flex justify-center items-center gap-3">
        <Button onClick={() => handleStepChange(false)}>-</Button>
        <p>Step Days: {step}</p>
        <Button onClick={() => handleStepChange(true)}>+</Button>
      </div>
      <p className="flex gap-1 justify-center">
        <span>{renderDateMessage}</span>
        <span className="font-bold">{currentDate.toDateString()}</span>
      </p>
    </div>
  );
};


/**
 * @fileoverview Компонент DateCounter
 * @description Этот компонент представляет собой интерактивный счетчик дат.
 * Пользователь может увеличивать или уменьшать количество дней относительно текущей даты,
 * а также изменять шаг изменения. Компонент отображает результирующую дату и позволяет
 * сбросить настройки к исходным значениям.
 */

/**
 * @function DateCounter
 * @description Компонент для управления счетчиком дат. Позволяет пользователю изменять количество дней
 * относительно текущей даты и шаг изменения.
 * @returns {JSX.Element} Возвращает JSX элемент с интерфейсом счетчика дат.
 */
// const DateCounter = () => {
//   /**
//    * @constant {number} count - Текущее значение счетчика дней.
//    * @function setCount - Функция для обновления значения счетчика дней.
//    */
//   const [count, setCount] = useState(0);
//
//   /**
//    * @constant {number} step - Текущее значение шага изменения счетчика.
//    * @function setStep - Функция для обновления значения шага изменения.
//    */
//   const [step, setStep] = useState(1);
//
//   /**
//    * @constant {Date} baseDate - Базовая дата, от которой начинается отсчет.
//    * @description Инициализируется текущей датой при создании компонента.
//    */
//   const baseDate = new Date();
//
//   /**
//    * @constant {Date} currentDate - Текущая дата, вычисленная на основе базовой даты и счетчика дней.
//    * @description Использует useMemo для оптимизации производительности, пересчитывая значение
//    * только при изменении baseDate или count.
//    * @returns {Date} Новый объект Date, представляющий текущую дату с учетом счетчика дней.
//    */
//   const currentDate = useMemo(() => {
//     const date = new Date(baseDate);
//     date.setDate(date.getDate() + (count || 0));
//     return date;
//   }, [baseDate, count]);
//
//   /**
//    * @function handleCountChange
//    * @description Обработчик изменения счетчика дней. Увеличивает или уменьшает значение счетчика на величину шага.
//    * @param {boolean} increment - Флаг, указывающий направление изменения: true для увеличения, false для уменьшения.
//    * @returns {void}
//    * @memoized Функция мемоизирована с помощью useCallback для оптимизации производительности.
//    */
//   const handleCountChange = useCallback((increment) => {
//     setCount((prevCount) => {
//       if (prevCount === '' && !increment) return 0;
//       const newCount = (parseInt(prevCount) || 0) + (increment ? step : -step);
//       return isNaN(newCount) ? prevCount : newCount;
//     });
//   }, [step]);
//
//   /**
//    * @function renderDateMessage
//    * @description Формирует сообщение о дате на основе текущего значения счетчика.
//    * @returns {string} Строка с сообщением о текущей дате или смещении относительно текущей даты.
//    * @memoized Функция мемоизирована с помощью useCallback для оптимизации производительности.
//    * Пересчитывается только при изменении значения count.
//    */
//   const renderDateMessage = useCallback(() => {
//     if (!count) return 'Today is ';
//     return count > 0 ? `${count} days from today is ` : `${Math.abs(count)} days ago was `;
//   }, [count]);
//
//   /**
//    * @function handleResetClick
//    * @description Обработчик клика по кнопке сброса. Сбрасывает значения счетчика и шага к исходным.
//    * @returns {void}
//    * @memoized Функция мемоизирована с помощью useCallback для оптимизации производительности.
//    */
//   const handleResetClick = useCallback(() => {
//     setCount(0);
//     setStep(1);
//   }, []);
//
//   /**
//    * @function handleRangeChange
//    * @description Обработчик изменения значения ползунка для шага. Обновляет значение шага.
//    * @param {React.ChangeEvent<HTMLInputElement>} e - Событие изменения ползунка.
//    * @returns {void}
//    * @memoized Функция мемоизирована с помощью useCallback для оптимизации производительности.
//    */
//   const handleRangeChange = useCallback((e) => {
//     setStep(Number(e.target.value));
//   }, []);
//
//   /**
//    * @function handleInputChange
//    * @description Обработчик изменения значения в поле ввода счетчика. Обновляет значение счетчика.
//    * @param {React.ChangeEvent<HTMLInputElement>} e - Событие изменения поля ввода.
//    * @returns {void}
//    * @memoized Функция мемоизирована с помощью useCallback для оптимизации производительности.
//    */
//   const handleInputChange = useCallback((e) => {
//     const newValue = e.target.value;
//     setCount(newValue === '' ? '' : parseInt(newValue, 10) || 0);
//   }, []);
//
//   /**
//    * @constant {boolean} showResetButton
//    * @description Флаг, определяющий, нужно ли отображать кнопку сброса.
//    * Кнопка отображается, если значение счетчика не равно 0 или значение шага не равно 1.
//    */
//   const showResetButton = count !== 0 || step !== 1;
//
//   return (
//     <div className="bg-white border-2 shadow rounded max-w-md w-full p-3 grid gap-3">
//       <h1 className="text-center font-bold text-4xl">Date Counter</h1>
//       <div className="grid gap-2 place-items-center">
//         <input className="w-full" type="range" min="0" max="10" value={step} onChange={handleRangeChange} />
//         <span>Step Days: {step}</span>
//       </div>
//       <div className="flex justify-center gap-2">
//         <button className="p-2 px-3 border rounded hover:bg-gray-100 transition-colors"
//                 onClick={() => handleCountChange(false)}>-
//         </button>
//         <input className="border p-2 text-center font-bold" type="number" value={count} step={step}
//                onChange={handleInputChange} />
//         <button className="p-2 px-3 border rounded hover:bg-gray-100 transition-colors"
//                 onClick={() => handleCountChange(true)}>+
//         </button>
//       </div>
//       <p className="flex gap-1 justify-center">
//         <span>{renderDateMessage()}</span>
//         <span className="font-bold">{count === '' ? 'Select a date' : currentDate.toDateString()}</span>
//       </p>
//       {showResetButton && (
//         <button className="p-2 px-3 border rounded hover:bg-gray-100 transition-colors" onClick={handleResetClick}>
//           Reset
//         </button>
//       )}
//     </div>
//   );
// };

export default DateCounter;
