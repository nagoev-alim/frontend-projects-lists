import './index.css';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { Toaster } from 'react-hot-toast';
import { persistor, store } from '@store';
import { Head, Root } from '@functional';

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <div className="min-h-screen w-full grid place-items-center bg-neutral-200">
        <Head
          description="Interactive quiz application with customizable settings"
          title="Quiz App"
          keywords="quiz, trivia, questions, learning, education"
        />
        <Root />
        <Toaster />
      </div>
    </PersistGate>
  </Provider>,
);
