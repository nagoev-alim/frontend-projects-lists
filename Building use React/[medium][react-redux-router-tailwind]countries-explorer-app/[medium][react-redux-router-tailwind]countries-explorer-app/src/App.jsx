/**
 * @fileoverview Корневой компонент приложения для изучения информации о странах
 * @module App
 */

import { BrowserRouter } from 'react-router-dom';
import { Suspense, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import Routes from './routes';
import { Head, Header } from './components/layout';
import { Loader } from './components/ui';
import { countriesActions, countriesSelectors } from './features/countries';

/**
 * Корневой компонент приложения
 * @function App
 * @returns {JSX.Element} Корневая структура приложения
 */
const App = () => {
  const dispatch = useDispatch();
  const countries = useSelector(countriesSelectors.selectCountries);

  /**
   * Эффект для загрузки списка стран при первом рендере
   */
  useEffect(() => {
    if (countries.length === 0) {
      dispatch(countriesActions.fetchAllCountries());
    }
  }, [countries, dispatch]);

  return (
    <BrowserRouter>
      {/* Компонент для управления метаданными страницы */}
      <Head
        description="Explore countries information, flags, and details"
        title="Countries Explorer"
        keywords="countries, flags, population, regions, capitals"
      />
      {/* Компонент заголовка приложения */}
      <Header />
      {/* Основной контейнер приложения */}
      <div className="bg-neutral-50 min-h-screen dark:bg-neutral-600 dark:text-white">
        <div className="mx-auto max-w-6xl w-full py-4">
          {/* Обертка для ленивой загрузки маршрутов */}
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
