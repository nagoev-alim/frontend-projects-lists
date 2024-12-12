import { Link } from 'react-router-dom';
import { SiHomebrew } from 'react-icons/si';

const Header = () => (
  <header className="bg-white border-b-2 p-3">
    <nav className="max-w-6xl w-full mx-auto flex flex-wrap items-center justify-center gap-2">
      <Link to="/" className="inline-flex items-center font-bold text-xl">
        Brewery <SiHomebrew /> Finder
      </Link>
    </nav>
  </header>
);

export default Header;
