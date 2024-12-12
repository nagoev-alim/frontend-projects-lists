import React from 'react';
import PropTypes from 'prop-types';

const Select = ({ options, value, onChange, fullWidth, className, ...props }) => {
  return (
    <select
      value={value ? value.value : ''}
      onChange={(e) => {
        const selectedOption = options.find(option => option.value.toString() === e.target.value);
        onChange(selectedOption);
      }}
      className={`border rounded px-3 py-2 ${fullWidth ?? 'w-full'} ${className ?? ''}`}
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
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
    }),
  ).isRequired,
  value: PropTypes.shape({
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    label: PropTypes.string,
  }),
  onChange: PropTypes.func.isRequired,
  fullWidth: PropTypes.bool,
};

export default Select;
