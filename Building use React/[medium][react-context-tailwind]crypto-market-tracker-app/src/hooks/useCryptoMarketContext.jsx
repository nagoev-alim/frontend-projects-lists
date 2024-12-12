/**
 * @module useCryptoMarketContext
 * @description Модуль, содержащий пользовательский хук для доступа к контексту криптовалютного рынка.
 */

import { useContext } from 'react';
import { CryptoMarketContext } from '../context/index.js';

/**
 * @function useCryptoMarketContext
 * @description Пользовательский хук для получения доступа к контексту криптовалютного рынка.
 * 
 * @throws {Error} Выбрасывает ошибку, если хук используется вне провайдера CryptoMarketContext.
 * 
 * @returns {Object} Объект контекста криптовалютного рынка.
 * @property {boolean} isLoading - Флаг, указывающий на процесс загрузки данных.
 * @property {boolean} isError - Флаг, указывающий на наличие ошибки.
 * @property {Array} items - Массив объектов с данными о криптовалютах.
 * @property {string} sortType - Текущий тип сортировки.
 * @property {string} sortOrder - Текущий порядок сортировки ('ASC' или 'DESC').
 * @property {function} dispatch - Функция для отправки действий в редюсер.
 *
 * @description
 * Этот хук использует useContext для получения данных из CryptoMarketContext.
 * Он также проверяет, используется ли хук внутри соответствующего провайдера контекста.
 * 
 * Оптимизация производительности:
 * - Использование useContext позволяет избежать излишней передачи пропсов через компоненты.
 * - Проверка на undefined помогает быстро выявить ошибки в структуре приложения.
 */
const useCryptoMarketContext = () => {
  const context = useContext(CryptoMarketContext);
  if (context === undefined) {
    throw new Error('CryptoMarketContext must be used within an CryptoMarketContextProvider');
  }
  return context;
};

export default useCryptoMarketContext;
