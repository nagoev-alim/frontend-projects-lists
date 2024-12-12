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
      <div className="min-h-screen w-full grid place-items-center bg-neutral-100">
        <Head
          description="A Firebase-based Todo application built with React"
          title="Firebase Todos"
          keywords="React, Firebase, Todo, Task Management"
        />
        <Root />
        <Toaster />
      </div>
    </PersistGate>
  </Provider>,
);
