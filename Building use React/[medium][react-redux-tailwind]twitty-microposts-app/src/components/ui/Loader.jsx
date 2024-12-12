import { square } from 'ldrs';

// Регистрация компонента square
square.register();

/**
 * @description Компонент Loader, отображающий анимированный индикатор загрузки
 * @returns {JSX.Element} Возвращает JSX элемент с анимированным квадратом
 */
const Loader = ({ containerProps }) => (
  <div className={`flex justify-center ${containerProps}`} aria-live="polite" aria-busy={true}>
    <l-square size="35" stroke="5" stroke-length="0.25" bg-opacity="0.1" speed="1.2" color="black"></l-square>
  </div>
)

export default Loader;
