import { githubApi } from '..';

/**
 * @typedef {Object} GithubService
 * @property {function(string): Promise<Array>} searchUser - Поиск пользователей GitHub
 * @property {function(string): Promise<{user: Object, repos: Array}>} fetchUserAndRepos - Получение данных пользователя и его репозиториев
 */

/**
 * @type {GithubService}
 */
const githubService = {
  /**
   * Поиск пользователей GitHub по запросу
   * @async
   * @param {string} query - Поисковый запрос
   * @returns {Promise<Array>} Массив найденных пользователей
   * @throws {Error} Ошибка при выполнении запроса
   */
  searchUser: async (query) => {
    try {
      // Выполнение GET-запроса к API GitHub для поиска пользователей
      const { data: { items } } = await githubApi.get(`/search/users?q=${query}`);
      return items;
    } catch (error) {
      // Пробрасывание ошибки выше для обработки на уровне вызывающего кода
      throw error;
    }
  },

  /**
   * Получение данных пользователя и его репозиториев
   * @async
   * @param {string} login - Логин пользователя GitHub
   * @returns {Promise<{user: Object, repos: Array}>} Объект с данными пользователя и массивом репозиториев
   * @throws {Error} Ошибка при выполнении запроса
   */
  fetchUserAndRepos: async (login) => {
    try {
      // Параллельное выполнение двух GET-запросов к API GitHub
      const [{ data: user }, { data: repos }] = await Promise.all([
        githubApi.get(`/users/${login}`),
        githubApi.get(`/users/${login}/repos?sort=created&per_page=10`),
      ]);
      return { user, repos };
    } catch (error) {
      // Пробрасывание ошибки выше для обработки на уровне вызывающего кода
      throw error;
    }
  },
};

export default githubService;
