import './index.css';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { Head, Root } from '@functional';

createRoot(document.getElementById('root')).render(
  <div className="min-h-screen w-full grid place-items-center bg-neutral-200">
    <Head
      description="Track and manage your workouts with this simple and effective workout tracker"
      title="Workout Tracker"
      keywords="workout, fitness, tracking, exercise, health"
    />
    <Root />
    <Toaster />
  </div>,
);
