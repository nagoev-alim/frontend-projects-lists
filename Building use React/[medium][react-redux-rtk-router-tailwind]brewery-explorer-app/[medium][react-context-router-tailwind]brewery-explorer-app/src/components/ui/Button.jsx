import PropTypes from 'prop-types';

/**
 * Компонент Button представляет собой настраиваемую кнопку.
 *
 * @component
 * @param {Object} props - Свойства компонента.
 * @param {React.ReactNode} props.children - Дочерние элементы, которые будут отображены внутри кнопки.
 * @param {('button'|'submit'|'reset')} [props.type='button'] - Тип кнопки. По умолчанию 'button'.
 * @param {string} [props.className=''] - Дополнительные CSS классы для стилизации кнопки.
 * @param {Function} [props.onClick] - Функция обратного вызова, вызываемая при клике на кнопку.
 *
 * @returns {JSX.Element} Возвращает JSX элемент button с применёнными стилями и переданными свойствами.
 *
 * @description
 * Компонент использует строковый литерал для определения базовых стилей,
 * которые включают шрифт, отступы, границу, цвет фона и эффект при наведении.
 * Дополнительные классы могут быть добавлены через проп className.
 * Метод trim() используется для удаления лишних пробелов в строке классов.
 */
const Button = ({
                  children,
                  type = 'button',
                  className = '',
                  onClick,
                }) => (
  <button
    className={`
      font-medium
      px-3 py-2
      border-2 rounded
      bg-white hover:bg-neutral-300
      transition-colors
      ${className}
    `.trim()}
    type={type}
    onClick={onClick}
  >
    {children}
  </button>
);

Button.propTypes = {
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string,
  onClick: PropTypes.func,
};

export default Button;
