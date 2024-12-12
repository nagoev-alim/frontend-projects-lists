import PropTypes from 'prop-types';

/**
 * Компонент Input представляет собой настраиваемое поле ввода.
 *
 * @component
 * @param {Object} props - Свойства компонента.
 * @param {string} [props.className] - Дополнительные CSS классы для стилизации input.
 * @param {string} [props.type='text'] - Тип input элемента (например, 'text', 'password', 'email').
 * @param {string} [props.name] - Имя input элемента, используется для идентификации в формах.
 * @param {string} [props.placeholder] - Текст-подсказка, отображаемый в input, когда он пуст.
 * @param {string} [props.value] - Текущее значение input.
 * @param {function} [props.onChange] - Функция обратного вызова, вызываемая при изменении значения input.
 *
 * @returns {JSX.Element} Возвращает JSX элемент input с применёнными стилями и переданными свойствами.
 *
 * @description
 * Компонент использует строковый литерал для определения базовых стилей,
 * которые включают отступы, ширину, границу, цвет фона, стили при фокусировке и переходы.
 * Дополнительные классы могут быть добавлены через проп className.
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

Input.propTypes = {
  className: PropTypes.string,
  type: PropTypes.string,
  name: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
};
export default Input;
