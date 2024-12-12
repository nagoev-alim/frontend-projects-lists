import './index.css';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { Head, Root } from '@functional';

createRoot(document.getElementById('root')).render(
  <div className="min-h-screen w-full grid place-items-center bg-neutral-200">
    <Head
      description="Convert YouTube videos to MP3 format easily and quickly"
      title="YouTube to MP3 Converter"
      keywords="YouTube, MP3, converter, audio, download, music"
    />
    <Root />
    <Toaster />
  </div>,
);
