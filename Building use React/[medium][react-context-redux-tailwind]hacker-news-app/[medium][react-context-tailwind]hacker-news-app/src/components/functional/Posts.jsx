import { useCallback } from 'react';
import { TiDelete } from "react-icons/ti";
import { useAppContext } from '../../hooks/index.js';
import { LANG } from '../../lang/index.js';
import { appActions } from '../../context/index.js';

/**
 * @function Posts
 * @description Компонент для отображения списка постов Hacker News.
 * 
 * @requires react.useCallback
 * @requires react-icons/ti.TiDelete
 * @requires useAppContext - Хук для доступа к глобальному состоянию приложения
 * @requires LANG - Объект с языковыми константами
 * @requires appActions - Объект с действиями для изменения состояния приложения
 * 
 * @returns {JSX.Element} Возвращает JSX элемент, представляющий список постов.
 */
const Posts = () => {
  // Получение списка постов (hits) и функции dispatch из глобального контекста
  const { hits, dispatch } = useAppContext();
  // Получение функции удаления поста из объекта действий
  const { removeItem } = appActions;

  /**
   * Обработчик клика по кнопке удаления поста.
   * Запрашивает подтверждение у пользователя и удаляет пост при положительном ответе.
   * 
   * @function
   * @param {string} objectID - Уникальный идентификатор поста
   */
  const handleRemoveClick = useCallback((objectID) => {
    if (confirm(LANG.confirm)) {
      removeItem(dispatch, objectID);
    }
  }, [dispatch, removeItem]);

  /**
   * Функция рендеринга отдельного поста.
   * 
   * @function
   * @param {Object} post - Объект с данными поста
   * @param {string} post.objectID - Уникальный идентификатор поста
   * @param {string} post.title - Заголовок поста
   * @param {number} post.points - Количество очков поста
   * @param {string} post.author - Автор поста
   * @param {number} post.num_comments - Количество комментариев
   * @param {string} post.url - URL поста
   * @returns {JSX.Element} Возвращает JSX элемент, представляющий отдельный пост
   */
  const renderPost = ({ objectID, title, points, author, num_comments, url }) => (
    <li className="grid gap-2 bg-white shadow border rounded p-3" key={objectID}>
      <h3 className="text-blue-600 text-lg font-medium inline-flex gap-2 items-center justify-between">
        <a target="_blank" rel="noopener noreferrer" href={url}>{title}</a>
        <button onClick={() => handleRemoveClick(objectID)}>
          <TiDelete size={25} className="text-red-500" />
        </button>
      </h3>
      <p className="text-neutral-500">
        {points} points by <span>{author} | </span> {num_comments} comments
      </p>
    </li>
  );

  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {hits?.map(renderPost)}
    </ul>
  );
};

export default Posts;
