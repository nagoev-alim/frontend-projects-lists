/**
 * @module usePagination
 * @description Модуль, предоставляющий хук для реализации пагинации данных.
 */

import { useCallback, useMemo, useState } from 'react';

/**
 * @function usePagination
 * @description Хук для управления пагинацией данных.
 * 
 * @param {Array} data - Массив данных для пагинации.
 * @param {number} itemsPerPage - Количество элементов на одной странице.
 * 
 * @returns {Object} Объект с данными и функциями для управления пагинацией:
 *   @property {number} currentPage - Текущая страница.
 *   @property {Array<Array>} paginatedData - Массив массивов, где каждый внутренний массив представляет страницу с элементами.
 *   @property {Function} handlePaginationClick - Функция для переключения между страницами (вперед/назад).
 *   @property {Function} handlePaginationNumberClick - Функция для перехода на конкретную страницу по номеру.
 */
const usePagination = (data, itemsPerPage) => {
  // Состояние для хранения текущей страницы
  const [currentPage, setCurrentPage] = useState(0);

  // Мемоизированные данные, разбитые на страницы
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

  // Оптимизированная функция для переключения страниц
  const handlePaginationClick = useCallback((direction) => {
    setCurrentPage((prev) => prev + (direction === 'next' ? 1 : -1));
  }, []);

  // Оптимизированная функция для перехода на конкретную страницу
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
