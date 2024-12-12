import './index.css';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { Head, Root } from '@functional';

createRoot(document.getElementById('root')).render(
  <div className="min-h-screen w-full grid place-items-center p-2 bg-neutral-100">
    <Head
      description="Image editor with filters, rotation, and flip features"
      title="Image Editor"
      keywords="image editor, filters, brightness, saturation, inversion, grayscale, rotate, flip"
    />
    <Root />
    <Toaster />
  </div>,
);
