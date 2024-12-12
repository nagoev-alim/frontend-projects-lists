import PropTypes from 'prop-types';
import classNames from 'classnames';

const Select = ({
                  options = [],
                  disabled = false,
                  fullWidth = false,
                  darkMode = false,
                  className,
                  ...props
                }) => {
  return (
    <select
      className={classNames(
        'border rounded px-3 py-2 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer',
        {
          'dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:focus:ring-blue-400': darkMode,
          'w-full': fullWidth,
          'opacity-50 cursor-not-allowed': disabled,
        },
        className
      )}
      disabled={disabled}
      {...props}
    >
      {options.map((option, index) => (
        <option key={index} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

Select.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  darkMode: PropTypes.bool,
  className: PropTypes.string,
};

export default Select;
