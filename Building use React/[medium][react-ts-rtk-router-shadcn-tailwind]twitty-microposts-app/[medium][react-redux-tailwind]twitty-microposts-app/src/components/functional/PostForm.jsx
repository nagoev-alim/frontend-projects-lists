import { useDispatch, useSelector } from 'react-redux';
import { rootActions, rootConstants, rootSelectors } from '@features';
import { useCallback, useEffect, useState } from 'react';
import { showToast } from '@utils';
import { Button, Input, Textarea } from '@ui';
import { onResetEditReview } from '@features/root/rootSlice.js';

/**
 * Компонент формы для создания и редактирования постов.
 * @returns {JSX.Element} Форма для создания/редактирования поста
 */
const PostForm = () => {
  const dispatch = useDispatch();
  // Получаем данные о редактируемом посте и статусе из Redux store
  const { editingReview, status } = useSelector(rootSelectors.selectRootData);
  // Локальное состояние для данных формы
  const [formData, setFormData] = useState({ title: '', body: '' });

  /**
   * Эффект для обновления формы при изменении редактируемого поста
   */
  useEffect(() => {
    setFormData({
      title: editingReview?.title || '',
      body: editingReview?.body || '',
    });
  }, [editingReview]);

  /**
   * Обработчик отправки формы
   * @param {Event} event - Событие отправки формы
   */
  const handleFormSubmit = useCallback(async (event) => {
    event.preventDefault();
    const { title, body } = formData;

    // Проверка на заполненность формы
    if (!title.trim() || !body.trim()) {
      showToast(rootConstants.COMPONENTS.ERROR_MESSAGES.INCOMPLETE_FORM, 'error');
      return;
    }

    try {
      let result;
      if (editingReview) {
        // Обновление существующего поста
        result = await dispatch(rootActions.update({ reviewId: editingReview.id, updatedData: formData })).unwrap();
        if (result) {
          showToast('Review updated successfully', 'success');
          dispatch(onResetEditReview());
        }
      } else {
        // Создание нового поста
        result = await dispatch(rootActions.create(formData)).unwrap();
        if (result) {
          showToast('Review submitted successfully', 'success');
          setFormData({ title: '', body: '' });
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
    setFormData({ title: '', body: '' });
  }, [dispatch]);

  return (
    <form className="grid gap-3 rounded border bg-white p-4" onSubmit={handleFormSubmit}>
      <Input
        name="title"
        placeholder="Title"
        value={formData.title}
        onChange={handleFormDataChange}
      />
      <Textarea
        className="min-h-[150px]"
        fullWidth={true}
        resizeNone={true}
        name="body"
        placeholder="Body text"
        value={formData.body}
        onChange={handleFormDataChange}
      />
      <Button
        disabled={status === rootConstants.COMPONENTS.STATUS.LOADING || (!formData.title && !formData.body)}
        type="submit"
      >
        {editingReview ? 'Update Review' : 'Submit'}
      </Button>
      {editingReview && (
        <Button variant="danger" onClick={handleCancelClick} type="button">
          Cancel
        </Button>
      )}
    </form>
  );
};

export default PostForm;
