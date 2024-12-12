import './index.css';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { Head, Root } from '@functional';

createRoot(document.getElementById('root')).render(
  <div className="min-h-screen w-full grid place-items-center bg-neutral-200">
    <Head
      description="Translate text between multiple languages with ease"
      title="Online Translator"
      keywords="translator, language, translation, online tool"
    />
    <Root />
    <Toaster />
  </div>,
);
