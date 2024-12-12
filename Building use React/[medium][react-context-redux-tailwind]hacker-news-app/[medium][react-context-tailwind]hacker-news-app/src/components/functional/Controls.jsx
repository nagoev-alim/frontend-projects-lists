import { useAppContext } from '../../hooks/index.js';
import { Button } from '../ui/index.js';
import { LANG } from '../../lang/index.js';
import { appActions } from '../../context/index.js';

/**
 * @function Controls
 * @description Компонент для отображения и управления элементами пагинации.
 * 
 * @requires useAppContext - Хук для доступа к глобальному состоянию приложения.
 * @requires Button - Компонент кнопки из UI библиотеки.
 * @requires LANG - Объект с локализованными строками.
 * @requires appActions - Объект с действиями для управления состоянием приложения.
 * 
 * @returns {JSX.Element} Возвращает JSX элемент с элементами пагинации.
 */
const Controls = () => {
  // Использование хука useAppContext для получения необходимых данных и функций из глобального состояния
  const { isLoading, page, nbPages, dispatch } = useAppContext();
  const { handlePage } = appActions;

  return (
    <div className="flex gap-2 justify-center items-center">
      {/* Кнопка для перехода на предыдущую страницу */}
      <Button disabled={isLoading} onClick={() => handlePage(dispatch, 'decrease')}>
        {LANG.controls.prev}
      </Button>
      {/* Отображение текущей страницы и общего количества страниц */}
      <p><span className="font-bold">{page + 1}</span> of <span className="font-bold">{nbPages}</span></p>
      {/* Кнопка для перехода на следующую страницу */}
      <Button disabled={isLoading} onClick={() => handlePage(dispatch, 'increase')}>
        {LANG.controls.next}
      </Button>
    </div>
  );
};

export default Controls;
