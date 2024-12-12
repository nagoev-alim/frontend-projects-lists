import { createSelector } from '@reduxjs/toolkit';

/**
 * @function selectThemeState
 * @description Выбирает состояние темы из общего состояния приложения
 * @param {Object} state - Общее состояние приложения
 * @returns {Object} Состояние темы
 */
const selectThemeState = ({ theme }) => theme;

/**
 * @function selectTheme
 * @description Селектор для выбора текущей темы
 * @type {Function}
 * @returns {string} Текущая тема ('light' или 'dark')
 */
const selectTheme = createSelector(
  [selectThemeState],
  ({ theme }) => theme,
);

/**
 * @constant {Object} themeSelectors
 * @description Объект, содержащий все селекторы для работы с темой
 * @property {Function} selectTheme - Селектор для выбора текущей темы
 */
const themeSelectors = {
  selectTheme,
};

export default themeSelectors;
