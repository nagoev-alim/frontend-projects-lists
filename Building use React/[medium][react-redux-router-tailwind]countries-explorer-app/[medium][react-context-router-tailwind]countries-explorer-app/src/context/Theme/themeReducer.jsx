/**
 * @fileoverview Редюсер для управления темой приложения.
 * @module themeReducer
 */

import ThemeConstants from './constants.js';

const { SET_THEME } = ThemeConstants;

/**
 * Редюсер для обновления состояния темы.
 * 
 * @function themeReducer
 * @param {Object} state - Текущее состояние темы.
 * @param {Object} action - Объект действия для обновления состояния.
 * @param {string} action.type - Тип действия.
 * @param {*} action.payload - Полезная нагрузка действия.
 * @returns {Object} Новое состояние темы.
 */
const themeReducer = (state, { type, payload }) => {
  switch (type) {
    case SET_THEME:
      return { ...state, theme: payload };
    default:
      return state;
  }
};

export default themeReducer;
