import PropTypes from 'prop-types';


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
