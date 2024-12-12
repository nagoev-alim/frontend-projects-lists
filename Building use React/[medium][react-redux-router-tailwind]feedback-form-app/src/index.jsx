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
      <div className="min-h-screen bg-neutral-100">
        <Head
          description=""
          title=""
          keywords=""
        />
        <Root />
        <Toaster />
      </div>
    </PersistGate>
  </Provider>,
);
