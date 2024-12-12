import './index.css';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { Head, Root } from '@functional';

createRoot(document.getElementById('root')).render(
  <div className="min-h-screen w-full grid place-items-center bg-neutral-200">
    <Head
      description="Test your typing speed and accuracy with this interactive typing speed test."
      title="Typing Speed Test"
      keywords="typing, speed test, wpm, cpm, accuracy, typing skills"
    />
    <Root />
    <Toaster />
  </div>,
);
