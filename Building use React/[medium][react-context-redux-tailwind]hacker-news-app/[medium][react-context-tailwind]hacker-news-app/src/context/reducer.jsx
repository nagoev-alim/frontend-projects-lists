/**
 * @module reducer
 * @description Модуль, содержащий функцию-редюсер для управления состоянием приложения.
 * Этот редюсер обрабатывает различные действия, связанные с загрузкой данных, обработкой ошибок,
 * управлением историями, пагинацией и поиском.
 */

import { LANG } from '../lang/index.js';

const {
  actionTypes: {
    SET_LOADING,
    SET_ERROR,
    SET_STORIES,
    REMOVE_ITEM,
    HANDLE_PAGE,
    HANDLE_SEARCH,
  },
} = LANG;

/**
 * @function reducer
 * @description Функция-редюсер для управления состоянием приложения.
 * 
 * @param {Object} state - Текущее состояние приложения.
 * @param {Object} action - Объект действия, содержащий тип действия и полезную нагрузку.
 * @param {string} action.type - Тип действия.
 * @param {*} action.payload - Полезная нагрузка действия.
 * 
 * @returns {Object} Новое состояние приложения после применения действия.
 * 
 * @example
 * const newState = reducer(currentState, { type: SET_LOADING, payload: true });
 */
const reducer = (state, { type, payload }) => {
  switch (type) {
    /**
     * Устанавливает состояние загрузки и сбрасывает состояние ошибки.
     * @param {boolean} payload - Новое состояние загрузки.
     */
    case SET_LOADING: {
      return { ...state, isLoading: payload, isError: false };
    }
    /**
     * Устанавливает состояние ошибки и сбрасывает состояние загрузки.
     * @param {boolean} payload - Новое состояние ошибки.
     */
    case SET_ERROR: {
      return { ...state, isError: payload, isLoading: false };
    }
    /**
     * Обновляет список историй и количество страниц.
     * @param {Object} payload - Объект с новыми данными.
     * @param {Array} payload.hits - Массив историй.
     * @param {number} payload.nbPages - Количество страниц.
     */
    case SET_STORIES: {
      return { ...state, hits: payload.hits, nbPages: payload.nbPages };
    }
    /**
     * Удаляет элемент из списка историй.
     * @param {string} payload - ID элемента для удаления.
     */
    case REMOVE_ITEM: {
      const updatedHits = state.hits.filter(({ objectID }) => objectID !== payload);
      return { ...state, hits: updatedHits };
    }
    /**
     * Обрабатывает изменение страницы (увеличение или уменьшение).
     * @param {string} payload - 'increase' или 'decrease'.
     */
    case HANDLE_PAGE: {
      const isDecrease = payload === 'decrease';
      const change = isDecrease ? -1 : 1;
      let newPage = (state.page + change + state.nbPages) % state.nbPages;
      return { ...state, page: newPage };
    }
    /**
     * Обновляет поисковый запрос и сбрасывает номер страницы.
     * @param {string} payload - Новый поисковый запрос.
     */
    case HANDLE_SEARCH: {
      return { ...state, query: payload, page: 0 };
    }
    default:
      return state;
  }
};

export default reducer;
