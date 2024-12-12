import PropTypes from 'prop-types';

const Button = ({
  children,
  type = 'button',
  className = '',
  onClick,
}) => (
  <button
    className={`button ${className}`.trim()}
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
