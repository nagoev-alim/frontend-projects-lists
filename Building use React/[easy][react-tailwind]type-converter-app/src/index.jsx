import './index.css';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { Head, Root } from '@functional';

createRoot(document.getElementById('root')).render(
  <div className="min-h-screen w-full grid place-items-center bg-neutral-100">
    <Head
      description="A versatile type converter for weight, temperature, and more. Convert between different units of measurement quickly and easily."
      title="Type Converter | Unit Conversion Tool"
      keywords="converter, type converter, unit conversion, weight, temperature, measurement, calculator"
    />
    <Root />
    <Toaster />
  </div>,
);
