import { PiHeartFill } from 'react-icons/pi';
import { Card } from '@/components/ui/card.tsx';

export const Footer = () => {
  return (
    <footer>
      <Card className='grid place-items-center text-center p-4 xl:px-0 gap-2'>
        <p>
          Copyright © {new Date().getFullYear()}. All rights reserved.
        </p>
        <p className='inline-flex gap-1'>
          Made with <PiHeartFill className="text-red-500" size={20} /> by{' '}
          <a href="https://github.com/nagoev-alim" target="_blank" className="text-blue-500 hover:underline">
            Nagoev Alim
          </a>
        </p>
      </Card>
    </footer>
  );
};

Footer.displayName = 'Footer';
