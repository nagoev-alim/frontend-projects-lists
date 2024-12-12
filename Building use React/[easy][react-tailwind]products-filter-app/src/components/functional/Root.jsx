/**
 * @fileoverview Компонент фильтрации продуктов
 *
 * Этот файл содержит компонент Root, который отображает список продуктов
 * с возможностью фильтрации по категориям. Компонент использует данные о продуктах
 * из внешнего источника и позволяет пользователю выбирать категорию для отображения.
 */

import productsData from '../../mock/mock.js';
import { useMemo, useState } from 'react';
import { ProductList, ProductsControls } from './index.js';


/**
 * Основной компонент для фильтрации и отображения списка продуктов.
 * @returns {JSX.Element} Возвращает JSX элемент, представляющий интерфейс фильтрации продуктов.
 * @description
 * Этот компонент управляет состоянием активной категории и отфильтрованным списком продуктов.
 * Он использует хуки useState и useMemo для оптимизации производительности.
 */
const Root = () => {
  // Хук состояния для управления активной категорией в фильтре продуктов.
  const [activeCategory, setActiveCategory] = useState('all');

  /**
   * Мемоизированный список отфильтрованных продуктов.
   * @description
   * Этот useMemo хук фильтрует список продуктов на основе выбранной категории.
   * Если выбрана категория 'all', возвращаются все продукты.
   * В противном случае, возвращаются только продукты, соответствующие выбранной категории.
   */
  const filteredProducts = useMemo(() => {
    return activeCategory === 'all'
      ? productsData
      : productsData.filter(product => product.category.toLowerCase() === activeCategory.toLowerCase());
  }, [activeCategory]);

  return (
    <div className="mx-auto grid w-full max-w-6xl items-start gap-3">
      <h1 className="text-center text-2xl font-bold">Products Filter</h1>
      <div className="grid gap-3">
        <ProductsControls
          categories={['all', ...new Set(productsData.map(item => item.category))]}
          onSetCategory={setActiveCategory}
          activeCategory={activeCategory}
        />
        <ProductList items={filteredProducts} />
      </div>
    </div>
  );
};

export default Root;
