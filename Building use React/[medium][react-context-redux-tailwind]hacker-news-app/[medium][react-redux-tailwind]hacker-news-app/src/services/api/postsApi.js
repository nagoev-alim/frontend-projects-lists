import axios from 'axios';

/**
 * Базовый URL API для запросов к Hacker News Algolia API.
 * @constant {string}
 */
const API_BASE_URL = 'https://hn.algolia.com/api/v1';

/**
 * Таймаут для API запросов в миллисекундах.
 * @constant {number}
 */
const TIMEOUT = 10000;

/**
 * Создание экземпляра axios для API запросов к постам.
 * @type {import('axios').AxiosInstance}
 */
const postsApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: TIMEOUT,
  validateStatus: (status) => status >= 200 && status < 300,
});

/**
 * Обработчик успешных ответов от API.
 * @param {import('axios').AxiosResponse} response - Ответ от API.
 * @returns {import('axios').AxiosResponse} Неизмененный ответ.
 */
const handleSuccessResponse = (response) => response;

/**
 * Обработчик ошибок от API.
 * @param {import('axios').AxiosError} error - Объект ошибки.
 * @returns {Promise<never>} Отклоненный промис с сообщением об ошибке.
 */
const handleErrorResponse = (error) => {
  // Извлечение сообщения об ошибке из ответа или использование стандартного сообщения
  const errorMessage = error.response?.data?.message || error.message || 'An unknown error has occurred';
  console.error('API error:', errorMessage);

  if (error.response) {
    // Обработка различных кодов состояния ошибок
    const errorHandlers = {
      401: () => console.log('Authentication Error'),
      403: () => console.log('Access denied'),
      404: () => console.log('Resource not found'),
      default: () => console.log('An error occurred:', error.response.status),
    };

    // Вызов соответствующего обработчика ошибки
    const handler = errorHandlers[error.response.status] || errorHandlers.default;
    handler();
  }

  // Отклонение промиса с сообщением об ошибке
  return Promise.reject(errorMessage);
};

// Добавление перехватчиков ответа
postsApi.interceptors.response.use(handleSuccessResponse, handleErrorResponse);

export default postsApi;
