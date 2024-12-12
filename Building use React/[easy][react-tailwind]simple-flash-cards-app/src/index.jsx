import './index.css';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { Head, Root } from '@functional';

createRoot(document.getElementById('root')).render(
  <div className="min-h-screen w-full grid place-items-center p-2 bg-neutral-100">
    <Head
      description="Interactive Flash Cards for React learning"
      title="React Flash Cards"
      keywords="React, Flash Cards, Learning, JavaScript, Web Development"
    />
    <Root />
    <Toaster />
  </div>,
);
