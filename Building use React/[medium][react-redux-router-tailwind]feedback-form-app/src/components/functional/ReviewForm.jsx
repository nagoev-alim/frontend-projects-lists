import { useDispatch, useSelector } from 'react-redux';
import { rootActions, rootConstants, rootSelectors } from '@features';
import { useCallback, useEffect, useState } from 'react';
import { showToast } from '@utils';
import { Button, Input } from '@ui';
import { onResetEditReview } from '@features/root/rootSlice.js';
import { RatingInput } from '@functional';

/**
 * Компонент формы для создания и редактирования отзывов.
 * @returns {JSX.Element} Форма отзыва
 */
export const ReviewForm = () => {
  const dispatch = useDispatch();
  // Состояние формы
  const [formData, setFormData] = useState({ rating: '', review: '' });
  // Получаем данные о редактируемом отзыве и статусе из хранилища Redux
  const { editingReview, status } = useSelector(rootSelectors.selectRootData);

  /**
   * Эффект для обновления формы при изменении редактируемого отзыва
   */
  useEffect(() => {
    setFormData({
      rating: editingReview?.rating || '',
      review: editingReview?.review || '',
    });
  }, [editingReview]);

  /**
   * Обработчик отправки формы
   * @param {Event} event - Событие отправки формы
   */
  const handleFormSubmit = useCallback(async (event) => {
    event.preventDefault();
    const { rating, review } = formData;

    // Проверка на заполненность формы
    if (!rating || !review.trim()) {
      showToast(rootConstants.COMPONENTS.ERROR_MESSAGES.INCOMPLETE_FORM, 'error');
      return;
    }

    try {
      let result;
      if (editingReview) {
        // Обновление существующего отзыва
        result = await dispatch(rootActions.update({ reviewId: editingReview.id, updatedData: formData })).unwrap();
        if (result) {
          showToast('Review updated successfully', 'success');
          dispatch(onResetEditReview());
        }
      } else {
        // Создание нового отзыва
        result = await dispatch(rootActions.create(formData)).unwrap();
        if (result) {
          showToast('Review submitted successfully', 'success');
          setFormData({ rating: '', review: '' });
        }
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }, [dispatch, formData, editingReview]);

  /**
   * Обработчик изменения данных формы
   * @param {Event} event - Событие изменения input
   */
  const handleFormDataChange = useCallback((event) => {
    const { name, value } = event.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  }, []);

  /**
   * Обработчик отмены редактирования
   */
  const handleCancelClick = useCallback(() => {
    dispatch(onResetEditReview());
    setFormData({ rating: '', review: '' });
  }, [dispatch]);

  return (
    <form className="grid gap-4 rounded-md border bg-white p-4" onSubmit={handleFormSubmit}>
      <h3 className="text-center text-lg font-semibold">How would you rate your service with us?</h3>
      <RatingInput value={formData.rating} onChange={handleFormDataChange} />
      <div className="grid gap-2">
        <Input
          fullWidth={true}
          name="review"
          placeholder="Write a review"
          value={formData.review}
          onChange={handleFormDataChange}
        />
        <Button 
          disabled={status === rootConstants.COMPONENTS.STATUS.LOADING || (!formData.review && !formData.rating)} 
          type="submit"
        >
          {editingReview ? 'Update Review' : 'Send'}
        </Button>
        {editingReview && (
          <Button variant="danger" onClick={handleCancelClick} type="button">
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};

export default ReviewForm;
