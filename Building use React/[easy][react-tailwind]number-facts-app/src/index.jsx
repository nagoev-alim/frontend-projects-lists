import './index.css';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { Head, NumberFacts } from '@functional';

createRoot(document.getElementById('root')).render(
  <div className="min-h-screen w-full grid place-items-center bg-neutral-200">
    <Head
      description="Discover interesting facts about numbers with our Number Facts app"
      title="Number Facts | Fun Number Trivia"
      keywords="numbers, facts, trivia, math, education"
    />
    <NumberFacts />
    <Toaster />
  </div>,
);
