/**
 * Компонент для отображения списка продуктов.
 * @param {Object} props - Свойства компонента.
 * @param {Array} props.items - Массив объектов, представляющих продукты.
 * @param {string} props.items[].title - Название продукта.
 * @param {number} props.items[].price - Цена продукта.
 * @param {string} props.items[].img - URL изображения продукта.
 * @param {string} props.items[].desc - Описание продукта.
 * @param {string} props.items[].category - Категория продукта.
 * @returns {JSX.Element} Возвращает JSX элемент, представляющий сетку продуктов.
 * @description
 * Этот компонент создает адаптивную сетку продуктов, используя CSS Grid.
 * Каждый продукт отображается в виде карточки с изображением, названием, ценой и описанием.
 * Сетка адаптируется к различным размерам экрана, используя классы Tailwind CSS.
 */
const ProductList = ({ items }) => (
  <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
    {items.map(({ title, price, img, desc, category }) => (
      <li className="overflow-hidden rounded border bg-white" data-category={category} key={category + title}>
        <img className="h-[250px] w-full object-cover" src={img} alt={title} />
        <div className="grid gap-3 p-3">
          <div className="flex justify-between">
            <h4 className="text-lg font-bold">{title}</h4>
            <p className="font-medium">${price}</p>
          </div>
          <p className="text-sm text-gray-600">{desc}</p>
        </div>
      </li>
    ))}
  </ul>
);

export default ProductList;
