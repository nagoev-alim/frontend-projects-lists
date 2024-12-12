import PropTypes from 'prop-types';
import classNames from 'classnames';
import { forwardRef } from 'react';

const Input = forwardRef(({
                            type = 'text',
                            placeholder = '',
                            disabled = false,
                            fullWidth = false,
                            darkMode = false,
                            className,
                            ...props
                          }, ref) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className={classNames(
        'border rounded px-3 py-2 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500',
        {
          'dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:focus:ring-blue-400': darkMode,
          'w-full': fullWidth,
          'opacity-50 cursor-not-allowed': disabled,
        },
        className,
      )}
      disabled={disabled}
      ref={ref}
      {...props}
    />
  );
});

Input.propTypes = {
  type: PropTypes.string,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  darkMode: PropTypes.bool,
  className: PropTypes.string,
};

export default Input;
