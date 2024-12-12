import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authActions, authSelectors } from '@features';
import { MdExitToApp } from 'react-icons/md';
import { SiTodoist } from 'react-icons/si';

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(authSelectors.selectAuthData);

  const handleLogout = () => {
    dispatch(authActions.logout());
    navigate('/');
  };

  return (
    <header className="bg-white border-b-2 p-3">
      <nav className="max-w-6xl w-full mx-auto flex flex-wrap items-center justify-between gap-2">
        <Link to="/" className="inline-flex gap-1 items-center font-bold text-xl">
          <SiTodoist size={20} />
          Todos
        </Link>
        {isAuthenticated && (
          <button onClick={handleLogout} className="flex items-center gap-2 font-bold text-red-600">
            <MdExitToApp size={20} />
            <span>Выйти</span>
          </button>
        )}
      </nav>
    </header>
  );
};

export default Header;
