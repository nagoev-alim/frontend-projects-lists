import { useCallback, useEffect, useState } from 'react';
import { FaRegClipboard } from 'react-icons/fa6';
import { PasswordOptions } from '@ui';
import { characters, copyToClipboard } from '@utils';

/**
 * Компонент генератора паролей
 * @returns {JSX.Element} Возвращает JSX для рендеринга компонента генератора паролей
 */
const PasswordGenerator = () => {
  // Состояние для длины пароля
  const [inputRange, setInputRange] = useState(15);
  // Состояние для сгенерированного пароля
  const [password, setPassword] = useState(null);
  // Состояние для опций генерации пароля
  const [options, setOptions] = useState([
    { id: 'lowercase', label: 'Lowercase (a-z)', checked: true },
    { id: 'uppercase', label: 'Uppercase (A-Z)', checked: false },
    { id: 'numbers', label: 'Numbers (0-9)', checked: false },
    { id: 'symbols', label: 'Symbols (!-$^+)', checked: false },
  ]);

  /**
   * Обработчик изменения опций генерации пароля
   * @param {string} id - Идентификатор изменяемой опции
   */
  const handleOptionChange = useCallback((id) => {
    setOptions((prevOptions) =>
      prevOptions.map((option) =>
        option.id === id ? { ...option, checked: !option.checked } : option,
      ),
    );
  }, []);

  /**
   * Генерация нового пароля
   */
  const handleGenerateClick = useCallback(() => {
    const selectedOptions = options.filter((option) => option.checked);
    if (selectedOptions.length === 0) {
      setPassword('');
      return;
    }

    const generatedPassword = Array.from({ length: inputRange }, () => {
      const randomOption = selectedOptions[Math.floor(Math.random() * selectedOptions.length)];
      return characters[randomOption.id].generate();
    }).join('');

    setPassword(generatedPassword);
  }, [options, inputRange]);

  /**
   * Обработчик изменения длины пароля
   * @param {Event} e - Событие изменения значения ползунка
   */
  const handleRangeChange = useCallback((e) => {
    const newValue = Number(e.target.value);
    setInputRange(newValue);
    handleGenerateClick();
  }, [handleGenerateClick]);

  /**
   * Определение силы пароля на основе его длины
   * @param {number} length - Длина пароля
   * @returns {string} Строка, обозначающая силу пароля ('weak', 'medium', 'strong')
   */
  const getPasswordStrength = (length) => {
    if (length <= 8) return 'weak';
    if (length <= 16) return 'medium';
    return 'strong';
  };

  // Эффект для генерации пароля при изменении опций
  useEffect(() => {
    handleGenerateClick();
  }, [handleGenerateClick, options]);

  return (
    <div className="grid max-w-md w-full gap-4 rounded border bg-white p-3 shadow">
      <h1 className="text-center text-2xl font-bold md:text-4xl">Password Generator</h1>

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
        data-level={getPasswordStrength(inputRange)}
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
      <PasswordOptions options={options} onOptionChange={handleOptionChange} />

      {/* Кнопка генерации пароля */}
      <button
        className="rounded border px-3 py-2.5 hover:bg-gray-100 transition-colors"
        onClick={handleGenerateClick}
      >
        Generate Password
      </button>
    </div>
  );
};

export default PasswordGenerator;
