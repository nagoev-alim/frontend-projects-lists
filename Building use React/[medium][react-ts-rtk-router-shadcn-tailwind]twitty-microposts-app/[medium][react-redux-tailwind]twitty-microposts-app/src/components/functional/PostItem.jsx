import { useDispatch } from 'react-redux';
import { rootActions, rootConstants } from '@features';
import { useCallback } from 'react';
import { Button } from '@ui';
import { FaRegEdit } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import { onEditReview } from '@features/root/rootSlice.js';
import { showToast } from '@utils';

/**
 * Компонент для отображения отдельного поста (обзора).
 * @param {Object} props - Свойства компонента
 * @param {Object} props.review - Объект с данными обзора
 * @param {string} props.review.id - Уникальный идентификатор обзора
 * @param {string} props.review.title - Заголовок обзора
 * @param {string} props.review.body - Текст обзора
 * @returns {JSX.Element} Отрендеренный компонент поста
 */
const PostItem = ({ review }) => {
  const dispatch = useDispatch();

  /**
   * Обработчик клика по кнопке редактирования.
   * Вызывает действие для перехода в режим редактирования обзора.
   */
  const handleEditClick = useCallback(() => {
    dispatch(onEditReview(review.id));
  }, [dispatch, review.id]);

  /**
   * Обработчик клика по кнопке удаления.
   * Запрашивает подтверждение у пользователя и удаляет обзор при положительном ответе.
   */
  const handleDeleteReview = useCallback(async () => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        const result = await dispatch(rootActions.delete(review.id)).unwrap();
        if (result) {
          showToast('Review deleted successfully', 'success');
        }
      } catch (error) {
        console.error('An error occurred:', error);
        showToast(rootConstants.COMPONENTS.ERROR_MESSAGES.DELETE_FAIL, 'error');
      }
    }
  }, [dispatch, review.id]);

  return (
    <li className="grid gap-2 relative bg-white p-4 rounded border">
      <h3 className="font-bold text-xl">{review.title}</h3>
      <p>{review.body}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {/* Кнопка редактирования */}
        <Button className="inline-flex justify-center items-center gap-1" onClick={handleEditClick}>
          <FaRegEdit />
          <span>Edit</span>
        </Button>
        {/* Кнопка удаления */}
        <Button className="inline-flex justify-center items-center gap-1" variant="danger" onClick={handleDeleteReview}>
          <IoMdClose />
          <span>Delete</span>
        </Button>
      </div>
    </li>
  );
};

export default PostItem;
