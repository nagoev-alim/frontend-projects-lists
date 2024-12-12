import { usersData } from '@mock';
import { useCallback, useMemo, useState } from 'react';
import { TableBody, TableHeader } from '@functional';

/**
 * Сортирует данные таблицы по указанному ключу.
 * @param {Object} params - Параметры сортировки.
 * @param {Array} params.tableData - Исходные данные таблицы.
 * @param {string} params.sortKey - Ключ, по которому производится сортировка.
 * @param {boolean} params.reverse - Флаг обратной сортировки.
 * @returns {Array} Отсортированный массив данных.
 */
const sortData = ({ tableData, sortKey, reverse }) => {
  // Если ключ сортировки не указан, возвращаем исходные данные
  if (!sortKey) return tableData;

  // Создаем копию массива и сортируем его
  const sortedData = [...tableData].sort((a, b) => {
    if (typeof a[sortKey] === 'string') {
      // Для строковых значений используем localeCompare
      return a[sortKey].localeCompare(b[sortKey]);
    }
    // Для числовых значений используем обычное вычитание
    return a[sortKey] - b[sortKey];
  });

  // Если нужна обратная сортировка, переворачиваем массив
  return reverse ? sortedData.reverse() : sortedData;
};

/**
 * Корневой компонент, отображающий сортируемую таблицу.
 * @returns {JSX.Element} Корневой компонент приложения.
 */
const Root = () => {
  // Состояние для ключа сортировки и порядка сортировки
  const [sortKey, setSortKey] = useState('last_name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Определение заголовков таблицы
  const headers = [
    { key: 'id', label: 'ID' },
    { key: 'first_name', label: 'First name' },
    { key: 'last_name', label: 'Last name' },
    { key: 'email', label: 'Email' },
    { key: 'gender', label: 'Gender' },
    { key: 'ip_address', label: 'IP address' },
  ];

  // Мемоизированные отсортированные данные
  const sortedData = useMemo(() =>
      sortData({ tableData: usersData, sortKey, reverse: sortOrder === 'desc' }),
    [sortKey, sortOrder],
  );

  /**
   * Обработчик изменения сортировки.
   * @param {string} key - Ключ, по которому нужно отсортировать данные.
   */
  const handleChangeSort = useCallback((key) => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    setSortKey(key);
  }, [sortOrder]);

  return (
    <div className="max-w-6xl mx-auto w-full p-3 grid gap-5">
      <h1 className="text-center font-bold text-3xl">Sortable Table</h1>
      <div className="overflow-auto">
        <TableHeader
          headers={headers}
          sortKey={sortKey}
          sortOrder={sortOrder}
          onSort={handleChangeSort}
        />
        <TableBody data={sortedData} />
      </div>
    </div>
  );
};

export default Root;
