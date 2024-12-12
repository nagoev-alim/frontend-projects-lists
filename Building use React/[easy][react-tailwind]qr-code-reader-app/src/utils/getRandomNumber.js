/**
 * Генерирует случайное целое число в заданном диапазоне.
 * @param {number} min - Минимальное значение диапазона (включительно).
 * @param {number} max - Максимальное значение диапазона (включительно).
 * @returns {number} Случайное целое число в заданном диапазоне.
 */
const getRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export default getRandomNumber;
