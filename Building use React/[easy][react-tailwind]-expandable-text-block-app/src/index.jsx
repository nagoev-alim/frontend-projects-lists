import './index.css';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { Head, Root } from '@functional';

createRoot(document.getElementById('root')).render(
  <div className="min-h-screen w-full grid place-items-center p-2 bg-neutral-100">
    <Head
      description="Interactive expandable text component showcasing space travel content"
      title="Text Expander Demo"
      keywords="expandable text, space travel, interactive content, React component"
    />
    <Root />
    <Toaster />
  </div>,
);
