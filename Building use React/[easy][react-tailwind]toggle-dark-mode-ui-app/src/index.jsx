import './index.css';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { Head, Root } from '@functional';

createRoot(document.getElementById('root')).render(
  <div className="min-h-screen w-full grid place-items-center p-2 bg-neutral-100">
    <Head
      description="Experience our app with customizable dark and light themes for optimal viewing comfort."
      title="Theme Switcher - Dark Mode and Light Mode"
      keywords="dark mode, light mode, theme switcher, user interface, accessibility"
    />
    <Root />
    <Toaster />
  </div>,
);
