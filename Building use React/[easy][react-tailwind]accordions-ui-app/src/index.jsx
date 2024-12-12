import './index.css';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { Head, Root } from '@functional';

createRoot(document.getElementById('root')).render(
  <div className="min-h-screen w-full grid place-items-center p-2 bg-neutral-100">
    <Head
      description="Interactive accordion component with customizable behavior"
      title="React Accordion Component"
      keywords="React, accordion, interactive, customizable, component"
    />
    <Root />
    <Toaster />
  </div>,
);
