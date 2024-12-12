import './index.css';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { Head, Root } from '@functional';

createRoot(document.getElementById('root')).render(
  <div className="min-h-screen w-full grid place-items-center bg-neutral-200">
    <Head
      description="A relaxation app that guides you through breathing exercises"
      title="Breathing Relaxation App"
      keywords="relaxation, breathing, meditation, mindfulness, stress relief"
    />
    <Root />
    <Toaster />
  </div>,
);
