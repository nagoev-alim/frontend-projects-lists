import { useCallback, useMemo, useState } from 'react';

/**
 * Хук для управления пагинацией данных.
 * 
 * @param {Array} data - Массив данных для пагинации.
 * @param {number} itemsPerPage - Количество элементов на одной странице.
 * @returns {Object} Объект с данными и функциями для управления пагинацией.
 * @property {number} currentPage - Текущая страница.
 * @property {Array} paginatedData - Массив массивов, представляющий разделенные на страницы данные.
 * @property {Function} handlePaginationClick - Функция для перехода на следующую или предыдущую страницу.
 * @property {Function} handlePaginationNumberClick - Функция для перехода на конкретную страницу по номеру.
 */
const usePagination = (data, itemsPerPage) => {
  // Состояние для хранения текущей страницы
  const [currentPage, setCurrentPage] = useState(0);

  /**
   * Разделение данных на страницы.
   * Используется мемоизация для оптимизации производительности.
   */
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

  /**
   * Обработчик клика по кнопкам "следующая" и "предыдущая" страница.
   * 
   * @param {string} direction - Направление перехода ('next' или 'prev').
   */
  const handlePaginationClick = useCallback((direction) => {
    setCurrentPage((prev) => prev + (direction === 'next' ? 1 : -1));
  }, []);

  /**
   * Обработчик клика по номеру страницы.
   * 
   * @param {number} pageNumber - Номер страницы для перехода.
   */
  const handlePaginationNumberClick = useCallback((pageNumber) => {
    setCurrentPage(pageNumber);
  }, []);

  // Возвращаем объект с данными и функциями для управления пагинацией
  return {
    currentPage,
    paginatedData,
    handlePaginationClick,
    handlePaginationNumberClick,
  };
};

export default usePagination;
