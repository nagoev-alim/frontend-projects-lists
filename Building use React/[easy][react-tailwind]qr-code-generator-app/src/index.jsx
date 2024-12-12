import './index.css';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { Head, Root } from '@functional';

createRoot(document.getElementById('root')).render(
  <div className="min-h-screen w-full grid place-items-center p-2 bg-neutral-100">
    <Head
      description="Generate QR codes easily with customizable size and content"
      title="QR Code Generator"
      keywords="QR code, generator, React, web app"
    />
    <Root />
    <Toaster />
  </div>,
);
