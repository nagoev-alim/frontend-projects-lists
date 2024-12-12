import './index.css';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { Head, Root } from '@functional';

createRoot(document.getElementById('root')).render(
  <div className="min-h-screen w-full grid place-items-start p-2 bg-neutral-100">
    <Head
      description="A web application that displays a paginated list of GitHub users"
      title="GitHub Users List"
      keywords="GitHub, users, pagination, React"
    />
    <Root />
    <Toaster />
  </div>,
);
