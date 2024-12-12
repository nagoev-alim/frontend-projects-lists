import { lazy, Suspense } from 'react';
import { createBrowserRouter, Outlet, RouteObject } from 'react-router-dom';
import { Spinner } from '@/components/ui';
import { Body, Header, Main, Footer } from '@/components/layout';
import { Helmet, HelmetProvider } from 'react-helmet-async';

const HomePage = lazy(() => import('./pages/HomePage'));
const DetailPage = lazy(() => import('./pages/DetailPage'));
const AbourPage = lazy(() => import('./pages/AboutPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const RootLayout = () => (
  <Body>
    <HelmetProvider>
      <Helmet>
        <title>GitHub User Finder | Explore Developer Profiles</title>
        <meta name="description"
              content="Discover and explore GitHub user profiles with our comprehensive GitHub User Finder application" />
        <meta name="keywords"
              content="GitHub, user profiles, developers, code repositories, open source, programming" />
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
      { path: 'user/:username', element: <DetailPage /> },
      { path: 'about', element: <AbourPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

const router = createBrowserRouter(routes);

export default router;
