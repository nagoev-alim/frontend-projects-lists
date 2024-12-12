import './index.css';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { Head, Root } from '@functional';

createRoot(document.getElementById('root')).render(
  <div className="min-h-screen w-full grid place-items-center bg-neutral-200">
    <Head
      description="Our company statistics showing successful projects, working hours, and happy clients"
      title="Company Statistics"
      keywords="statistics, projects, working hours, clients, success"
    />
    <Root />
    <Toaster />
  </div>,
);
