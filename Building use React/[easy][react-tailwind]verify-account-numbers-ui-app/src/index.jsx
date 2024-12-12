import './index.css';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { Head, Root } from '@functional';

createRoot(document.getElementById('root')).render(
  <div className="min-h-screen w-full grid place-items-center bg-neutral-200">
    <Head
      description="Verify your account by entering the six-digit code"
      title="Account Verification"
      keywords="account verification, security, authentication, six-digit code"
    />
    <Root />
    <Toaster />
  </div>,
);
