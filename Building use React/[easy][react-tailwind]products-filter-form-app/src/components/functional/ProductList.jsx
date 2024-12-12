import { ProductCard } from '@functional';

/**
 * Компонент для отображения списка продуктов.
 * @param {Object} props - Свойства компонента.
 * @param {Array} props.products - Массив объектов продуктов для отображения.
 * @returns {JSX.Element} Возвращает JSX элемент, представляющий список продуктов или сообщение об отсутствии результатов.
 * @description
 * Этот компонент отображает список продуктов, используя компонент ProductCard для каждого продукта.
 * Если список продуктов пуст, отображается сообщение о том, что продукты не найдены.
 * Компонент использует адаптивную сетку для отображения продуктов в разных колонках на разных размерах экрана.
 */
const ProductList = ({ products }) => (
  <div>
    {products.length === 0 ? (
      <h5 className="font-medium">No products matched your search</h5>
    ) : (
      <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </ul>
    )}
  </div>
);

export default ProductList;
