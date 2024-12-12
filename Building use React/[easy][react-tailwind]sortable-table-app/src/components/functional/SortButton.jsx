import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

/**
 * Компонент кнопки сортировки.
 * @param {Object} props - Свойства компонента.
 * @param {string} props.sortOrder - Текущий порядок сортировки ('asc' или 'desc').
 * @param {string} props.columnKey - Ключ колонки, к которой привязана кнопка.
 * @param {string} props.sortKey - Ключ текущей отсортированной колонки.
 * @param {Function} props.onClick - Функция обработки клика по кнопке.
 * @param {React.ReactNode} props.children - Дочерние элементы (текст кнопки).
 * @returns {JSX.Element} Отрендеренная кнопка сортировки.
 */
const SortButton = ({ sortOrder, columnKey, sortKey, onClick, children }) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center gap-1 w-full ${
      sortKey === columnKey && sortOrder === 'desc' ? 'sort-button sort-reverse' : 'sort-button'
    }`}
  >
    {children}
    {/* Отображение иконки сортировки, если текущая колонка отсортирована */}
    {sortKey === columnKey && (sortOrder === 'desc' ? <FiChevronDown size={20} /> : <FiChevronUp size={20} />)}
  </button>
);

export default SortButton;
