import './index.css';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { Head, Root } from '@functional';

createRoot(document.getElementById('root')).render(
  <div className="min-h-screen w-full grid place-items-center p-2 bg-neutral-100">
    <Head
      description="A currency converter application that allows users to convert between different currencies and view exchange rates."
      title="Currency Converter"
      keywords="currency converter, exchange rates, USD, RUB, financial tool"
    />
    <Root />
    <Toaster />
  </div>,
);