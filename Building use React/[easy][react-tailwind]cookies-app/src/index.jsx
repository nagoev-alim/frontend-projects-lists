import './index.css';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { Head, Root } from '@functional';

createRoot(document.getElementById('root')).render(
  <div className="min-h-screen w-full grid place-items-center bg-neutral-200">
    <Head
      description="This website uses cookies to enhance your browsing experience. Manage your cookie preferences."
      title="Cookie Consent"
      keywords="cookie consent, privacy, website cookies, user preferences"
    />
    <Root />
    <Toaster />
  </div>,
);
