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
        <title>TheMeal Explorer</title>
        <meta name="description"
              content="Discover and explore a world of culinary delights with our extensive meal database. Find recipes, ingredients, and cooking instructions for your favorite dishes from around the globe." />
        <meta name="keywords"
              content="meals, recipes, cooking, cuisine, ingredients, food, dishes, international cuisine" />
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
      { path: 'meal/:id', element: <DetailPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

const router = createBrowserRouter(routes);

export default router;
