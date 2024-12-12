import './index.css';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { RouterProvider } from 'react-router-dom';
import { store } from '@store';
import router from '@routes';
import { Loader } from '@ui';

const ErrorBoundary = () => {
  return (
    <div className="text-center">
      <h1 className="text-2xl font-bold mb-4">Oops! Something went wrong.</h1>
      <p>We're sorry, but an unexpected error occurred. Please try again later.</p>
    </div>
  );
};

const Root = () => (
  <Suspense fallback={<Loader />}>
    <RouterProvider
      router={router}
      fallbackElement={<Loader />}
      errorElement={<ErrorBoundary />}
    />
  </Suspense>
);

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <div className="min-h-screen w-full grid place-items-center bg-neutral-200">
      <HelmetProvider>
        <Helmet>
          <title>Brewery Finder | Explore Local and Craft Breweries</title>
          <meta name="description" content="Discover and explore a variety of breweries with our comprehensive brewery finder application" />
          <meta property="og:title" content="Brewery Finder | Explore Local and Craft Breweries" />
          <meta name="keywords" content="brewery, craft beer, local breweries, beer, brewery finder, brewery search" />
        </Helmet>
      </HelmetProvider>
      <Root />
      <Toaster />
    </div>
  </Provider>,
);
