import { BrowserRouter } from 'react-router-dom';
import { Suspense, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import Routes from './routes';
import { Head, Header } from './components/layout';
import { Loader } from './components/ui';
import { breweryActions } from './features/brewery';

/**
 * Главный компонент приложения.
 * Отвечает за инициализацию маршрутизации, загрузку случайной пивоварни и рендеринг основной структуры приложения.
 * @returns {JSX.Element} Корневой элемент приложения.
 */
const App = () => {
  const dispatch = useDispatch();

  /**
   * Эффект для загрузки случайной пивоварни при монтировании компонента.
   */
  useEffect(() => {
    dispatch(breweryActions.fetchRandom());
  }, [dispatch]);

  return (
    <BrowserRouter>
      {/* Компонент для установки метаданных страницы */}
      <Head
        description="Приложение для поиска и просмотра информации о пивоварнях с использованием OpenBreweryDB API"
        title="OpenBreweryDB Explorer"
        keywords="пивоварни, пиво, OpenBreweryDB, поиск пивоварен, информация о пивоварнях"
      />
      {/* Компонент заголовка */}
      <Header />
      <div className="bg-neutral-100 min-h-screen">
        <div className="mx-auto max-w-6xl w-full py-4 px-2">
          {/* Обертка Suspense для ленивой загрузки маршрутов */}
          <Suspense fallback={<Loader isLoading={true} />}>
            <Routes />
          </Suspense>
        </div>
        {/* Компонент для отображения уведомлений */}
        <Toaster />
      </div>
    </BrowserRouter>
  );
};

export default App;
