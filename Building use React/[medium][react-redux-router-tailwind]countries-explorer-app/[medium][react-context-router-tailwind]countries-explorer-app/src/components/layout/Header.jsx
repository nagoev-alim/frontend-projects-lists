/**
 * @module Header
 * @description Модуль содержит компонент Header, который отображает верхнюю часть страницы с навигацией и переключателем темы.
 */

import { Link } from 'react-router-dom';
import { FiMoon, FiSun } from 'react-icons/fi';
import { themeActions } from '../../context/index.js';
import { useThemeContext } from '../../hooks/index.js';
import { capitalizeFirstLetter } from '../../utils/index.js';

/**
 * @function Header
 * @description Компонент Header отображает верхнюю часть страницы, включая навигационную ссылку и кнопку переключения темы.
 * 
 * @returns {JSX.Element} Возвращает JSX элемент, представляющий верхнюю часть страницы.
 * 
 * @description
 * Компонент использует следующие хуки и данные:
 * - useThemeContext: Хук для доступа к текущей теме и функции dispatch для ее изменения.
 * - themeActions.handleSetTheme: Действие для изменения темы.
 * 
 * Отображаемые элементы пользовательского интерфейса:
 * - Ссылка "Countries" для навигации на главную страницу.
 * - Кнопка переключения темы с иконкой (солнце или луна) и текстом, отображающим текущую тему.
 * 
 * Оптимизация производительности:
 * - Использование useThemeContext предотвращает ненужные ререндеры, 
 *   так как компонент будет обновляться только при изменении темы.
 * - Функция toggleTheme определена внутри компонента, но не будет пересоздаваться 
 *   при каждом рендере, так как не зависит от пропсов или состояния.
 */
const Header = () => {
  const { theme, dispatch } = useThemeContext();
  const { handleSetTheme } = themeActions;

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    handleSetTheme(dispatch, newTheme);
  };

  return (
    <header className="bg-white border-b-2 p-3 dark:text-white dark:bg-neutral-600 dark:border-b-neutral-800 transition-colors">
      <nav className="max-w-6xl w-full mx-auto px-2 flex flex-wrap justify-between items-center">
        <Link className="font-medium text-sm sm:text-2xl" to="/">Countries</Link>
        <button
          className="text-sm flex gap-1.5 items-center sm:text-base"
          onClick={toggleTheme}
        >
          {theme === 'light' ? <FiSun size={20} /> : <FiMoon size={20} />}
        </button>
      </nav>
    </header>
  );
};

export default Header;
