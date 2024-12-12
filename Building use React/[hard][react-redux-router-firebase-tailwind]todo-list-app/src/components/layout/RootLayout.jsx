/**
 * @module RootLayout
 * @description Модуль, содержащий компонент RootLayout, который определяет основную структуру приложения.
 */

import { Outlet } from 'react-router-dom';
import { Header } from '@layout';

/**
 * @function RootLayout
 * @description Компонент, определяющий основную структуру приложения.
 * Включает в себя header и основное содержимое страницы.
 * @returns {JSX.Element} Возвращает JSX элемент, представляющий основную структуру приложения.
 */
const RootLayout = () => (
  <div className='min-h-screen w-full flex flex-col'>
    <Header />
    <main className='flex-grow flex flex-col py-4 px-3 xl:px-0 max-w-6xl w-full mx-auto'>
      <Outlet />
    </main>
  </div>
);

export default RootLayout;
