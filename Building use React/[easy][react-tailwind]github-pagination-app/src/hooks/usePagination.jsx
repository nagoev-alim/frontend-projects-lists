import { useCallback, useMemo, useState } from 'react';

/**
 * Пользовательский хук для реализации пагинации данных.
 *
 * @param {Array} data - Массив данных для пагинации.
 * @param {number} itemsPerPage - Количество элементов на одной странице.
 * @returns {Object} Объект со следующими свойствами:
 *   - currentPage {number}: Текущая страница.
 *   - paginatedData {Array}: Массив массивов, где каждый внутренний массив представляет страницу данных.
 *   - handlePaginationClick {Function}: Функция для обработки переключения страниц (вперед/назад).
 *   - handlePaginationNumberClick {Function}: Функция для перехода на конкретную страницу по номеру.
 */
const usePagination = (data, itemsPerPage) => {
  const [currentPage, setCurrentPage] = useState(0);

  const paginatedData = useMemo(() => {
    return data.reduce((acc, item, index) => {
      const pageIndex = Math.floor(index / itemsPerPage);
      if (!acc[pageIndex]) {
        acc[pageIndex] = [];
      }
      acc[pageIndex].push(item);
      return acc;
    }, []);
  }, [data, itemsPerPage]);

  const handlePaginationClick = useCallback((direction) => {
    setCurrentPage((prev) => prev + (direction === 'next' ? 1 : -1));
  }, []);

  const handlePaginationNumberClick = useCallback((pageNumber) => {
    setCurrentPage(pageNumber);
  }, []);

  return {
    currentPage,
    paginatedData,
    handlePaginationClick,
    handlePaginationNumberClick,
  };
};

export default usePagination;
