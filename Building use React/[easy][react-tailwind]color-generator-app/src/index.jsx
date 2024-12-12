import './index.css';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { Head, Root } from '@functional';

createRoot(document.getElementById('root')).render(
  <div className="min-h-screen w-full grid place-items-center bg-neutral-100">
    <Head
      description="A simple color generator tool that creates random HEX colors"
      title="Color Generator"
      keywords="color generator, random color, HEX color, web tool"
    />
    <Root />
    <Toaster />
  </div>,
);
