import { SortButton } from '@functional';

/**
 * Компонент заголовка таблицы с сортируемыми колонками.
 * @param {Object} props - Свойства компонента.
 * @param {Array} props.headers - Массив объектов, описывающих заголовки колонок.
 * @param {string} props.sortKey - Ключ текущей сортировки.
 * @param {string} props.sortOrder - Порядок сортировки ('asc' или 'desc').
 * @param {Function} props.onSort - Функция обратного вызова для обработки сортировки.
 * @returns {JSX.Element} Отрендеренный заголовок таблицы.
 */
const TableHeader = ({ headers, sortKey, sortOrder, onSort }) => (
  // Контейнер с гридом для заголовков
  <div className="grid grid-cols-[70px_212px_212px_220px_180px_234px]">
    {headers.map((row) => (
      // Ячейка заголовка
      <div className="border bg-neutral-500 text-white font-medium p-3" key={row.key}>
        {/* Кнопка сортировки для каждой колонки */}
        <SortButton
          columnKey={row.key}
          onClick={() => onSort(row.key)}
          sortOrder={sortOrder}
          sortKey={sortKey}
        >
          {row.label}
        </SortButton>
      </div>
    ))}
  </div>
);

export default TableHeader;
