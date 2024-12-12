import { lazy, Suspense } from 'react';
import { createBrowserRouter, Outlet, RouteObject } from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { Spinner } from '@/components/ui';
import { Body, Header, Main, Footer } from '@/components/layout';

const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const RootLayout = () => (
  <Body>
    <HelmetProvider>
      <Helmet>
        <title>Application Title</title>
        <meta name="description" content="Application description" />
        <meta name="keywords" content="Application keywords" />
      </Helmet>
    </HelmetProvider>
    <Header />
    <Main>
      <Suspense fallback={<Spinner />}>
        <Outlet />
      </Suspense>
    </Main>
    <Footer />
  </Body>
);

const routes: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'about', element: <AboutPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

const router = createBrowserRouter(routes);

export default router;
