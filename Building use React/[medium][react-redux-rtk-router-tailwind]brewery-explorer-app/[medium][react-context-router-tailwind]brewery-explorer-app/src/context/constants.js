/**
 * Константы, используемые в контексте пивоварен.
 * @namespace
 * @property {Object} api - Объект с URL-адресами API для различных запросов.
 * @property {Object} actions - Объект с типами действий для редюсера.
 */
const BreweryConstants = {
  /**
   * Объект с URL-адресами API для различных запросов к сервису пивоварен.
   * @memberof BreweryConstants
   * @type {Object}
   */
  api: {
    /** Базовый URL API */
    baseURL: 'https://api.openbrewerydb.org/v1/',
    /** URL для получения случайных пивоварен */
    randomURL: 'breweries/random?size=50',
    /** URL для получения одной пивоварни */
    singUrl: 'breweries/',
    /** URL для поиска пивоварен по запросу */
    searchUrl: 'breweries/search?query=',
    /** URL для поиска пивоварен по стране */
    countryUrl: 'breweries?by_country=',
    /**
     * Функция для формирования URL поиска по запросу и стране.
     * @param {string} query - Поисковый запрос.
     * @param {string} country - Код страны.
     * @returns {string} Сформированный URL для поиска.
     */
    bothUrl: (query, country) => `breweries/search?query=${query}&by_country=${country}`,
  },

  /**
   * Типы действий для редюсера контекста пивоварен.
   * @memberof BreweryConstants
   * @type {Object}
   */
  actions: {
    /** Установка состояния загрузки */
    SET_LOADING: 'SET_LOADING',
    /** Установка состояния ошибки */
    SET_ERROR: 'SET_ERROR',
    /** Установка списка пивоварен */
    SET_BREWERY_LIST: 'SET_BREWERY_LIST',
    /** Установка выбранной пивоварни */
    SET_SELECTED_BREWERY: 'SET_SELECTED_BREWERY',
    /** Установка отфильтрованного списка пивоварен */
    SET_FILTERED_ITEMS: 'SET_FILTERED_ITEMS',
  },
};

export default BreweryConstants;
