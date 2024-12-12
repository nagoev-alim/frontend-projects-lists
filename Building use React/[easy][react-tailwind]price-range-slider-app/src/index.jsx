import './index.css';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { Head, Root } from '@functional';

createRoot(document.getElementById('root')).render(
  <div className="min-h-screen w-full grid place-items-center p-2 bg-neutral-100">
    <Head
      description="Interactive price slider for selecting a price range"
      title="Price Range Slider"
      keywords="price slider, range selector, min-max price, interactive pricing"
    />
    <Root />
    <Toaster />
  </div>,
);
