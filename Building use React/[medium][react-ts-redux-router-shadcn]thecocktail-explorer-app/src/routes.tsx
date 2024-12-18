import { lazy, Suspense } from 'react';
import { createBrowserRouter, Outlet, RouteObject } from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { Spinner } from '@/components/ui';
import { Body, Header, Main, Footer } from '@/components/layout';

const HomePage = lazy(() => import('./pages/HomePage'));
const DetailPage = lazy(() => import('./pages/DetailPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const RootLayout = () => (
  <Body>
    <HelmetProvider>
      <Helmet>
        <title>Cocktail Explorer</title>
        <meta name="description"
              content="Discover and explore a world of cocktails with our extensive database. Find recipes, ingredients, and mixing instructions for your favorite drinks." />
        <meta name="keywords" content="cocktails, drinks, mixology, recipes, bartending, alcohol, beverages" />
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
      { path: 'cocktail/:id', element: <DetailPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

const router = createBrowserRouter(routes);

export default router;
