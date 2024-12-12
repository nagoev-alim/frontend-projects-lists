import './index.css';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { Head, Root } from '@functional';

createRoot(document.getElementById('root')).render(
  <div className="min-h-screen w-full grid place-items-center p-2 bg-neutral-100">
    <Head
      description="A simple stopwatch application that allows you to start, pause, and reset time"
      title="StopWatch App"
      keywords="stopwatch, timer, react, web application"
    />
    <Root />
    <Toaster />
  </div>,
);
