import { Link } from 'react-router-dom';
import { LANG } from '../../lang/index';

/**
 * Компонент Header.
 * 
 * @component
 * @description Отображает шапку приложения с навигационной ссылкой на главную страницу.
 * Компонент использует стили Tailwind CSS для оформления.
 * 
 * @returns {JSX.Element} Возвращает JSX элемент, представляющий шапку приложения.
 */
const Header = () => (
  // Контейнер шапки с белым фоном и нижней границей
  <header className="bg-white border-b-2 p-3">
    {/* Навигационное меню с максимальной шириной и центрированием */}
    <nav className="max-w-6xl w-full mx-auto flex justify-center">
      {/* Ссылка на главную страницу с адаптивным размером шрифта */}
      <Link className="font-bold text-md sm:text-xl" to="/">
        {LANG.header.title}
      </Link>
    </nav>
  </header>
);

export default Header;
