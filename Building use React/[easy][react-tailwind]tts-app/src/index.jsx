import './index.css';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { Head, Root } from '@functional';

createRoot(document.getElementById('root')).render(
  <div className="min-h-screen w-full grid place-items-center bg-neutral-200">
    <Head
      description="Convert text to speech with customizable voices"
      title="Text To Speech Converter"
      keywords="text to speech, TTS, voice synthesis, speech synthesis, accessibility"
    />
    <Root />
    <Toaster />
  </div>,
);
