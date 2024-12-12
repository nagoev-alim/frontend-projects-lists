import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import router from '@routes';
import { Loader } from '@ui';

/**
 * Компонент для отображения сообщения об ошибке.
 * @returns {JSX.Element} JSX элемент с сообщением об ошибке.
 */
const ErrorBoundary = () => {
  return (
    <div className="text-center">
      <h1 className="text-2xl font-bold mb-4">Упс! Что-то пошло не так.</h1>
      <p>Сожалеем, но произошла непредвиденная ошибка. Пожалуйста, повторите попытку позже.</p>
    </div>
  );
};

/**
 * Корневой компонент приложения.
 * @description Этот компонент является точкой входа в приложение. Он настраивает маршрутизацию,
 * обработку ошибок и обеспечивает ленивую загрузку компонентов.
 * @returns {JSX.Element} JSX элемент, представляющий корневую структуру приложения.
 */
const Root = () => (
  <Suspense fallback={<Loader />}>
    <RouterProvider
      router={router}
      fallbackElement={<Loader />}
      errorElement={<ErrorBoundary />}
    />
  </Suspense>
);

export default Root;
