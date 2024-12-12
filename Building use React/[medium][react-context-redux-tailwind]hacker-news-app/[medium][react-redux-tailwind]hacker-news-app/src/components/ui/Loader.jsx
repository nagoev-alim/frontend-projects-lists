import { square } from 'ldrs';
import PropTypes from 'prop-types';

// Регистрация компонента square из библиотеки ldrs
square.register();

/**
 * Компонент Loader - отображает анимированный индикатор загрузки.
 *
 * @param {Object} props - Свойства компонента.
 * @param {boolean} [props.isLoading=false] - Флаг, указывающий, нужно ли отображать индикатор загрузки.
 * @returns {React.ReactElement|null} Возвращает JSX элемент индикатора загрузки или null, если isLoading равно false.
 */
const Loader = ({ isLoading = false }) => {
 
  // Если isLoading равно false, компонент не отображается
  if (!isLoading) return null;

  return (
    <div
      className="flex justify-center"
      aria-live="polite"
      aria-busy={true}
    >
      {/* Пустые фигурные скобки могут быть удалены, если они не используются */}
      <l-square
        size="35"
        stroke="5"
        stroke-length="0.25"
        bg-opacity="0.1"
        speed="1.2"
        color="black"
      ></l-square>
    </div>
  );
};

// Определение типов props с использованием PropTypes
Loader.propTypes = {
  isLoading: PropTypes.bool,
};

export default Loader;
