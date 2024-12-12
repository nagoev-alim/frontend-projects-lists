import axios from 'axios';

/**
 * Базовый URL для API GitHub
 * @constant {string}
 */
const API_BASE_URL = 'https://api.github.com';

/**
 * Время ожидания запроса в миллисекундах
 * @constant {number}
 */
const TIMEOUT = 10000;

/**
 * Экземпляр Axios для работы с API GitHub
 * @constant {import('axios').AxiosInstance}
 */
const githubApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: TIMEOUT,
  validateStatus: (status) => status >= 200 && status < 300,
});

/**
 * Обработчик успешного ответа
 * @function
 * @param {import('axios').AxiosResponse} response - Ответ от сервера
 * @returns {import('axios').AxiosResponse} Неизмененный ответ
 */
const handleSuccessResponse = (response) => response;

/**
 * Обработчик ошибки ответа
 * @function
 * @param {import('axios').AxiosError} error - Объект ошибки
 * @returns {Promise<never>} Отклоненный промис с сообщением об ошибке
 */
const handleErrorResponse = (error) => {
  // Извлечение сообщения об ошибке из ответа или объекта ошибки
  const errorMessage = error.response?.data?.message || error.message || 'An unknown error has occurred';
  console.error('API error:', errorMessage);

  if (error.response) {
    // Объект с обработчиками для разных кодов ошибок
    const errorHandlers = {
      401: () => console.log('Authentication Error'),
      403: () => console.log('Access denied'),
      404: () => console.log('Resource not found'),
      default: () => console.log('An error occurred:', error.response.status),
    };

    // Выбор соответствующего обработчика ошибки или использование обработчика по умолчанию
    const handler = errorHandlers[error.response.status] || errorHandlers.default;
    handler();
  }

  // Отклонение промиса с сообщением об ошибке
  return Promise.reject(errorMessage);
};

// Добавление перехватчиков ответа
githubApi.interceptors.response.use(handleSuccessResponse, handleErrorResponse);

export default githubApi;
