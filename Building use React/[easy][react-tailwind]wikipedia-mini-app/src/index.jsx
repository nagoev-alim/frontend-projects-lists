import './index.css';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { Head, Root } from '@functional';

createRoot(document.getElementById('root')).render(
  <div className="min-h-screen w-full grid place-items-start p-2 bg-neutral-200">
    <Head
      description="Search for information using Wikipedia API"
      title="Wiki Searcher"
      keywords="wikipedia, search, information, encyclopedia"
    />
    <Root />
    <Toaster />
  </div>,
);
