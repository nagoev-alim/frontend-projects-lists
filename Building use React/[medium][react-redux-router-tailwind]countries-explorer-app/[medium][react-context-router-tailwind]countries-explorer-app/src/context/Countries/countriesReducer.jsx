/**
 * @module countriesReducer
 * @description Модуль, содержащий редюсер для управления состоянием данных о странах.
 */

import CountriesConstants from './constants.js';

const {
  SET_LOADING,
  SET_ERROR,
  SET_ITEMS,
  SET_SINGLE_ITEM,
  SET_FILTERED_ITEMS,
  SET_BORDERS,
} = CountriesConstants;

/**
 * @function countriesReducer
 * @description Редюсер для обработки действий, связанных с данными о странах.
 * 
 * @param {Object} state - Текущее состояние.
 * @param {Object} action - Объект действия.
 * @param {string} action.type - Тип действия.
 * @param {*} action.payload - Полезная нагрузка действия.
 * 
 * @returns {Object} Новое состояние после применения действия.
 */
const countriesReducer = (state, { type, payload }) => {
  switch (type) {
    /**
     * @case SET_LOADING
     * @description Устанавливает состояние загрузки и сбрасывает состояние ошибки.
     */
    case SET_LOADING:
      return { ...state, isLoading: payload, isError: false };

    /**
     * @case SET_ERROR
     * @description Устанавливает состояние ошибки и сбрасывает состояние загрузки.
     */
    case SET_ERROR:
      return { ...state, isLoading: false, isError: payload };

    /**
     * @case SET_ITEMS
     * @description Устанавливает список всех стран и отфильтрованный список стран.
     */
    case SET_ITEMS:
      return { ...state, items: payload, filteredItems: payload };

    /**
     * @case SET_FILTERED_ITEMS
     * @description Устанавливает отфильтрованный список стран.
     */
    case SET_FILTERED_ITEMS:
      return { ...state, filteredItems: payload };

    /**
     * @case SET_SINGLE_ITEM
     * @description Устанавливает данные для отдельной страны.
     */
    case SET_SINGLE_ITEM:
      return { ...state, item: payload };

    /**
     * @case SET_BORDERS
     * @description Устанавливает список границ для выбранной страны.
     */
    case SET_BORDERS:
      return { ...state, itemBorders: payload };

    /**
     * @default
     * @description Возвращает текущее состояние, если тип действия не распознан.
     */
    default:
      return state;
  }
};

export default countriesReducer;
