/**
 * @module VerifyAccount
 * @description Модуль, содержащий компонент для верификации аккаунта пользователя путем ввода шестизначного кода.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';

const DIGIT_COUNT = 6;

/**
 * @function Root
 * @description Компонент для отображения формы верификации аккаунта.
 * @returns {JSX.Element} Возвращает JSX разметку компонента верификации аккаунта.
 * @description
 * Компонент Root представляет собой форму для ввода шестизначного кода верификации.
 */
const Root = () => {
  // Состояние для хранения введенных цифр кода.
  const [digits, setDigits] = useState(Array(DIGIT_COUNT).fill(''));
  // Ссылки на input-элементы для управления фокусом.
  const inputRefs = useRef([]);

  /**
   * Устанавливает фокус на первый input-элемент при монтировании компонента.
   */
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  /**
   * @function handleDigitChange
   * Обрабатывает изменение значения в input-элементе.
   * @param {number} index - Индекс изменяемого элемента в массиве digits.
   * @param {string} value - Новое значение, введенное пользователем.
   */
  const handleDigitChange = useCallback((index, value) => {
    // Проверяем, что введен только один символ и это цифра
    if (value.length <= 1 && /^\d*$/.test(value)) {
      // Обновляем состояние digits
      setDigits(prevDigits => {
        const newDigits = [...prevDigits];
        newDigits[index] = value;
        return newDigits;
      });

      // Если введена цифра и это не последний input, переводим фокус на следующий
      if (value && index < DIGIT_COUNT - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  }, []);

  /**
   * @function handleKeyDown
   * Обрабатывает нажатие клавиш в input-элементе.
   * @param {React.KeyboardEvent} e - Объект события клавиатуры.
   * @param {number} index - Индекс текущего input-элемента.
   */
  const handleKeyDown = useCallback((e, index) => {
    // Если нажата клавиша Backspace, текущий input пуст и это не первый input,
    // переводим фокус на предыдущий input
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }, [digits]);

  return (
    <div className="grid w-full max-w-3xl gap-4 rounded border bg-white p-3 text-center shadow">
      <h1 className="text-center text-3xl font-bold">Verify Account</h1>
      <p>We emailed you the six-digit code to johndoe@email.com. Enter the code below to confirm your email address.</p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={el => inputRefs.current[index] = el}
            className="h-[40px] w-[40px] rounded border-2 px-1 py-1 text-center text-6xl font-bold focus:border-blue-400 focus:outline-none md:h-[80px] md:w-[80px]"
            type="text"
            maxLength={1}
            value={digit}
            onChange={e => handleDigitChange(index, e.target.value)}
            onKeyDown={e => handleKeyDown(e, index)}
            placeholder="0"
            required
          />
        ))}
      </div>
      <p>This is design only. We didn't actually send you an email as we don't have your email, right?</p>
    </div>
  );
};

export default Root;
