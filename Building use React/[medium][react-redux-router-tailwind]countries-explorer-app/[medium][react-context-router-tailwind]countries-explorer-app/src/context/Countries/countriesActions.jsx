/**
 * @module countriesActions
 * @description Модуль, содержащий действия для работы с данными о странах.
 * Этот модуль предоставляет функции для получения информации о странах,
 * фильтрации стран по региону и поисковому запросу, а также для работы с отдельными странами.
 */

import CountriesConstants from './constants.js';
import { showToast } from '../../utils/index.js';
import axios from 'axios';

const {
  SET_LOADING,
  SET_ERROR,
  SET_ITEMS,
  SET_SINGLE_ITEM,
  SET_FILTERED_ITEMS,
  SET_BORDERS,
  BASE_URL,
} = CountriesConstants;

/**
 * @constant
 * @description Экземпляр axios для выполнения HTTP-запросов к API стран.
 */
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  validateStatus: (status) => status >= 200 && status < 300,
});

/**
 * @typedef {Object} CountriesActions
 * @property {Function} fetchAllCountries - Получает информацию о всех странах.
 * @property {Function} fetchCountryByName - Получает подробную информацию о конкретной стране.
 * @property {Function} filterCountriesByRegionAndQuery - Фильтрует страны по региону и поисковому запросу.
 */

/**
 * @type {CountriesActions}
 * @description Объект, содержащий действия для работы с данными о странах.
 */
const countriesActions = {
  /**
   * @async
   * @function fetchAllCountries
   * @description Получает информацию о всех странах и сохраняет ее в состоянии и локальном хранилище.
   * @param {Function} dispatch - Функция dispatch для обновления состояния.
   * @throws {Error} Если возникла ошибка при получении данных.
   */
  fetchAllCountries: async (dispatch) => {
    try {
      dispatch({ type: SET_LOADING, payload: true });
      const { data: payload } = await axiosInstance.get('all?fields=name,capital,flags,population,region');
      localStorage.setItem('countries', JSON.stringify(payload));
      dispatch({ type: SET_ITEMS, payload });
    } catch (error) {
      console.error('An error occurred:', error);
      dispatch({ type: SET_ERROR, payload: true });
      showToast('Failed to fetch data. Please try again later.', 'error');
    } finally {
      dispatch({ type: SET_LOADING, payload: false });
    }
  },

  /**
   * @async
   * @function fetchCountryByName
   * @description Получает подробную информацию о конкретной стране по ее названию.
   * @param {Function} dispatch - Функция dispatch для обновления состояния.
   * @param {string} itemName - Название страны для поиска.
   * @throws {Error} Если возникла ошибка при получении данных.
   */
  fetchCountryByName: async (dispatch, itemName) => {
    try {
      dispatch({ type: SET_LOADING, payload: true });
      const {
        data: [{
          name,
          nativeName,
          flag,
          capital,
          population,
          region,
          subregion,
          topLevelDomain,
          currencies,
          languages,
          borders,
        }],
      } = await axiosInstance.get(`name/${itemName}`);

      dispatch({
        type: SET_SINGLE_ITEM,
        payload: {
          name,
          nativeName,
          flag,
          capital,
          population,
          region,
          subregion,
          topLevelDomain,
          currencies,
          languages,
          borders,
        },
      });

      if (borders && borders.length !== 0) {
        const { data: borderCollection } = await axiosInstance.get(`alpha?codes=${borders.join(',')}`);
        const payload = borderCollection.map(b => b.name);
        dispatch({ type: SET_BORDERS, payload });
      }
    } catch (error) {
      console.error('An error occurred:', error);
      dispatch({ type: SET_ERROR, payload: true });
      showToast('Failed to fetch data. Please try again later.', 'error');
    } finally {
      dispatch({ type: SET_LOADING, payload: false });
    }
  },

  /**
   * @function filterCountriesByRegionAndQuery
   * @description Фильтрует страны по региону и поисковому запросу.
   * @param {Function} dispatch - Функция dispatch для обновления состояния.
   * @param {Array} items - Массив стран для фильтрации.
   * @param {string} query - Поисковый запрос.
   * @param {string} region - Регион для фильтрации.
   */
  filterCountriesByRegionAndQuery: (dispatch, items, query, region) => {
    const payload = items.filter(country =>
      (!region || country.region.includes(region)) &&
      (!query || country.name.toLowerCase().includes(query.toLowerCase())),
    );
    dispatch({ type: SET_FILTERED_ITEMS, payload });
  },
};

export default countriesActions;
