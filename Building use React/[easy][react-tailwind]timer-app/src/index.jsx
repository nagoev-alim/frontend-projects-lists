import './index.css';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { Head, Root } from '@functional';

createRoot(document.getElementById('root')).render(
  <div className="min-h-screen w-full grid place-items-center p-2 bg-neutral-100">
    <Head
      description="An interactive countdown timer application that allows users to set and track custom timers"
      title="Countdown Timer"
      keywords="countdown, timer, react, web application, time management"
    />
    <Root />
    <Toaster />
  </div>,
);
