import PropTypes from 'prop-types';

/**
 * Компонент Button - переиспользуемая кнопка с настраиваемым стилем и функциональностью.
 *
 * @param {Object} props - Свойства компонента.
 * @param {React.ReactNode} props.children - Дочерние элементы, отображаемые внутри кнопки.
 * @param {('button'|'submit'|'reset')} [props.type='button'] - Тип кнопки (по умолчанию 'button').
 * @param {string} [props.className=''] - Дополнительные CSS классы для кнопки.
 * @param {Function} [props.onClick] - Функция обработчик клика по кнопке.
 * @returns {React.ReactElement} Возвращает JSX элемент кнопки.
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
      dark:bg-neutral-700 dark:text-white dark:hover:bg-neutral-800 dark:border-neutral-800
      ${className}
    `.trim()} // Удаляем лишние пробелы в начале и конце строки
    type={type}
    onClick={onClick}
  >
    {children}
  </button>
);

// Определение типов props с использованием PropTypes
Button.propTypes = {
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string,
  onClick: PropTypes.func,
};

export default Button;
