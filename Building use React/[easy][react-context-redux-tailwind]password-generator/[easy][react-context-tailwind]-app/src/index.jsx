import './index.css';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { PasswordGeneratorProvider } from '@context';
import { Head, PasswordGenerator } from '@functional';

createRoot(document.getElementById('root')).render(
  <PasswordGeneratorProvider>
    <div className="min-h-screen w-full grid place-items-center bg-neutral-200">
      <Head
        description="A secure and customizable password generator tool"
        title="Password Generator"
        keywords="password, generator, security, random, strong password"
      />
      <PasswordGenerator />
      <Toaster />
    </div>
  </PasswordGeneratorProvider>,
);
