import './index.css';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { Head, Root } from '@functional';

createRoot(document.getElementById('root')).render(
  <div className="min-h-screen w-full grid place-items-center bg-neutral-200">
    <Head
      description="A dice rolling game where two players compete to reach 100 points. Roll the dice, accumulate points, but be careful not to roll a 1!"
      title="Roll Dice Game"
      keywords="dice game, roll dice, two-player game, strategy, luck, 100 points"
    />
    <Root />
    <Toaster />
  </div>,
);
