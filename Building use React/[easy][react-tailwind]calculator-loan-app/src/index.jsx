import './index.css';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { Head, Root } from '@functional';

createRoot(document.getElementById('root')).render(
  <div className="min-h-screen w-full grid place-items-center bg-neutral-200">
    <Head
      description="Calculate your loan payments with our easy-to-use Loan Calculator"
      title="Loan Calculator"
      keywords="loan, calculator, finance, mortgage, interest, repayment"
    />
    <Root />
    <Toaster />
  </div>,
);
