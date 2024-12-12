import { BreweryConstants } from './index';
import { showToast } from '../utils/index';
import { LANG } from '../lang/index';
import axios from 'axios';

// Деструктуризация констант действий и URL-адресов API из объекта BreweryConstants
const {
  actions: {
    SET_LOADING,
    SET_ERROR,
    SET_BREWERY_LIST,
    SET_SELECTED_BREWERY,
    SET_FILTERED_ITEMS,
  },
  api: {
    baseURL,
    randomURL,
    searchUrl,
    countryUrl,
    singUrl,
    bothUrl,
  },
} = BreweryConstants;

/**
 * @constant {AxiosInstance} axiosInstance
 * @description Создает настроенный экземпляр Axios для выполнения HTTP-запросов.
 *
 * @property {string} baseURL - Базовый URL для всех запросов. Значение берется из объекта BreweryConstants.
 * @property {Object} headers - Заголовки, которые будут отправлены с каждым запросом.
 * @property {string} headers['Content-Type'] - Устанавливает тип содержимого запроса как JSON.
 * @property {number} timeout - Максимальное время ожидания ответа от сервера в миллисекундах.
 * @property {Function} validateStatus - Функция для определения, считается ли статус ответа успешным.
 * @returns {AxiosInstance} Настроенный экземпляр Axios.
 * @throws {AxiosError} Выбрасывает ошибку, если запрос не удался или превысил время ожидания.
 */
const axiosInstance = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
  validateStatus: (status) => status >= 200 && status < 300,
});

/**
 * @typedef {Object} BreweryActions
 * @description Объект, содержащий действия для работы с данными о пивоварнях.
 */
const breweryActions = {
  /**
   * @function fetchRandomBreweries
   * @async
   * @description Получает список случайных пивоварен.
   * @param {Function} dispatch - Функция dispatch для отправки действий в Redux.
   * @returns {Promise<void>}
   */
  fetchRandomBreweries: async (dispatch) => {
    await performApiRequest(dispatch, () => axiosInstance.get(randomURL), SET_BREWERY_LIST);
  },

  /**
   * @function filterBreweriesByQuery
   * @description Фильтрует список пивоварен по заданному запросу.
   * @param {Function} dispatch - Функция dispatch для отправки действий в Redux.
   * @param {Array} items - Массив пивоварен для фильтрации.
   * @param {string} query - Строка запроса для фильтрации.
   */
  filterBreweriesByQuery: (dispatch, items, query) => {
    if (!query) {
      // Если запрос пустой, возвращаем все элементы
      dispatch({ type: SET_FILTERED_ITEMS, payload: items });
      return;
    }
    // Фильтруем элементы и отправляем результат
    const filteredItems = filterItems(items, query);
    dispatch({ type: SET_FILTERED_ITEMS, payload: filteredItems });
  },

  /**
   * @function searchByQuery
   * @async
   * @description Выполняет поиск пивоварен по заданному запросу.
   * @param {Function} dispatch - Функция dispatch для отправки действий в Redux.
   * @param {string} query - Строка запроса для поиска.
   * @returns {Promise<void>}
   */
  searchByQuery: async (dispatch, query) => {
    await performApiRequest(dispatch, () => axiosInstance.get(`${searchUrl}${normalizeQuery(query)}`), SET_BREWERY_LIST);
  },

  /**
   * @function searchByCountry
   * @async
   * @description Выполняет поиск пивоварен по заданной стране.
   * @param {Function} dispatch - Функция dispatch для отправки действий в Redux.
   * @param {string} country - Название страны для поиска.
   * @returns {Promise<void>}
   */
  searchByCountry: async (dispatch, country) => {
    await performApiRequest(dispatch, () => axiosInstance.get(`${countryUrl}${normalizeQuery(country)}`), SET_BREWERY_LIST);
  },

  /**
   * @function searchByCountryAndQuery
   * @async
   * @description Выполняет поиск пивоварен по заданной стране и запросу.
   * @param {Function} dispatch - Функция dispatch для отправки действий в Redux.
   * @param {string} country - Название страны для поиска.
   * @param {string} query - Строка запроса для поиска.
   * @returns {Promise<void>}
   */
  searchByCountryAndQuery: async (dispatch, country, query) => {
    await performApiRequest(dispatch, () => axiosInstance.get(bothUrl(query, country)), SET_BREWERY_LIST);
  },

  /**
   * @function fetchById
   * @async
   * @description Получает информацию о конкретной пивоварне по её ID.
   * @param {Function} dispatch - Функция dispatch для отправки действий в Redux.
   * @param {string|number} id - Идентификатор пивоварни.
   * @returns {Promise<void>}
   */
  fetchById: async (dispatch, id) => {
    await performApiRequest(dispatch, () => axiosInstance.get(`${singUrl}${id}`), SET_SELECTED_BREWERY);
  },
};

/**
 * @function performApiRequest
 * @async
 * @description Выполняет API-запрос с обработкой состояния загрузки и ошибок.
 *
 * @param {Function} dispatch - Функция диспетчера для отправки действий в Redux.
 * @param {Function} apiCall - Асинхронная функция, выполняющая API-запрос.
 * @param {string} successActionType - Тип действия, которое будет отправлено при успешном запросе.
 *
 * @returns {Promise<void>}
 * @throws {Error} Ошибка, возникшая при выполнении API-запроса, будет обработана функцией handleApiError.
 */
const performApiRequest = async (dispatch, apiCall, successActionType) => {
  try {
    // Устанавливаем состояние загрузки
    dispatch({ type: SET_LOADING, payload: true });
    // Выполняем API-запрос
    const { data: payload } = await apiCall();
    // Отправляем полученные данные с соответствующим типом действия
    dispatch({ type: successActionType, payload });
  } catch (error) {
    // В случае ошибки вызываем функцию обработки ошибок
    handleApiError(dispatch, error);
  }
};

/**
 * @function handleApiError
 * @description Обрабатывает ошибки, возникшие при выполнении API-запросов.
 * @param {Function} dispatch - Функция диспетчера для отправки действий в Redux.
 * @param {Error} error - Объект ошибки, полученный при выполнении запроса.
 * @returns {void}
 * @throws {Error} Не выбрасывает ошибок, но логирует их в консоль.
 */
const handleApiError = (dispatch, error) => {
  // Логируем ошибку в консоль для отладки
  console.error(LANG.actions.occurred, error);
  // Отображаем пользователю уведомление об ошибке
  showToast(LANG.actions.fetchBreweryFailed, 'error');
  // Устанавливаем состояние ошибки в Redux store
  dispatch({ type: SET_ERROR, payload: true });
};

/**
 * @function filterItems
 * @description Фильтрует массив элементов на основе заданного запроса.
 * @param {Array<Object>} items - Массив объектов для фильтрации. Каждый объект представляет пивоварню.
 * @param {string} query - Строка запроса для фильтрации.
 * @returns {Array<Object>} Отфильтрованный массив объектов пивоварен.
 */
const filterItems = (items, query) => {
  // Приводим запрос к нижнему регистру для регистронезависимого поиска
  const lowercaseQuery = query.toLowerCase();
  // Определяем поля объекта, по которым будет производиться поиск
  const fieldsToSearch = [
    'name', 'brewery_type', 'address_1', 'address_2',
    'address_3', 'city', 'state_province', 'country',
  ];

  // Фильтруем массив items
  return items.filter(item =>
    // Для каждого элемента проверяем, содержит ли хотя бы одно из указанных полей запрос
    fieldsToSearch.some(field =>
      // Проверяем существование поля и наличие в нем подстроки запроса
      item[field] && item[field].toLowerCase().includes(lowercaseQuery),
    ),
  );
};

/**
 * Нормализует строку запроса.
 * @function normalizeQuery
 * @param {string} query - Исходная строка запроса.
 * @returns {string} Нормализованная строка запроса.
 */
const normalizeQuery = (query) => query.trim().toLowerCase();

export default breweryActions;
