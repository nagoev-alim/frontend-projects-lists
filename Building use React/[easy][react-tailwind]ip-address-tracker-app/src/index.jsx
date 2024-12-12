import './index.css';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { Head, Root } from '@functional';

createRoot(document.getElementById('root')).render(
  <div className="min-h-screen w-full grid place-items-center bg-neutral-200">
    <Head
      description="Track and locate IP addresses with our user-friendly IP Address Tracker. Get detailed information about any IP address including location, timezone, and ISP."
      title="IP Address Tracker | Locate and Track IP Addresses"
      keywords="IP address tracker, geolocation, IP lookup, ISP information, timezone finder"
    />
    <Root />
    <Toaster />
  </div>,
);
