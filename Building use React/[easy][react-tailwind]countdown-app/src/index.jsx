import './index.css';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { Head, Root } from '@functional';

createRoot(document.getElementById('root')).render(
  <div className="min-h-screen w-full grid place-items-center bg-neutral-100">
    <Head
      description="Interactive countdown timer application"
      title="Countdown Timer"
      keywords="countdown, timer, react, web application"
    />
    <Root />
    <Toaster />
  </div>,
);
