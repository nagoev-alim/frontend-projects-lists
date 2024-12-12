import { lazy } from 'react';
import { createBrowserRouter, Outlet } from 'react-router-dom';
import { Header } from '@layout';

const HomePage = lazy(() => import('./pages/HomePage/HomePage'));
const DetailPage = lazy(() => import('./pages/DetailPage/DetailPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage/NotFoundPage'));

const RootLayout = () => (
  <div className="min-h-screen w-full flex flex-col">
    <Header />
    <main className="flex-grow flex flex-col py-4 px-3 xl:px-0 max-w-6xl w-full mx-auto">
      <Outlet />
    </main>
  </div>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'user/:id',
        element: <DetailPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);

export default router;
