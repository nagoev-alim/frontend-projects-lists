import './index.css';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { Head, Root } from '@functional';

createRoot(document.getElementById('root')).render(
  <div className="min-h-screen w-full grid place-items-center bg-neutral-100">
    <Head
      description="A simple and interactive counter application built with React"
      title="React Counter App"
      keywords="React, counter, increment, decrement, reset, interactive"
    />
    <Root />
    <Toaster />
  </div>,
);
