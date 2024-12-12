import { countriesApi } from '..';

/**
 * @typedef {Object} Country
 * @property {string} name - Название страны
 * @property {string} nativeName - Название страны на родном языке
 * @property {string} flag - URL флага страны
 * @property {string} capital - Столица страны
 * @property {number} population - Население страны
 * @property {string} region - Регион, в котором находится страна
 * @property {string} subregion - Субрегион страны
 * @property {string[]} topLevelDomain - Домены верхнего уровня страны
 * @property {Object[]} currencies - Валюты страны
 * @property {Object[]} languages - Языки страны
 * @property {string[]} borders - Названия соседних стран
 */

/**
 * Сервис для работы с API стран
 * @namespace
 */
const countriesService = {
  /**
   * Получает информацию о всех странах
   * @async
   * @function fetchAllCountries
   * @returns {Promise<Array>} Массив с данными о странах
   * @throws {Error} Если произошла ошибка при запросе
   */
  fetchAllCountries: async () => {
    try {
      // Запрашиваем данные о всех странах с определенными полями
      const { data: payload } = await countriesApi.get('all?fields=name,capital,flags,population,region');
      return payload;
    } catch (error) {
      // Перебрасываем ошибку дальше для обработки на уровне компонента
      throw error;
    }
  },

  /**
   * Получает подробную информацию о стране по её названию
   * @async
   * @function fetchCountryByName
   * @param {string} countryName - Название страны
   * @returns {Promise<Country>} Объект с подробной информацией о стране
   * @throws {Error} Если произошла ошибка при запросе
   */
  fetchCountryByName: async (countryName) => {
    try {
      // Запрашиваем данные о конкретной стране
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
      } = await countriesApi.get(`name/${countryName}`);

      let countryBorders = [];

      // Если у страны есть границы, получаем информацию о соседних странах
      if (borders && borders.length !== 0) {
        const { data: borderCollection } = await countriesApi.get(`alpha?codes=${borders.join(',')}`);
        countryBorders = borderCollection.map(b => b.name);
      }

      // Возвращаем объект с информацией о стране
      return {
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
        borders: countryBorders,
      };
    } catch (error) {
      console.error('Error fetching country data:', error);
      throw error;
    }
  },
};

export default countriesService;
