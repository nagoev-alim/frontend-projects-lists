/**
 * @module rootService
 * @description Модуль, предоставляющий сервис для взаимодействия с корневым API приложения.
 * Этот сервис обеспечивает CRUD операции для работы с отзывами.
 */

import { rootApi } from '@services';

/**
 * @typedef {Object} Review
 * @property {string} id - Уникальный идентификатор отзыва
 * @property {string} text - Текст отзыва
 * @property {number} rating - Рейтинг отзыва
 */

/**
 * Сервис для работы с корневым API.
 * @namespace
 */
const rootService = {
  /**
   * Создает новый отзыв.
   * @function create
   * @param {Object} newData - Данные нового отзыва
   * @returns {Promise<Review>} Созданный отзыв
   * @throws {Error} Ошибка при создании отзыва
   */
  async create(newData) {
    try {
      const { data } = await rootApi.post('/', newData);
      return data;
    } catch (error) {
      console.error('Error while creating review:', error);
      throw new Error('Failed to create review');
    }
  },

  /**
   * Получает все отзывы.
   * @function read
   * @returns {Promise<Review[]>} Массив отзывов
   * @throws {Error} Ошибка при получении отзывов
   */
  async read() {
    try {
      const { data } = await rootApi.get('/');
      return data;
    } catch (error) {
      console.error('Error while fetching reviews:', error);
      throw new Error('Failed to fetch reviews');
    }
  },

  /**
   * Обновляет существующий отзыв.
   * @function update
   * @param {Object} params - Параметры обновления
   * @param {string} params.reviewId - ID обновляемого отзыва
   * @param {Object} params.updatedData - Новые данные для отзыва
   * @returns {Promise<Review>} Обновленный отзыв
   * @throws {Error} Ошибка при обновлении отзыва
   */
  async update({ reviewId, updatedData }) {
    try {
      const { data } = await rootApi.put(`/${reviewId}`, updatedData);
      return data;
    } catch (error) {
      console.error(`Error while updating review ${reviewId}:`, error);
      throw new Error(`Failed to update review ${reviewId}`);
    }
  },

  /**
   * Удаляет отзыв.
   * @function delete
   * @param {string} reviewId - ID удаляемого отзыва
   * @returns {Promise<string>} ID удаленного отзыва
   * @throws {Error} Ошибка при удалении отзыва
   */
  async delete(reviewId) {
    try {
      await rootApi.delete(`/${reviewId}`);
      return reviewId;
    } catch (error) {
      console.error(`Error while deleting review ${reviewId}:`, error);
      throw new Error(`Failed to delete review ${reviewId}`);
    }
  },
};

export default rootService;
