import { Link } from 'react-router-dom';
import { VscGithub } from 'react-icons/vsc';
import { Button } from '@/components/ui/button.tsx';
import { ModeToggle } from '@/components/layout/ModeToggle.tsx';
import { Card } from '@/components/ui/card.tsx';
import { Cart } from '../common';
import { useSelector } from 'react-redux';
import { cartSlice } from '@features/cart/cartSlice';

export const Header = () => {
  const cartItems = useSelector(cartSlice.selectors.cartItems);

  return (
    <header>
      <Card>
        <nav className="grid gap-2.5 md:flex md:justify-between md:items-center p-4 xl:px-0 max-w-6xl w-full mx-auto">
          <div className="grid place-items-center md:inline-flex items-center gap-2">
            <Link to="https://github.com/nagoev-alim" aria-label="GitHub Profile" target="_blank">
              <VscGithub size={30} />
            </Link>
            <Link className="font-semibold" to="/">Mobile Store Cart App</Link>
          </div>
          <ul className="flex gap-2 justify-center items-center">
            <li>
              <Link to="/about">
                <Button>About</Button>
              </Link>
            </li>
            <li>
              <ModeToggle />
            </li>
            {cartItems.length > 0 && (
              <li className="flex gap-1.5 items-center">
                <Cart />
              </li>
            )}
          </ul>
        </nav>
      </Card>
    </header>
  );
};

Header.displayName = 'Header';
