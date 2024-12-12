import './index.css';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { Head, Root } from '@functional';

createRoot(document.getElementById('root')).render(
  <div className="min-h-screen w-full grid place-items-center bg-neutral-200">
    <Head
      description="Interactive drum kit application with keyboard and mouse support"
      title="Drum Kit App"
      keywords="drum, kit, music, interactive, web application"
    />
    <Root />
    <Toaster />
  </div>,
);
