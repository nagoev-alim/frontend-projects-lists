import { createSlice } from '@reduxjs/toolkit';
import { createSelector } from '@reduxjs/toolkit';

const initialState = {
  theme: 'light',
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
  },
});

const themeReducer = themeSlice.reducer;

export const { toggleTheme } = themeSlice.actions;

const themeSelectors = {
  selectTheme: createSelector(
    [({ theme }) => theme],
    ({ theme }) => theme,
  ),
};


export { themeSelectors, themeReducer };
