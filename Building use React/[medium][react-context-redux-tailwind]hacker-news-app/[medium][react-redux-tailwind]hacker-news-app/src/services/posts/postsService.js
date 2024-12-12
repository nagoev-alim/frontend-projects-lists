import { postsApi } from '..';

/**
 * Сервис для работы с постами.
 * @namespace
 */
const postsService = {
  /**
   * Выполняет поиск постов по заданному запросу.
   *
   * @async
   * @function searchQuery
   * @param {Object} params - Параметры поиска.
   * @param {string} params.query - Поисковый запрос.
   * @param {number} params.page - Номер страницы результатов.
   * @returns {Promise<Object>} Объект с результатами поиска.
   * @property {Array} hits - Массив найденных постов.
   * @property {number} nbPages - Общее количество страниц результатов.
   * @throws {Error} Ошибка, возникшая при выполнении запроса.
   */
  searchQuery: async ({ query, page }) => {
    try {
      // Выполнение GET-запроса к API
      const { data: { hits, nbPages } } = await postsApi.get('/search', {
        params: { query, page },
      });

      // Возврат результатов поиска
      return { hits, nbPages };
    } catch (error) {
      // Пробрасывание ошибки для обработки на уровне выше
      throw error;
    }
  },
};

export default postsService;
