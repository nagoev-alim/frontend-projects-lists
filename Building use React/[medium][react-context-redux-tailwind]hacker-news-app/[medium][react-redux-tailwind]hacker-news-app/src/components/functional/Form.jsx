import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useState } from 'react';
import { Input } from '../ui';
import { showToast } from '../../utils';
import { LANG } from '../../lang';
import { postsSelectors } from '../../features/posts';
import { searchStory } from '../../features/posts/postsSlice.js';

/**
 * Компонент формы для поиска историй
 * @returns {JSX.Element} Форма поиска
 */
const Form = () => {
  const dispatch = useDispatch();
  // Получение текущего запроса из Redux store
  const query = useSelector(postsSelectors.selectPostsQuery);
  // Локальное состояние для управления вводом пользователя
  const [inputQuery, setInputQuery] = useState(query);

  /**
   * Обработчик отправки формы
   * @param {React.FormEvent<HTMLFormElement>} e - Событие отправки формы
   */
  const handleFormSubmit = useCallback((e) => {
    e.preventDefault();
    // Проверка валидности введенного запроса
    if (!inputQuery || inputQuery.trim().length === 0) {
      showToast(LANG.errors.queryValidation, 'error');
      return;
    }
    // Отправка действия для поиска истории
    dispatch(searchStory(inputQuery));
    // Очистка поля ввода после отправки
    setInputQuery('');
  }, [dispatch, inputQuery]);

  return (
    <form onSubmit={handleFormSubmit} className="border rounded shadow bg-white p-4">
      <label className="grid gap-2">
        <span className="font-medium">{LANG.form.label}</span>
        <Input 
          value={inputQuery} 
          onChange={(e) => setInputQuery(e.target.value)} 
        />
      </label>
    </form>
  );
};

export default Form;
