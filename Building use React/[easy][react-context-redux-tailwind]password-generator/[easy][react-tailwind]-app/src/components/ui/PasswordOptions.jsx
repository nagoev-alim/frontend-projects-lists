import PropTypes from 'prop-types';

/**
 * @description Компонент для отображения опций настройки пароля
 * @param {Object} props - Пропсы компонента
 * @param {Array} props.options - Массив объектов с опциями пароля
 * @param {Function} props.onOptionChange - Функция обратного вызова для изменения опции
 * @returns {JSX.Element} Возвращает JSX элемент с списком опций пароля
 */
const PasswordOptions = ({ options, onOptionChange }) => (
  <ul className="grid gap-3 sm:grid-cols-2">
    {options.map(({ id, checked, label }) => (
      <li key={id}>
        <label className="flex items-center cursor-pointer">
          <input
            className="sr-only" // Скрытый визуально, но доступный для скринридеров
            type="checkbox"
            checked={checked}
            onChange={() => onOptionChange(id)}
          />
          {/* Кастомный чекбокс */}
          <span className="checkbox mr-2"></span>
          {/* Текст опции */}
          <span className="label">{label}</span>
        </label>
      </li>
    ))}
  </ul>
);

// Проверка типов пропсов
PasswordOptions.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      checked: PropTypes.bool.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ).isRequired,
  onOptionChange: PropTypes.func.isRequired,
};

export default PasswordOptions;
