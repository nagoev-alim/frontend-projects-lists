import './index.css';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { Head, Root } from '@functional';

createRoot(document.getElementById('root')).render(
  <div className="min-h-screen w-full grid place-items-center bg-neutral-200">
    <Head
      description="Interactive dropdown component with various options"
      title="Dropdown UI Component"
      keywords="React, dropdown, UI component, interactive menu"
    />
    <Root />
    <Toaster />
  </div>,
);
