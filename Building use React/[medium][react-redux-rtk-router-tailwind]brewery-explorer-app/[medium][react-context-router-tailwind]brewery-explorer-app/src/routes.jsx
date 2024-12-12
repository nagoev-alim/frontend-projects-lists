/**
 * @module Routes
 * @description Модуль, отвечающий за конфигурацию и определение маршрутов приложения.
 * Использует react-router-dom для маршрутизации и React.lazy для оптимизации загрузки компонентов.
 */

import { useRoutes } from 'react-router-dom';
import { lazy } from 'react';

// Lazy-loaded components
const HomePage = lazy(() => import('./pages/HomePage'));
const SinglePage = lazy(() => import('./pages/SinglePage'));

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
    element: (
      <div>
        <h1 className="text-center font-medium text-lg lg:text-4xl">Page not found</h1>
      </div>
    ),
  },
];

/**
 * Компонент Routes
 * @function Routes
 * @description Компонент, определяющий структуру маршрутизации приложения.
 * Использует хук useRoutes из react-router-dom для создания маршрутов на основе конфигурации.
 *
 * @returns {React.ReactElement} Возвращает элемент React, представляющий структуру маршрутизации.
 */
const Routes = () => useRoutes(routeConfig);

export default Routes;
