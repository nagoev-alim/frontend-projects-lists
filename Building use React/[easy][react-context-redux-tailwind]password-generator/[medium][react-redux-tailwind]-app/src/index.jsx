import './index.css';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { Provider} from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { Head, PasswordGenerator } from '@functional';
import { persistor, store } from '@redux';

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <div className="min-h-screen w-full grid place-items-center bg-neutral-200">
        <Head
          description="A secure and customizable password generator tool"
          title="Password Generator"
          keywords="password, generator, security, random, strong password"
        />
        <PasswordGenerator />
        <Toaster />
      </div>
    </PersistGate>
  </Provider>,
);
