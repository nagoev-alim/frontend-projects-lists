import { useRoutes } from 'react-router-dom';
import { lazy } from 'react';

/**
 * Ленивая загрузка компонента домашней страницы.
 */
const HomePage = lazy(() => import('./pages/HomePage'));

/**
 * Ленивая загрузка компонента страницы с подробной информацией.
 * @type {React.LazyExoticComponent<React.ComponentType<any>>}
 */
const SinglePage = lazy(() => import('./pages/SinglePage'));

/**
 * Компонент для отображения страницы 404 (Не найдено).
 * @returns {JSX.Element} Элемент React, представляющий страницу 404.
 */
const NotFoundPage = () => (
  <div>
    <h1 className="text-center font-medium text-lg lg:text-4xl">Page not found</h1>
  </div>
);

/**
 * Конфигурация маршрутов приложения.
 * @type {Array<Object>}
 */
const routeConfig = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: 'brewery/:id',
    element: <SinglePage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];

/**
 * Компонент для рендеринга маршрутов приложения.
 * Использует хук useRoutes для создания элемента маршрутизации на основе конфигурации.
 * @returns {React.ReactElement|null} Элемент React, представляющий текущий маршрут, или null.
 */
const Routes = () => useRoutes(routeConfig);

export default Routes;
