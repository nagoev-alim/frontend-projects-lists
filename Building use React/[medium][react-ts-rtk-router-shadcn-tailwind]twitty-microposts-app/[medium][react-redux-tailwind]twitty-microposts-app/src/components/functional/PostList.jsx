import { useSelector } from 'react-redux';
import { rootSelectors } from '@features';
import { useState, useCallback, useMemo } from 'react';
import { FilterInput } from '@functional';
import { PostItem } from '@functional';

/**
 * Компонент для отображения списка постов с возможностью фильтрации.
 * @returns {JSX.Element} Отрендеренный список постов
 */
const PostList = () => {
  // Получаем список отзывов из Redux store
  const { reviews } = useSelector(rootSelectors.selectRootData);
  // Локальное состояние для хранения текущего значения фильтра
  const [filter, setFilter] = useState('');

  /**
   * Обработчик изменения значения фильтра.
   * @param {React.ChangeEvent<HTMLInputElement>} event - Событие изменения input
   */
  const handleFilterChange = useCallback((event) => {
    setFilter(event.target.value);
  }, []);

  /**
   * Мемоизированный список отфильтрованных отзывов.
   * Фильтрация происходит по заголовку и тексту отзыва.
   */
  const filteredReviews = useMemo(() => {
    return reviews.filter(review =>
      review.title.toLowerCase().includes(filter.toLowerCase()) ||
      review.body.toLowerCase().includes(filter.toLowerCase()),
    );
  }, [reviews, filter]);

  return (
    <div className="grid gap-4">
      <FilterInput value={filter} onChange={handleFilterChange} />
      <div className="grid gap-2">
        <h3 className="font-bold text-lg">Latest's Posts:</h3>
        <ul className="grid gap-3">
          {filteredReviews.map((review) => (
            <PostItem key={review.id} review={review} />
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PostList;
