import './index.css';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { Head, Root } from '@functional';

createRoot(document.getElementById('root')).render(
  <div className="min-h-screen w-full grid place-items-center p-2 bg-neutral-100">
    <Head
      description="Generate random user data with interactive category selection"
      title="Random User Generator"
      keywords="random user, user generator, profile data, interactive categories"
    />
    <Root />
    <Toaster />
  </div>,
);
