import './index.css';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { Head, Root } from '@functional';

createRoot(document.getElementById('root')).render(
  <div className="min-h-screen w-full grid place-items-start bg-neutral-200">
    <Head
      description="Search and explore various APIs across different categories"
      title="API Search Tool"
      keywords="API, search, categories, programming, development, tools"
    />
    <Root />
    <Toaster />
  </div>,
);
