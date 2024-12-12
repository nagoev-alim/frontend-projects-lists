import { createSlice } from '@reduxjs/toolkit';

/**
 * Начальное состояние для slice темы.
 * @type {Object}
 */
const initialState = {
  theme: 'light',
};

/**
 * Slice для управления состоянием темы.
 * @type {Slice}
 */
const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    /**
     * Переключает тему между 'light' и 'dark'.
     * @param {Object} state - Текущее состояние темы.
     */
    toggleTheme(state) {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
  },
});

/**
 * Reducer для управления состоянием темы.
 * @type {Reducer}
 */
const themeReducer = themeSlice.reducer;

/**
 * Action creator для переключения темы.
 * @type {ActionCreator}
 */
export const { toggleTheme } = themeSlice.actions;

export default themeReducer;
