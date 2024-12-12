import './index.css';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { Head, Root } from '@functional';

createRoot(document.getElementById('root')).render(
  <div className="min-h-screen w-full grid place-items-center bg-neutral-200">
    <Head
      description="A sortable table application displaying user data"
      title="Sortable Table"
      keywords="table, sort, user data, React"
    />
    <Root />
    <Toaster />
  </div>,
);
