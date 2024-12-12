import './index.css';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { Head, Root } from '@functional';

createRoot(document.getElementById('root')).render(
  <div className="min-h-screen w-full grid place-items-center p-2 bg-neutral-100">
    <Head
      description="Save your text as various file types"
      title="Save Text As File"
      keywords="text, file, save, download, converter"
    />
    <Root />
    <Toaster />
  </div>,
);
