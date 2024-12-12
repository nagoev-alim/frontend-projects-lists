import PropTypes from 'prop-types';

/**
 * Компонент Input - переиспользуемое поле ввода с настраиваемыми свойствами.
 *
 * @param {Object} props - Свойства компонента.
 * @param {string} [props.className] - Дополнительные CSS классы для поля ввода.
 * @param {string} [props.type] - Тип поля ввода (например, 'text', 'password', 'email').
 * @param {string} [props.name] - Имя поля ввода.
 * @param {string} [props.placeholder] - Текст-подсказка для поля ввода.
 * @param {string} [props.value] - Текущее значение поля ввода.
 * @param {Function} [props.onChange] - Функция обработчик изменения значения поля.
 * @returns {React.ReactElement} Возвращает JSX элемент поля ввода.
 */
const Input = ({ className, type, name, placeholder, value, onChange }) => {
  return (
    <input
      className={`
        px-3 py-2
        w-full
        border-2 rounded
        bg-slate-50
        focus:outline-none focus:border-blue-400
        transition-colors
        ${className}
      `}
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  );
};

// Определение типов props с использованием PropTypes
Input.propTypes = {
  className: PropTypes.string,
  type: PropTypes.string,
  name: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
};

export default Input;
