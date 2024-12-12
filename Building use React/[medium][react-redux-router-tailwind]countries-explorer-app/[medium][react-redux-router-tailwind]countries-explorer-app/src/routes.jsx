import { useRoutes } from 'react-router-dom';
import { lazy } from 'react';


const HomePage = lazy(() => import('./pages/HomePage'));


const SinglePage = lazy(() => import('./pages/SinglePage'));


const NotFoundPage = () => (
  <div>
    <h1 className="text-center font-medium text-lg lg:text-4xl">Page not found</h1>
  </div>
);


const routeConfig = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: 'country/:name',
    element: <SinglePage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];


const Routes = () => useRoutes(routeConfig);

export default Routes;
