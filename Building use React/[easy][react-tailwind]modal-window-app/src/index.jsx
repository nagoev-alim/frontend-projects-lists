import './index.css';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { Head, Root } from '@functional';

createRoot(document.getElementById('root')).render(
  <div className="min-h-screen w-full grid place-items-center p-2 bg-neutral-100">
    <Head
      description="Interactive modal window component with overlay and content"
      title="Modal Window Demo"
      keywords="modal, overlay, react, web component, interactive"
    />
    <Root />
    <Toaster />
  </div>,
);
