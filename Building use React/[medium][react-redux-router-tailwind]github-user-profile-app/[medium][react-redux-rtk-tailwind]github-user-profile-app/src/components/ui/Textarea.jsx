import PropTypes from 'prop-types';
import classNames from 'classnames';
import { forwardRef } from 'react';

const Textarea = forwardRef(({
                               placeholder = '',
                               disabled = false,
                               fullWidth = false,
                               resizeNone = false,
                               rows = 3,
                               darkMode = false,
                               className,
                               ...props
                             }, ref) => {
  return (
    <textarea
      placeholder={placeholder}
      rows={rows}
      className={classNames(
        'border rounded px-3 py-2 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500',
        {
          'dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:focus:ring-blue-400': darkMode,
          'w-full': fullWidth,
          'opacity-50 cursor-not-allowed': disabled,
          'resize-none': resizeNone,
        },
        className,
      )}
      ref={ref}
      disabled={disabled}
      {...props}
    />
  );
});

Textarea.propTypes = {
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  resizeNone: PropTypes.bool,
  rows: PropTypes.number,
  darkMode: PropTypes.bool,
  className: PropTypes.string,
};

export default Textarea;
