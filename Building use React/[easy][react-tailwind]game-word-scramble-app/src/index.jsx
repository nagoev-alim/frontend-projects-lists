import './index.css';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { Head, Root } from '@functional';

createRoot(document.getElementById('root')).render(
  <div className="min-h-screen w-full grid place-items-center p-2 bg-neutral-100">
    <Head
      description="A word scramble game where you unscramble words against the clock"
      title="Word Scramble Game"
      keywords="word game, scramble, puzzle, vocabulary, time challenge"
    />
    <Root />
    <Toaster />
  </div>,
);
