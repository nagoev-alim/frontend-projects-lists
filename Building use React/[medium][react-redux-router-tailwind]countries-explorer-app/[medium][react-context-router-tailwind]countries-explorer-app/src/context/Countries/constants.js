/**
 * @module CountriesConstants
 * @description Модуль, содержащий константы для работы с данными о странах.
 */

/**
 * @constant {Object} CountriesConstants
 * @description Объект, содержащий константы для управления состоянием и действиями, связанными со странами.
 * 
 * @property {string} SET_LOADING - Константа для установки состояния загрузки.
 * @property {string} SET_ERROR - Константа для установки состояния ошибки.
 * @property {string} SET_ITEMS - Константа для установки списка стран.
 * @property {string} SET_SINGLE_ITEM - Константа для установки данных одной страны.
 * @property {string} SET_FILTERED_ITEMS - Константа для установки отфильтрованного списка стран.
 * @property {string} SET_BORDERS - Константа для установки граничащих стран.
 * @property {string} BASE_URL - Базовый URL API для получения данных о странах.
 */
const CountriesConstants = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_ITEMS: 'SET_ITEMS',
  SET_SINGLE_ITEM: 'SET_SINGLE_ITEM',
  SET_FILTERED_ITEMS: 'SET_FILTERED_ITEMS',
  SET_BORDERS: 'SET_BORDERS,',
  BASE_URL: 'https://restcountries.com/v2/',
};

export default CountriesConstants;
