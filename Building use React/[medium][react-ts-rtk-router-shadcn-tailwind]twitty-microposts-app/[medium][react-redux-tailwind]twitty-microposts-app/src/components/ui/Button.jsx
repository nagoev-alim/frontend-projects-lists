import PropTypes from 'prop-types';
import classNames from 'classnames';

const Button = ({
                  children,
                  variant = 'primary',
                  size = 'medium',
                  disabled = false,
                  onClick,
                  type = 'button',
                  fullWidth = false,
                  darkMode = false,
                  className,
                  ...props
                }) => {
  return (
    <button
      type={type}
      className={classNames(
        'rounded px-4 py-2 font-semibold transition duration-300',
        {
          'bg-blue-500 text-white hover:bg-blue-600': variant === 'primary' && !darkMode,
          'bg-gray-600 text-white hover:bg-gray-700': variant === 'secondary' && !darkMode,
          'bg-red-500 text-white hover:bg-red-600': variant === 'danger' && !darkMode,
          'bg-transparent text-blue-500 border border-blue-500 hover:bg-blue-50': variant === 'outline' && !darkMode,
          'dark:bg-blue-700 dark:text-white dark:hover:bg-blue-800': variant === 'primary' && darkMode,
          'dark:bg-gray-800 dark:text-white dark:hover:bg-gray-900': variant === 'secondary' && darkMode,
          'dark:bg-red-700 dark:text-white dark:hover:bg-red-800': variant === 'danger' && darkMode,
          'dark:bg-transparent dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-900': variant === 'outline' && darkMode,
          'text-sm': size === 'small',
          'text-base': size === 'medium',
          'text-lg': size === 'large',
          'w-full': fullWidth,
          'opacity-50 cursor-not-allowed': disabled,
        },
        className,
      )}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'outline']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  fullWidth: PropTypes.bool,
  darkMode: PropTypes.bool,
  className: PropTypes.string,
};

export default Button;
