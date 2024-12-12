/**
 * @module BreweryReducer
 * @description Модуль, содержащий редюсер для управления состоянием пивоварен в контексте приложения.
 * Этот модуль обрабатывает различные действия, связанные с загрузкой, фильтрацией и выбором пивоварен.
 */
import { BreweryConstants } from './index';

// Деструктуризация констант действий из BreweryConstants
const {
  actions: {
    SET_LOADING,
    SET_ERROR,
    SET_BREWERY_LIST,
    SET_SELECTED_BREWERY,
    SET_FILTERED_ITEMS,
  },
} = BreweryConstants;

/**
 * Редюсер для управления состоянием пивоварен.
 *
 * @function breweryReducer
 *
 * @description
 * Этот редюсер обрабатывает следующие типы действий:
 * - SET_LOADING: Устанавливает состояние загрузки.
 * - SET_ERROR: Устанавливает состояние ошибки.
 * - SET_BREWERY_LIST: Устанавливает список пивоварен и фильтрованный список.
 * - SET_FILTERED_ITEMS: Устанавливает отфильтрованный список пивоварен.
 * - SET_SELECTED_BREWERY: Устанавливает выбранную пивоварню.
 */
const breweryReducer = (state, { type, payload }) => {
  switch (type) {
    case SET_LOADING:
      // Устанавливаем состояние загрузки и сбрасываем ошибку
      return { ...state, isLoading: payload, isError: false };
    case SET_ERROR:
      // Устанавливаем состояние ошибки и сбрасываем загрузку
      return { ...state, isLoading: false, isError: payload };
    case SET_BREWERY_LIST:
      // Устанавливаем список пивоварен и фильтрованный список, сбрасываем загрузку и ошибку
      return { ...state, breweryList: payload, filteredList: payload, isLoading: false, isError: false };
    case SET_FILTERED_ITEMS:
      // Обновляем только фильтрованный список
      return { ...state, filteredList: payload };
    case SET_SELECTED_BREWERY:
      // Устанавливаем выбранную пивоварню, сбрасываем загрузку и ошибку
      return { ...state, selectedBrewery: payload, isLoading: false, isError: false };
    default:
      // Если тип действия неизвестен, возвращаем текущее состояние без изменений
      return state;
  }
};

export default breweryReducer;
