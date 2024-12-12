/**
 * @module themeActions
 * @description Модуль, содержащий действия для управления темой приложения.
 */

import ThemeConstants from './constants.js';

const { SET_THEME } = ThemeConstants;

/**
 * @typedef {Object} ThemeActions
 * @property {Function} handleSetTheme - Функция для установки темы.
 */

/**
 * @type {ThemeActions}
 * @description Объект, содержащий действия для управления темой.
 */
const themeActions = {
  /**
   * @function handleSetTheme
   * @description Создает и отправляет действие для установки новой темы.
   * @param {Function} dispatch - Функция dispatch из useReducer или Redux.
   * @param {string} payload - Новое значение темы (например, 'light' или 'dark').
   * @returns {void}
   */
  handleSetTheme: (dispatch, payload) => dispatch({ type: SET_THEME, payload }),
};

export default themeActions;
