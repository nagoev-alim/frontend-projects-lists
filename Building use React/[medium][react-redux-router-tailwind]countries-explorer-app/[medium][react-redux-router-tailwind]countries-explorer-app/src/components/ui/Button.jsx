import PropTypes from 'prop-types';


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
