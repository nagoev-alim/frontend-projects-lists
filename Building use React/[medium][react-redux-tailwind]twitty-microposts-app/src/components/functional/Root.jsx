import { useDispatch, useSelector } from 'react-redux';
import { rootActions, rootConstants, rootSelectors } from '@features';
import { useEffect } from 'react';
import { showToast } from '@utils';
import { AiTwotoneMessage } from 'react-icons/ai';
import { Loader } from '@ui';
import { PostForm, PostList } from '@functional';

/**
 * Корневой компонент приложения.
 * Отвечает за отображение формы создания поста, списка постов и обработку общего состояния приложения.
 * @returns {JSX.Element} Корневой компонент приложения
 */
const Root = () => {
  const dispatch = useDispatch();
  // Получаем текущее состояние из Redux store
  const { status, error, message } = useSelector(rootSelectors.selectRootData);

  useEffect(() => {
    /**
     * Асинхронная функция для загрузки отзывов при монтировании компонента.
     */
    const fetchReviews = async () => {
      try {
        // Отправляем действие для загрузки отзывов
        await dispatch(rootActions.read()).unwrap();
      } catch (error) {
        console.error('An error occurred:', error);
        // Показываем сообщение об ошибке пользователю
        showToast(rootConstants.COMPONENTS.ERROR_MESSAGES.FETCH, 'error');
      }
    };
    fetchReviews();
  }, [dispatch]); // Зависимость от dispatch гарантирует, что эффект выполнится только при изменении dispatch

  return (
    <div className="mx-auto grid w-full max-w-2xl gap-2 p-3">
      <h1 className="text-center inline-flex justify-center items-center gap-1 font-semibold text-2xl">
        Twitty MicroPosts <AiTwotoneMessage />
      </h1>
      <div className="grid gap-3">
        {/* Компонент формы для создания нового поста */}
        <PostForm />
        {/* Отображение индикатора загрузки при загрузке данных */}
        {status === rootConstants.COMPONENTS.STATUS.LOADING && <Loader containerProps="my-5" />}
        {/* Отображение сообщения об ошибке при наличии ошибки */}
        {status === rootConstants.COMPONENTS.STATUS.ERROR && error && (
          <div className="text-center text-red-500 font-semibold">{message}</div>
        )}
        {/* Отображение списка постов при успешной загрузке */}
        {status === rootConstants.COMPONENTS.STATUS.SUCCESS && <PostList />}
      </div>
    </div>
  );
};

export default Root;
