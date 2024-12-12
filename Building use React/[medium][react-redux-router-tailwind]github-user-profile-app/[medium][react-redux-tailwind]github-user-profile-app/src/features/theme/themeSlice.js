import { createSlice } from '@reduxjs/toolkit';

/**
 * @typedef {Object} ThemeState
 * @property {string} theme - Текущая тема ('light' или 'dark')
 */

/** @type {ThemeState} */
const initialState = {
  theme: 'light',
};

/**
 * @constant {Object} themeSlice
 * @description Slice для управления состоянием темы в Redux
 */
const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    /**
     * @function toggleTheme
     * @description Переключает тему между 'light' и 'dark'
     * @param {ThemeState} state - Текущее состояние темы
     */
    toggleTheme(state) {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
  },
});

/**
 * @constant {Function} themeReducer
 * @description Редюсер для управления состоянием темы
 */
const themeReducer = themeSlice.reducer;

/**
 * @constant {Function} toggleTheme
 * @description Действие для переключения темы
 */
export const { toggleTheme } = themeSlice.actions;

export default themeReducer;

const selectThemeState = ({ theme }) => theme;

const selectTheme = createSelector(
  [selectThemeState],
  ({ theme }) => theme,
);
