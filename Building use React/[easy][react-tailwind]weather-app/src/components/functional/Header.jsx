import { LANG } from '../../lang';

const Header = () => {
  return (
    <header
      className="header">
      <nav className="nav">
        <h1 className="font-medium text-sm sm:text-xl" >
          {LANG.HEADER.title}
        </h1>
      </nav>
    </header>
  );
};

export default Header;
