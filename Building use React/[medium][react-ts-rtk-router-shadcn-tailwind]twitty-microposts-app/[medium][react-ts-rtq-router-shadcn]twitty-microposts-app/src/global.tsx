import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import './global.css';
import router from '@/routes.tsx';
import { Provider } from 'react-redux';
import { Toaster } from '@/components/ui/toaster';
import { store } from '@/app/store.ts';
import { ThemeProvider } from '@/components/layout/ThemeProvider.tsx';

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  </Provider>,
);
