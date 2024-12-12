import './index.css';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { Head, Root } from '@functional';

createRoot(document.getElementById('root')).render(
  <div className="min-h-screen w-full grid place-items-center bg-neutral-200">
    <Head
      description="A typewriter effect demonstration showcasing dynamic text animation"
      title="Typewriter Effect Demo"
      keywords="typewriter, animation, React, dynamic text, developer, designer, creator"
    />
    <Root />
    <Toaster />
  </div>,
);
