import { useCallback } from 'react';
import { capitalizeFirstLetter } from '@utils';
import { Button } from '@ui';

/**
 * Компонент для отображения элементов управления фильтрацией продуктов.
 * @param {Object} props - Свойства компонента.
 * @param {string[]} props.categories - Массив доступных категорий продуктов.
 * @param {function} props.onSetCategory - Функция обратного вызова для установки выбранной категории.
 * @param {string} props.activeCategory - Текущая активная категория.
 * @returns {JSX.Element} Возвращает JSX элемент, представляющий список кнопок категорий.
 */
const ProductsControls = ({ categories, onSetCategory, activeCategory }) => {
  /**
   * @function handleCategoryChange
   * Обработчик изменения категории.
   * @description
   * Эта функция вызывается при выборе новой категории продукта.
   * Она использует переданную функцию onSetCategory для обновления активной категории.
   */
  const handleCategoryChange = useCallback((category) => {
    onSetCategory(category);
  }, [onSetCategory]);

  return (
    <ul className="flex flex-wrap justify-center gap-3">
      {categories.map((category) => (
        <li key={category}>
          <Button
            variant={category === activeCategory ? 'primary' : 'secondary'}
            onClick={() => handleCategoryChange(category)}
          >
            {category === 'all' ? 'All' : capitalizeFirstLetter(category)}
          </Button>
        </li>
      ))}
    </ul>
  );
};

export default ProductsControls;
