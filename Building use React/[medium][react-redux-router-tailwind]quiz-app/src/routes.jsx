/**
 * @module routes
 * @description Модуль, определяющий маршрутизацию приложения и компоненты защищенных маршрутов.
 * Он использует react-router-dom для создания маршрутов и Redux для управления состоянием аутентификации.
 */

import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@layout';

const QuizSettingsPage = lazy(() => import('./pages/QuizSettingsPage/QuizSettingsPage'));
const QuizPage = lazy(() => import('./pages/QuizPage/QuizPage'));
const ResultPage = lazy(() => import('./pages/ResultPage/ResultPage'));

/**
 * @function NotFoundPage
 * @description Компонент для отображения страницы "Not Found" (404).
 * @returns {JSX.Element} Возвращает JSX элемент, представляющий страницу 404.
 */
const NotFoundPage = () => (
  <div className='flex-grow grid place-items-center p-2'>
    <h1 className="text-center font-medium text-lg lg:text-4xl">Page not found</h1>
  </div>
);

/**
 * @function ProtectedRoute
 * @description Компонент для создания защищенных маршрутов. Проверяет аутентификацию пользователя
 * и перенаправляет на страницу авторизации, если пользователь не аутентифицирован.
 * @returns {JSX.Element} Возвращает дочерние элементы, если пользователь аутентифицирован,
 * или перенаправляет на страницу авторизации.
 */
const ProtectedRoute = ({ children }) => {
  // const { isAuthenticated } = useSelector(authSelectors.selectAuthData);
  // return isAuthenticated ? children : <Navigate to="/auth" replace />;
};

/**
 * @constant {Object} router
 * @description Объект конфигурации маршрутизации приложения.
 * Определяет структуру маршрутов, включая корневой layout и дочерние маршруты.
 */
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <QuizSettingsPage/>,
      },
      {
        path: 'quiz',
        element: <QuizPage />,
      },
      {
        path: 'result',
        element: <ResultPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);

export default router;
