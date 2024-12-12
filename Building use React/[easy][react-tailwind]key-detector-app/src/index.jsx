import './index.css';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { Head, Root } from '@functional';

createRoot(document.getElementById('root')).render(
  <div className="min-h-screen w-full grid place-items-center p-2 bg-neutral-100">
    <Head
      description="A simple keyboard event listener that displays pressed key information"
      title="Key Event Listener"
      keywords="keyboard, event, listener, key press, React"
    />
    <Root />
    <Toaster />
  </div>,
);
