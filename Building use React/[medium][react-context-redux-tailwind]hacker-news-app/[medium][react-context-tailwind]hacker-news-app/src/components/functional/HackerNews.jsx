import { Form, Controls, Posts } from './index.js';
import { useAppContext } from '../../hooks/index.js';
import { Loader } from '../ui/index.js';

/**
 * @function HackerNews
 * @description Компонент для отображения главной страницы приложения Hacker News.
 * 
 * @requires Form - Компонент формы поиска.
 * @requires Controls - Компонент элементов управления пагинацией.
 * @requires Posts - Компонент для отображения списка постов.
 * @requires useAppContext - Хук для доступа к глобальному состоянию приложения.
 * @requires Loader - Компонент индикатора загрузки.
 * 
 * @returns {JSX.Element} Возвращает JSX элемент, представляющий главную страницу приложения.
 */
const HackerNews = () => {
  // Использование хука useAppContext для получения состояния загрузки и ошибок
  const { isLoading, isError } = useAppContext();

  return (
    <div className="w-full grid gap-3">
      {/* Заголовок приложения */}
      <h1 className="font-bold text-lg md:text-2xl text-center p-4 bg-white border-b">Hacker News</h1>
      <div className="w-full max-w-6xl m-auto p-2 grid gap-3">
        {/* Компонент формы поиска */}
        <Form />
        {/* Отображение индикатора загрузки при загрузке данных */}
        {isLoading && <Loader isLoading={isLoading} />}
        {/* Отображение сообщения об ошибке при возникновении ошибки */}
        {isError && <p className="text-red-500 text-center p-4">An error occurred while fetching data.</p>}
        {/* Отображение элементов управления и списка постов при отсутствии загрузки и ошибок */}
        {!isLoading && !isError && (
          <>
            <Controls />
            <Posts />
          </>
        )}
      </div>
    </div>
  );
};

export default HackerNews;
