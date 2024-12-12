import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { Head } from './components/layout';
import { postsActions, postsSelectors } from './features/posts';
import { Controls, Form, Posts } from './components/functional';
import { Loader } from './components/ui';
import { LANG } from './lang';

/**
 * Главный компонент приложения.
 * Управляет состоянием поиска постов и отображает основной интерфейс.
 *
 * @component
 * @returns {JSX.Element} Отрендеренный компонент App
 */
const App = () => {
  const dispatch = useDispatch();

  // Получение состояния из Redux store
  const page = useSelector(postsSelectors.selectPostsPage);
  const query = useSelector(postsSelectors.selectPostsQuery);
  const status = useSelector(postsSelectors.selectPostsStatus);
  const error = useSelector(postsSelectors.selectPostsError);
  const message = useSelector(postsSelectors.selectPostsMessage);

  /**
   * Эффект для выполнения поискового запроса при изменении страницы или запроса.
   */
  useEffect(() => {
    dispatch(postsActions.searchQuery({ query, page }));
  }, [dispatch, page, query]);

  return (
    <>
      <Head
        description="HackerNews Search: Find and explore the latest tech news and discussions"
        title="HackerNews Search | Discover Tech Stories"
        keywords="hackernews, tech news, programming, software development, search engine"
      />
      <div className="bg-neutral-50 min-h-screen">
        <div className="w-full grid gap-3">
          <h1 className="font-bold text-lg md:text-xl text-center p-4 bg-white border-b">{LANG.header.title}</h1>
          <div className="w-full max-w-6xl m-auto p-2 grid gap-3">
            <Form />
            {/* Отображение индикатора загрузки при выполнении запроса */}
            {status === 'loading' && <Loader isLoading={true} />}
            {/* Отображение сообщения об ошибке, если она произошла */}
            {error && <p className="text-red-500 text-center p-4">{message}</p>}
            {/* Отображение результатов поиска при успешном выполнении запроса */}
            {status === 'success' && (
              <>
                <Controls />
                <Posts />
              </>
            )}
          </div>
        </div>
        {/* Компонент для отображения уведомлений */}
        <Toaster />
      </div>
    </>
  );
};

export default App;
