/**
 * @fileoverview Компонент генератора паролей
 * @module PasswordGenerator
 */
import { useCallback, useEffect, useState } from 'react';
import { FaRegClipboard } from 'react-icons/fa6';
import { PasswordOptions } from '@ui';
import { copyToClipboard } from '@utils';
import { usePasswordGeneratorContext } from '@context';

/**
 * Компонент генератора паролей
 * @function PasswordGenerator
 * @returns {JSX.Element} JSX элемент с интерфейсом генератора паролей
 */
const PasswordGenerator = () => {
  /**
   * Состояние для хранения длины пароля
   * @type {[number, function]} Кортеж с текущим значением и функцией обновления
   */
  const [inputRange, setInputRange] = useState(15);

  /**
   * Извлечение необходимых данных и функций из контекста
   * @type {Object} Объект с данными и функциями из контекста
   */
  const { password, strength, options, handleGenerateClick } = usePasswordGeneratorContext();

  /**
   * Обработчик изменения длины пароля
   * @function
   * @param {Event} e - Событие изменения ползунка
   */
  const handleRangeChange = useCallback((e) => {
    const newValue = Number(e.target.value);
    setInputRange(newValue);
    handleGenerateClick(newValue); // Генерируем новый пароль с обновленной длиной
  }, [handleGenerateClick]);

  /**
   * Эффект для генерации пароля при изменении длины или опций
   */
  useEffect(() => {
    handleGenerateClick(inputRange);
  }, [handleGenerateClick, inputRange, options]);

  return (
    <div className="grid max-w-md w-full gap-4 rounded border bg-white p-3 shadow">
      <h1 className="text-center text-2xl font-bold md:text-2xl">Password Generator</h1>

      {/* Поле отображения сгенерированного пароля */}
      <div className="relative">
        <input
          className="w-full rounded border py-2 px-3 pr-8 text-lg tracking-wider"
          type="text"
          disabled
          value={password ?? ''}
          aria-label="Generated Password"
        />
        <button
          className="absolute right-1 top-1/2 -translate-y-1/2"
          onClick={() => copyToClipboard(password)}
          aria-label="Copy password to clipboard"
        >
          <FaRegClipboard size={20} />
        </button>
      </div>

      {/* Индикатор силы пароля */}
      <div
        className="h-2 rounded border bg-gray-100 indicator"
        data-level={strength}
      />

      {/* Ползунок для выбора длины пароля */}
      <div>
        <div className="flex items-center justify-between gap-1">
          <span>Password Length</span>
          <span>{inputRange}</span>
        </div>
        <input
          className="range w-full"
          type="range"
          value={inputRange}
          min="1"
          max="30"
          step="1"
          onChange={handleRangeChange}
          aria-label="Set password length"
        />
      </div>

      {/* Компонент с опциями генерации пароля */}
      <PasswordOptions />

      {/* Кнопка генерации пароля */}
      <button
        className="rounded border px-3 py-2.5 hover:bg-gray-100 transition-colors"
        onClick={() => handleGenerateClick(inputRange)}
      >
        Generate Password
      </button>
    </div>
  );
};

export default PasswordGenerator;
