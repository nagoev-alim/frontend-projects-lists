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
        <title>Jobs Filter App | Find Your Perfect Job</title>
        <meta name="description"
              content="Explore and filter job opportunities easily with our Jobs Filter App. Find the perfect position matching your skills and preferences." />
        <meta name="keywords" content="jobs, filter, career, employment, job search, job listings, job opportunities" />
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
