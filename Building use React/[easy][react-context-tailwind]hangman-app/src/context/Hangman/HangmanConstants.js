/**
 * @typedef {Object} HangmanConstants
 * @property {Object} api - Объект с настройками API
 * @property {string} api.baseURL - Базовый URL для API случайных слов
 * @property {Object} actions - Объект с константами действий для Redux
 * @property {string} actions.SET_LOADING - Действие для установки состояния загрузки
 * @property {string} actions.SET_ERROR - Действие для установки состояния ошибки
 * @property {string} actions.FETCH_WORD - Действие для запроса нового слова
 * @property {string} actions.SET_CORRECT_WORD - Действие для установки правильно угаданной буквы
 * @property {string} actions.SET_WRONG_WORD - Действие для установки неправильно угаданной буквы
 * @property {string} actions.SET_RESTART - Действие для перезапуска игры
 * @property {string} actions.SET_PLAYABLE - Действие для установки возможности игры
 */

/**
 * Константы для игры "Виселица"
 * @type {HangmanConstants}
 */
const HangmanConstants = {
  api: {
    baseURL: 'https://random-word-api.herokuapp.com/',
  },
  actions: {
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',
    FETCH_WORD: 'FETCH_WORD',
    SET_CORRECT_WORD: 'SET_CORRECT_WORD',
    SET_WRONG_WORD: 'SET_WRONG_WORD',
    SET_RESTART: 'SET_RESTART',
    SET_PLAYABLE: 'SET_PLAYABLE',
  },
};

export default HangmanConstants;
