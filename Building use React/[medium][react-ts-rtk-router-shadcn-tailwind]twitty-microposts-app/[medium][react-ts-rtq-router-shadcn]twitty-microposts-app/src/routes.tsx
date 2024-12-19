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
        <title>Twitty Microposts</title>
        <meta name="description"
              content="Twitty Microposts - a modern microblogging platform for creating and sharing short posts. Share your thoughts easily and quickly!" />
        <meta name="keywords" content="microblog, posts, tweets, social network, React, TypeScript" />
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
