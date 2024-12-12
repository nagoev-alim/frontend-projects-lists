/**
 * Компонент для отображения карточки продукта.
 * @param {Object} props - Свойства компонента.
 * @param {string} props.title - Название продукта.
 * @param {string} props.image - URL изображения продукта.
 * @param {string|number} props.price - Цена продукта.
 * @returns {JSX.Element} Возвращает JSX элемент, представляющий карточку продукта.
 */
const ProductCard = ({ title, image, price }) => (
  <li className="bg-white border rounded overflow-hidden">
    <img className="h-[250px] w-full object-cover" src={image} alt={title} />
    <div className="grid gap-3 p-3">
      <h3 className="text-lg font-bold">{title}</h3>
      <p>{price}</p>
    </div>
  </li>
);

export default ProductCard;
