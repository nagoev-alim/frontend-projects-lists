import { Button } from '@ui';

/**
 * Компонент для отображения списка категорий пользовательских данных.
 * @param {Object} props - Свойства компонента.
 * @param {Array} props.categories - Массив объектов категорий, каждый содержит `name` и `src`.
 * @param {Function} props.onSetCategory - Функция обратного вызова для установки активной категории.
 * @param {Object} props.activeCategory - Объект активной категории с полями `name` и `value`.
 * @param {Object} props.userData - Объект с данными пользователя.
 * @returns {JSX.Element} Возвращает JSX элемент, представляющий список кнопок категорий.
 */
const CategoryList = ({ categories, onSetCategory, activeCategory, userData }) => (
  <ul className="flex flex-wrap items-center justify-center gap-2">
    {categories.map(({ name, src }) => (
      <li key={name}>
        <Button variant='outline' className={name === activeCategory.name && 'bg-slate-200'}
                onClick={() => onSetCategory({ name, value: userData[name] })}>
          {src}
        </Button>
      </li>
    ))}
  </ul>
);

export default CategoryList;
