import { breweryApi } from '..';

/**
 * Нормализует строку запроса, удаляя пробелы по краям и приводя к нижнему регистру.
 * @param {string} query - Строка запроса.
 * @returns {string} Нормализованная строка запроса.
 */
const normalizeQuery = (query) => query.trim().toLowerCase();

/**
 * Сервис для работы с API пивоварен.
 * @namespace
 */
const breweryService = {
  /**
   * Получает случайные пивоварни.
   * @async
   * @returns {Promise<Object[]>} Массив случайных пивоварен.
   * @throws {Error} Ошибка при выполнении запроса.
   */
  fetchRandom: async () => {
    try {
      return await breweryApi.get('breweries/random?size=50');
    } catch (error) {
      throw error;
    }
  },

  /**
   * Получает пивоварню по её идентификатору.
   * @async
   * @param {string} id - Идентификатор пивоварни.
   * @returns {Promise<Object>} Данные пивоварни.
   * @throws {Error} Ошибка при выполнении запроса.
   */
  fetchById: async (id) => {
    try {
      return await breweryApi.get(`breweries/${id}`);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Ищет пивоварни по заданному запросу.
   * @async
   * @param {string} query - Поисковый запрос.
   * @returns {Promise<Object[]>} Массив найденных пивоварен.
   * @throws {Error} Ошибка при выполнении запроса.
   */
  searchByQuery: async (query) => {
    try {
      const normalizedQuery = normalizeQuery(query);
      return await breweryApi.get(`breweries/search?query=${normalizedQuery}`);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Ищет пивоварни по стране.
   * @async
   * @param {string} country - Название страны.
   * @returns {Promise<Object[]>} Массив пивоварен в указанной стране.
   * @throws {Error} Ошибка при выполнении запроса.
   */
  searchByCountry: async (country) => {
    try {
      const normalizedCountry = normalizeQuery(country);
      return await breweryApi.get(`breweries?by_country=${normalizedCountry}`);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Ищет пивоварни по стране и запросу.
   * @async
   * @param {string} country - Название страны.
   * @param {string} query - Поисковый запрос.
   * @returns {Promise<Object[]>} Массив найденных пивоварен.
   * @throws {Error} Ошибка при выполнении запроса.
   */
  searchByCountryAndQuery: async (country, query) => {
    try {
      const normalizedCountry = normalizeQuery(country);
      const normalizedQuery = normalizeQuery(query);
      return await breweryApi.get(`breweries/search?query=${normalizedQuery}&by_country=${normalizedCountry}`);
    } catch (error) {
      throw error;
    }
  },
};

export default breweryService;
