import './index.css';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { Head, Root } from '@functional';

createRoot(document.getElementById('root')).render(
  <div className="min-h-screen w-full grid place-items-center bg-neutral-200">
    <Head
      description="Generate random quotes from various sources"
      title="Quote Generator"
      keywords="quotes, random quotes, inspirational quotes, quote generator"
    />
    <Root />
    <Toaster />
  </div>,
);
