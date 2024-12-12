import { createSelector } from '@reduxjs/toolkit';

/**
 * Базовый селектор для получения состояния темы.
 * @param {Object} state - Глобальное состояние Redux.
 * @returns {Object} Состояние темы.
 */
const selectThemeState = ({ theme }) => theme;

/**
 * Мемоизированный селектор для получения текущей темы.
 * @type {Function}
 * @returns {string} Текущая тема ('light' или 'dark').
 */
const selectTheme = createSelector(
  [selectThemeState],
  ({ theme }) => theme,
);

/**
 * Объект, содержащий все селекторы для работы с темой.
 * @type {Object}
 */
const themeSelectors = {
  selectTheme,
};

export default themeSelectors;
