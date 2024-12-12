import axios from 'axios';

/** Базовый URL API пивоварен */
const API_BASE_URL = 'https://api.openbrewerydb.org/v1/';

/**
 * Создание экземпляра axios для API пивоварен.
 * @type {import('axios').AxiosInstance}
 */
const breweryApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000, // Таймаут запроса в миллисекундах
  validateStatus: (status) => status >= 200 && status < 300, // Проверка статуса ответа
});

/**
 * Настройка перехватчиков ответов для обработки успешных и ошибочных запросов.
 */
breweryApi.interceptors.response.use(
  /**
   * Обработчик успешных ответов.
   * @param {Object} response - Ответ от сервера.
   * @returns {*} Данные ответа.
   */
  (response) => {
    return response.data;
  },
  /**
   * Обработчик ошибок.
   * @param {Object} error - Объект ошибки.
   * @returns {Promise<never>} Отклоненный промис с сообщением об ошибке.
   */
  (error) => {
    const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred';
    console.error('API Error:', errorMessage);
    if (error.response) {
      switch (error.response.status) {
        case 401:
          console.log('Authentication error');
          break;
        case 403:
          console.log('Access denied');
          break;
        case 404:
          console.log('Resource not found');
          break;
        default:
          console.log('An error occurred:', error.response.status);
      }
    }
    return Promise.reject(errorMessage);
  },
);

export default breweryApi;
