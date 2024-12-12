/**
 * @fileoverview Корневой компонент приложения.
 * @module App
 */

import { BrowserRouter } from 'react-router-dom';
import { Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import Routes from './routes';
import { Head, Header } from './components/layout/index';
import { Loader } from './components/ui/index';
import { BreweryProvider } from './context/index';

/**
 * @function App
 * @description Главный компонент приложения, который настраивает основную структуру и маршрутизацию.
 * @returns {JSX.Element} JSX элемент, представляющий корневую структуру приложения.
 */
const App = () => (
  <BrowserRouter>
    <BreweryProvider>
      <Head
        description="Приложение для поиска и просмотра информации о пивоварнях с использованием OpenBreweryDB API"
        title="OpenBreweryDB Explorer"
        keywords="пивоварни, пиво, OpenBreweryDB, поиск пивоварен, информация о пивоварнях"
      />
      {/* Компонент заголовка, отображаемый на всех страницах */}
      <Header />
      {/* Основной контейнер приложения */}
      <div className="bg-neutral-100 min-h-screen">
        {/* Центрированный контейнер с ограниченной шириной для контента */}
        <div className="mx-auto max-w-6xl w-full py-4 px-2">
          {/* Обертка Suspense для обработки асинхронной загрузки маршрутов */}
          <Suspense fallback={<Loader isLoading={true} />}>
            {/* Компонент маршрутизации */}
            <Routes />
          </Suspense>
        </div>
        {/* Компонент для отображения уведомлений */}
        <Toaster />
      </div>
    </BreweryProvider>
  </BrowserRouter>
);

export default App;
