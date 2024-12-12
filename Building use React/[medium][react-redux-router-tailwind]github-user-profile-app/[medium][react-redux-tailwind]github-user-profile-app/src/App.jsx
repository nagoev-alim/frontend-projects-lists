import { BrowserRouter } from 'react-router-dom';
import { Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import Routes from './routes';
import { Head, Header } from './components/layout';
import { Loader } from './components/ui';

/**
 * Главный компонент приложения
 * @function App
 * @returns {JSX.Element} Корневой элемент приложения
 */
const App = () => (
  <BrowserRouter>
    {/* Компонент Head для установки мета-тегов */}
    <Head
      description="An application for searching and exploring GitHub user profiles and repositories"
      title="GitHub User Finder"
      keywords="GitHub, user search, developer profiles, repositories, coding, open source"
    />
    {/* Компонент Header для отображения шапки приложения */}
    <Header />
    {/* Основной контейнер приложения */}
    <div className="bg-neutral-50 min-h-screen dark:bg-neutral-600 dark:text-white">
      {/* Центральный контейнер с ограничением ширины */}
      <div className="mx-auto max-w-6xl w-full py-4 px-2">
        {/* Обертка Suspense для асинхронной загрузки маршрутов */}
        <Suspense fallback={<Loader isLoading={true} />}>
          {/* Компонент Routes для отображения маршрутов приложения */}
          <Routes />
        </Suspense>
      </div>
      {/* Компонент Toaster для отображения уведомлений */}
      <Toaster />
    </div>
  </BrowserRouter>
);

export default App;
