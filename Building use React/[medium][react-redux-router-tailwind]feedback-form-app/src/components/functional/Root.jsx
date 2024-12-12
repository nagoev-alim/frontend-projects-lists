import { useDispatch, useSelector } from 'react-redux';
import { rootActions, rootConstants, rootSelectors } from '@features';
import { useCallback, useEffect, useMemo } from 'react';
import { showToast } from '@utils';
import { ReviewForm, ReviewList } from '@functional';

/**
 * Корневой компонент приложения для управления отзывами.
 * @component
 * @returns {JSX.Element} Корневой компонент
 */
const Root = () => {
  const dispatch = useDispatch();
  // Получение данных из Redux store
  const { reviews, status, error, message } = useSelector(rootSelectors.selectRootData);

  /**
   * Эффект для загрузки отзывов при монтировании компонента.
   */
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        await dispatch(rootActions.read()).unwrap();
      } catch (error) {
        console.error('An error occurred:', error);
        showToast(rootConstants.COMPONENTS.ERROR_MESSAGES.FETCH, 'error');
      }
    };
    fetchReviews();
  }, [dispatch]);

  /**
   * Обработчик удаления отзыва.
   * @param {string} id - Идентификатор удаляемого отзыва
   */
  const handleDeleteReview = useCallback(async (id) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        const result = await dispatch(rootActions.delete(id)).unwrap();
        if (result) {
          showToast('Review deleted successfully', 'success');
        }
      } catch (error) {
        console.error('An error occurred:', error);
        showToast(rootConstants.COMPONENTS.ERROR_MESSAGES.DELETE_FAIL, 'error');
      }
    }
  }, [dispatch]);

  /**
   * Вычисляет средний рейтинг на основе массива отзывов.
   * @param {Array} reviews - Массив отзывов
   * @returns {string} Средний рейтинг, округленный до одного десятичного знака
   */
  const calculateAverageRating = (reviews) => {
    if (!reviews.length) return 0;
    const sum = reviews.reduce((acc, review) => acc + parseInt(review.rating), 0);
    return (sum / reviews.length).toFixed(1);
  };

  // Мемоизированное значение среднего рейтинга
  const averageRating = useMemo(() => calculateAverageRating(reviews), [reviews]);

  return (
    <>
      <h1 className="bg-white text-2xl font-bold w-full p-2 border-b-2 inline-flex justify-center items-center">
        Feedback UI
      </h1>
      <main className="max-w-2xl mx-auto px-2 py-10">
        <ReviewForm />
        <ReviewList
          reviews={reviews}
          status={status}
          error={error}
          message={message}
          averageRating={averageRating}
          onDeleteReview={handleDeleteReview}
        />
      </main>
    </>
  );
};

export default Root;
