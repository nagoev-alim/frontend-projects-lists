import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { TiDelete } from 'react-icons/ti';
import { LANG } from '../../lang';
import { postsSelectors } from '../../features/posts';
import { removeItem } from '../../features/posts/postsSlice.js';

/**
 * Компонент для отображения списка постов
 * @returns {JSX.Element} Список постов
 */
const Posts = () => {
  const dispatch = useDispatch();
  // Получение списка постов из Redux store
  const hits = useSelector(postsSelectors.selectPostsHits);

  /**
   * Обработчик удаления поста
   * @param {string} objectID - Уникальный идентификатор поста
   */
  const handleRemoveClick = useCallback((objectID) => {
    if (confirm(LANG.confirm)) {
      dispatch(removeItem(objectID));
    }
  }, [dispatch]);

  /**
   * Рендерит отдельный пост
   * @param {Object} post - Объект с данными поста
   * @param {string} post.objectID - Уникальный идентификатор поста
   * @param {string} post.title - Заголовок поста
   * @param {number} post.points - Количество очков поста
   * @param {string} post.author - Автор поста
   * @param {number} post.num_comments - Количество комментариев
   * @param {string} post.url - URL поста
   * @returns {JSX.Element} Элемент списка с информацией о посте
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
        {points} {LANG.posts.postBy} <span>{author} | </span> {num_comments} {LANG.posts.comments}
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
