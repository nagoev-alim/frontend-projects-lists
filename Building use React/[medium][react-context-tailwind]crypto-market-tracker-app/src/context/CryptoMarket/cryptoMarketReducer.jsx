/**
 * @module cryptoMarketReducer
 * @description Модуль, содержащий редюсер для управления состоянием криптовалютного рынка.
 */

import { LANG } from '../../lang/index.js';

const {
  actions: {
    SET_LOADING,
    SET_ERROR,
    SET_ITEMS,
    SET_SINGLE_ITEM,
    SET_SORT_TYPE,
  },
} = LANG;

/**
 * @function sortItems
 * @description Сортирует массив элементов по заданному типу и порядку сортировки.
 * @param {Array} items - Массив элементов для сортировки.
 * @param {string} sortType - Тип сортировки (ключ объекта, по которому производится сортировка).
 * @param {string} sortOrder - Порядок сортировки ('ASC' для возрастания, 'DESC' для убывания).
 * @returns {Array} Отсортированный массив элементов.
 */
const sortItems = (items, sortType, sortOrder) => {
  return [...items].sort((a, b) => {
    const compareResult = a[sortType] > b[sortType] ? 1 : -1;
    return sortOrder === 'ASC' ? compareResult : -compareResult;
  });
};

/**
 * @function cryptoMarketReducer
 * @description Редюсер для управления состоянием криптовалютного рынка.
 * @param {Object} state - Текущее состояние.
 * @param {Object} action - Действие для изменения состояния.
 * @param {string} action.type - Тип действия.
 * @param {*} action.payload - Полезная нагрузка действия.
 * @returns {Object} Новое состояние после применения действия.
 *
 * @description
 * Редюсер обрабатывает следующие типы действий:
 * - SET_LOADING: устанавливает состояние загрузки
 * - SET_ERROR: устанавливает состояние ошибки
 * - SET_ITEMS: обновляет список элементов
 * - SET_SINGLE_ITEM: обновляет данные отдельного элемента
 * - SET_SORT_TYPE: изменяет тип и порядок сортировки, а также сортирует элементы
 *
 * Структура состояния:
 * - isLoading: флаг, указывающий на процесс загрузки данных
 * - isError: флаг, указывающий на наличие ошибки
 * - items: массив объектов с данными о криптовалютах
 * - sortType: текущий тип сортировки
 * - sortOrder: текущий порядок сортировки
 *
 * Оптимизация производительности:
 * - Использование иммутабельного обновления состояния для избежания нежелательных побочных эффектов
 * - Применение сортировки только при необходимости (при изменении типа сортировки)
 */
const cryptoMarketReducer = (state, { type, payload }) => {
  switch (type) {
    case SET_LOADING:
      return { ...state, isLoading: payload, isError: false };
    case SET_ERROR:
      return { ...state, isError: payload, isLoading: false };
    case SET_ITEMS:
      return { ...state, items: payload };
    case SET_SORT_TYPE: {
      const sortType = payload === 'price_trend' ? 'price_change_percentage_24h' : payload;
      const sortOrder = state.sortType === sortType ? (state.sortOrder === 'ASC' ? 'DESC' : 'ASC') : 'ASC';
      const sortedItems = sortItems(state.items, sortType, sortOrder);
      return { ...state, sortType, sortOrder, items: sortedItems };
    }
    default:
      return state;
  }
};

export default cryptoMarketReducer;
