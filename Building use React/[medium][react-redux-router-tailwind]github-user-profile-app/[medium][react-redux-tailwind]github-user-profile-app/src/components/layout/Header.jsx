import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FiMoon, FiSun } from 'react-icons/fi';
import { LANG } from '../../lang';
import { themeSelectors } from '../../features/theme';
import { toggleTheme } from '../../features/theme/themeSlice.js';


const Header = () => {
  const dispatch = useDispatch();
 
  const theme = useSelector(themeSelectors.selectTheme);

  
  useEffect(() => {
    const action = theme === 'dark' ? 'add' : 'remove';
    document.documentElement.classList[action]('dark');
  }, [theme]);

  return (
    <header
      className="bg-white border-b-2 p-3 dark:text-white dark:bg-neutral-600 dark:border-b-neutral-800 transition-colors">
      <nav className="max-w-6xl w-full mx-auto px-2 flex flex-wrap justify-between items-center">
        {}
        <Link className="font-medium text-sm sm:text-xl" to="/">{LANG.header.title}</Link>
        {}
        <button
          className="text-sm flex gap-1.5 items-center sm:text-base"
          onClick={() => dispatch(toggleTheme())}
        >
          {}
          {theme === 'light' ? <FiSun size={20} /> : <FiMoon size={20} />}
        </button>
      </nav>
    </header>
  );
};

export default Header;
