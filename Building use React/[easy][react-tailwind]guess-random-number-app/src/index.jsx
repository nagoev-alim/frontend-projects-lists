import './index.css';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { Head, Root } from '@functional';

createRoot(document.getElementById('root')).render(
  <div className="min-h-screen w-full grid place-items-center bg-neutral-100">
      <Head
      description="Play the exciting 'Guess the Number' game. Try to guess a number between 1 and 10 in as few attempts as possible."
      title="Guess the Number Game"
      keywords="guess the number, number guessing game, React game, interactive game, browser game"
    />
    <Root />
    <Toaster />
  </div>,
);
