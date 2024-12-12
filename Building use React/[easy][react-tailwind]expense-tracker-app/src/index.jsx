import './index.css';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { Head, Root } from '@functional';

createRoot(document.getElementById('root')).render(
  <div className="min-h-screen w-full grid place-items-center p-2 bg-neutral-100">
    <Head
      description="Track your expenses and income with this simple Expense Tracker app"
      title="Expense Tracker"
      keywords="expense tracker, finance, budget, income, expenses"
    />
    <Root />
    <Toaster />
  </div>,
);
