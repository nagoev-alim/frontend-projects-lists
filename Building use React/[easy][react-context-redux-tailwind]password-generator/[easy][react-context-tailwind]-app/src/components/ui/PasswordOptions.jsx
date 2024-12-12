/**
 * @fileoverview Компонент для отображения опций настройки пароля
 * @module PasswordOptions
 */
import { usePasswordGeneratorContext } from '@context';

/**
 * Компонент для отображения опций настройки пароля
 * @function PasswordOptions
 * @returns {JSX.Element} JSX элемент со списком опций пароля
 */
const PasswordOptions = () => {
  /**
   * Извлекаем опции и функцию изменения опций из контекста генератора паролей
   * @type {Object} options - Массив объектов с опциями пароля
   * @type {Function} handleOptionChange - Функция для изменения состояния опции
   */
  const { options, handleOptionChange } = usePasswordGeneratorContext();

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {options.map(({ id, checked, label }) => (
        <li key={id}>
          <label className="flex items-center cursor-pointer">
            <input
              className="sr-only" // Скрытый нативный чекбокс
              type="checkbox"
              checked={checked}
              onChange={() => handleOptionChange(id)}
            />
            {/* Кастомный визуальный чекбокс */}
            <span className="checkbox mr-2"></span>
            {/* Текст опции */}
            <span>{label}</span>
          </label>
        </li>
      ))}
    </ul>
  );
};

export default PasswordOptions;
