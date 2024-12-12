import './index.css';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { Head, Root } from '@functional';

createRoot(document.getElementById('root')).render(
  <div className="min-h-screen w-full grid place-items-center bg-neutral-200">
    <Head
      description="Toast Notification App - Manage and display custom notifications"
      title="Toast Notification Demo"
      keywords="toast, notification, react, demo, custom alerts"
    />
    <Root />
    <Toaster />
  </div>,
);
