import axios from 'axios';

/**
 * Базовый URL для API стран.
 * @constant {string}
 */
const API_BASE_URL = 'https://restcountries.com/v2/';

/**
 * Таймаут для запросов (в миллисекундах).
 * @constant {number}
 */
const TIMEOUT = 10000;

/**
 * Настроенный экземпляр Axios для работы с API стран.
 * @constant {Object}
 * @property {string} baseURL - Базовый URL для всех запросов.
 * @property {Object} headers - Заголовки, отправляемые с каждым запросом.
 * @property {number} timeout - Максимальное время ожидания ответа.
 * @property {Function} validateStatus - Функция для определения успешности запроса.
 */
const countriesApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: TIMEOUT,
  validateStatus: (status) => status >= 200 && status < 300,
});

/**
 * Обработчик успешных ответов.
 * @function handleSuccessResponse
 * @param {Object} response - Объект ответа от API.
 * @returns {Object} Неизмененный объект ответа.
 */
const handleSuccessResponse = (response) => response;

/**
 * Обработчик ошибок при ответе API.
 * @function handleErrorResponse
 * @param {Error} error - Объект ошибки.
 * @returns {Promise<Error>} Отклоненный промис с сообщением об ошибке.
 */
const handleErrorResponse = (error) => {
  const errorMessage = error.response?.data?.message || error.message || 'An unknown error has occurred';
  console.error('API error:', errorMessage);

  if (error.response) {
    const errorHandlers = {
      401: () => console.log('Authentication Error'),
      403: () => console.log('Access denied'),
      404: () => console.log('Resource not found'),
      default: () => console.log('An error occurred:', error.response.status),
    };

    const handler = errorHandlers[error.response.status] || errorHandlers.default;
    handler();
  }

  return Promise.reject(errorMessage);
};

// Добавление перехватчиков ответа
countriesApi.interceptors.response.use(handleSuccessResponse, handleErrorResponse);

/**
 * Экспортируемый объект API для работы со странами.
 * @exports countriesApi
 * @type {Object}
 */
export default countriesApi;
