import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type InitialState = {
  filters: string[];
}

const initialState: InitialState = {
  filters: [],
};

export const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  selectors: {
    selectFilters: (state: InitialState) => state.filters,
  },
  reducers: {
    addFilter: (state, action: PayloadAction<string>) => {
      state.filters = state.filters.includes(action.payload) ? state.filters : [...state.filters, action.payload];
    },
    removeFilter: (state, action: PayloadAction<string>) => {
      state.filters = state.filters.filter((filter) => filter !== action.payload);
    },
    clearFilters: (state) => {
      state.filters = [];
    },
  },
});
