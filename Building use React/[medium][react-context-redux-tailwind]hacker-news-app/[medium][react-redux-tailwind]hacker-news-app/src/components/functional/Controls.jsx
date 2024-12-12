import { useDispatch, useSelector } from 'react-redux';
import { Button } from '../ui';
import { LANG } from '../../lang';
import { handlePage } from '../../features/posts/postsSlice';
import { postsSelectors } from '../../features/posts';

/**
 * Компонент Controls для управления пагинацией постов
 * @returns {JSX.Element} Элемент с кнопками управления и информацией о текущей странице
 */
const Controls = () => {
  const dispatch = useDispatch();
  
  // Получение необходимых данных из Redux store
  const status = useSelector(postsSelectors.selectPostsStatus)
  const page = useSelector(postsSelectors.selectPostsPage)
  const nbPages = useSelector(postsSelectors.selectPostsNbPages)
  
  return (
    <div className="flex gap-2 justify-center items-center">
      {/* Кнопка для перехода на предыдущую страницу */}
      <Button 
        disabled={status === 'loading'} 
        onClick={() => dispatch(handlePage('decrease'))}
      >
        {LANG.controls.prev}
      </Button>
      
      {/* Отображение текущей страницы и общего количества страниц */}
      <p>
        <span className="font-bold">{page + 1}</span> of <span className="font-bold">{nbPages}</span>
      </p>
      
      {/* Кнопка для перехода на следующую страницу */}
      <Button 
        disabled={status === 'loading'} 
        onClick={() => dispatch(handlePage('increase'))}
      >
        {LANG.controls.next}
      </Button>
    </div>
  );
};

export default Controls;
