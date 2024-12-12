import './index.css';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { Head, Root } from '@functional';

createRoot(document.getElementById('root')).render(
  <div className="min-h-screen w-full grid place-items-start p-2 bg-neutral-100">
    <Head
      description="Interactive product filtering application"
      title="Product Filter"
      keywords="products, filter, categories, interactive"
    />
    <Root />
    <Toaster />
  </div>,
);
