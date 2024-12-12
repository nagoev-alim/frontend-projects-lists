import { Link } from 'react-router-dom';
import { LANG } from '../../lang';

/**
 * Компонент заголовка приложения.
 * @component
 * @returns {JSX.Element} Отрендеренный компонент заголовка.
 * 
 * @description
 * Этот компонент отображает заголовок приложения, который включает в себя
 * навигационную ссылку на главную страницу. Он использует стили для
 * центрирования содержимого и адаптивного отображения на различных устройствах.
 */
const Header = () => (
  <header className="bg-white border-b-2 p-3">
    <nav className="max-w-6xl w-full mx-auto flex justify-center">
      {/* Ссылка на главную страницу */}
      <Link className="font-bold text-md sm:text-xl" to="/">
        {LANG.header.title}
      </Link>
    </nav>
  </header>
);

export default Header;
