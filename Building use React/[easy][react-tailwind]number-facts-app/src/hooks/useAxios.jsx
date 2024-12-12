import { useState, useCallback } from 'react';
import axios from 'axios';

/**
 * Хук useAxios для выполнения HTTP-запросов с помощью axios
 * @returns {Object} Объект, содержащий состояние запроса и функцию для выполнения запроса
 * @property {any} data - Данные, полученные от запроса
 * @property {boolean} loading - Флаг, указывающий на выполнение запроса
 * @property {Error|null} error - Объект ошибки, если запрос завершился с ошибкой
 * @property {Function} fetchData - Функция для выполнения HTTP-запроса
 */
const useAxios = () => {
  // Состояние для хранения данных, полученных от запроса
  const [data, setData] = useState(null);
  // Состояние для отслеживания процесса загрузки
  const [loading, setLoading] = useState(false);
  // Состояние для хранения ошибки, если запрос завершился неудачно
  const [error, setError] = useState(null);

  /**
   * Функция для выполнения HTTP-запроса
   * @param {string} url - URL для выполнения запроса
   * @param {Object} [options={}] - Дополнительные опции для запроса axios
   * @returns {Promise<any>} Промис с данными ответа
   * @throws {Error} Ошибка, если запрос завершился неудачно
   */
  const fetchData = useCallback(async (url, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios(url, options);
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchData };
};

export default useAxios;
