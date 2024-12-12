import './index.css';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { Head, Root } from '@functional';

createRoot(document.getElementById('root')).render(
  <div className="min-h-screen w-full grid place-items-center p-2 bg-neutral-100">
    <Head
      description="A dynamic user search application with real-time filtering capabilities"
      title="User Search App"
      keywords="React, user search, filtering, real-time, Faker.js, debounce"
    />
    <Root />
    <Toaster />
  </div>,
);
