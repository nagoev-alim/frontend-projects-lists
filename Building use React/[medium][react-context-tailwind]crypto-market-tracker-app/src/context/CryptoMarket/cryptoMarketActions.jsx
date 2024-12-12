/**
 * @module cryptoMarketActions
 * @description Модуль, содержащий действия для управления данными криптовалютного рынка.
 */

import axios from 'axios';
import { LANG } from '../../lang/index.js';
import { showToast } from '../../utils/index.js';

const {
  actions: {
    SET_LOADING,
    SET_ERROR,
    SET_ITEMS,
    SET_SINGLE_ITEM,
    SET_SORT_TYPE,
  },
  errors,
} = LANG;

/**
 * @constant {AxiosInstance} axiosInstance
 * @description Экземпляр Axios для выполнения HTTP-запросов к API CoinGecko.
 */
const axiosInstance = axios.create({
  baseURL: 'https://api.coingecko.com/api/v3/coins/',
});

/**
 * @namespace cryptoMarketActions
 * @description Объект, содержащий действия для управления данными криптовалютного рынка.
 */
const cryptoMarketActions = {
  /**
   * @function fetchData
   * @async
   * @description Получает данные о криптовалютах с API CoinGecko.
   * @param {Function} dispatch - Функция dispatch из React Context API.
   * @throws {Error} Ошибка при получении данных.
   */
  fetchData: async (dispatch) => {
    try {
      dispatch({ type: SET_LOADING, payload: true });
      const { data: payload } = await axiosInstance.get('/markets', {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: 50,
          page: 1,
          sparkline: false,
        },
      });
      dispatch({ type: SET_ITEMS, payload });
    } catch (error) {
      console.error(errors.fetchData, error);
      dispatch({ type: SET_ERROR, payload: true });
      showToast(errors.fetchData, 'error');
    } finally {
      dispatch({ type: SET_LOADING, payload: false });
    }
  },

  /**
   * @function fetchById
   * @async
   * @description Получает данные о конкретной криптовалюте по её ID.
   * @param {Function} dispatch - Функция dispatch из React Context API.
   * @param {string} id - ID криптовалюты.
   * @returns {Promise<Object>} Данные о криптовалюте.
   * @throws {Error} Ошибка при получении данных.
   */
  fetchById: async (dispatch, id) => {
    try {
      dispatch({ type: SET_LOADING, payload: true });
      const { data: payload } = await axiosInstance.get(`/${id}`);
      return payload;
    } catch (error) {
      console.error(errors.fetchData, error);
      dispatch({ type: SET_ERROR, payload: true });
      showToast(errors.fetchData, 'error');
    } finally {
      dispatch({ type: SET_LOADING, payload: false });
    }
  },

  /**
   * @function handleSortType
   * @description Устанавливает тип сортировки для данных криптовалют.
   * @param {Function} dispatch - Функция dispatch из React Context API.
   * @param {string} payload - Тип сортировки.
   */
  handleSortType: (dispatch, payload) => {
    dispatch({ type: SET_SORT_TYPE, payload });
  },
};

export default cryptoMarketActions;
