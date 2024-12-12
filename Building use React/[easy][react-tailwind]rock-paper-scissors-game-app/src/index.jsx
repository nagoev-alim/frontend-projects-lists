import './index.css';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { Head, Root } from '@functional';

createRoot(document.getElementById('root')).render(
  <div className="min-h-screen w-full grid place-items-center p-2 bg-neutral-100">
    <Head
      description="Play Rock, Paper, Scissors against the computer. Best of 3 attempts!"
      title="Rock Paper Scissors Game"
      keywords="rock, paper, scissors, game, react"
    />
    <Root />
    <Toaster />
  </div>,
);
