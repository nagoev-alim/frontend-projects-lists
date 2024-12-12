import './index.css';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { Head, Root } from '@functional';

createRoot(document.getElementById('root')).render(
  <div className="min-h-screen w-full grid place-items-center p-2 bg-neutral-100">
    <Head
      description="An interactive color finder application that allows users to select and get information about colors"
      title="Color Finder"
      keywords="color picker, color information, hex color, color name"
    />
    <Root />
    <Toaster />
  </div>,
);
