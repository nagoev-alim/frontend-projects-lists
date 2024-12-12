import './index.css';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { Head, Root } from '@functional';

createRoot(document.getElementById('root')).render(
  <div className="min-h-screen w-full grid place-items-center bg-neutral-200">
    <Head
      description="A simple and efficient calculator app built with React"
      title="React Calculator"
      keywords="calculator, react, math, arithmetic, web app"
    />
    <Root />
    <Toaster />
  </div>,
);
