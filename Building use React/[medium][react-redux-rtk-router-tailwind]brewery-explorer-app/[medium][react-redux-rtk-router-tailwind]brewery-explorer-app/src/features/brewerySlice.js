import { createSelector, createSlice } from '@reduxjs/toolkit';

const initialState = {
  entities: {
    breweries: {},
  },
  ids: [],
  filteredIds: [],
  loading: 'idle',
  error: null,
  currentFilter: '',
};

const brewerySlice = createSlice({
  name: 'brewery',
  initialState,
  reducers: {
    setBreweryList: (state, { payload }) => {
      // Нормализация данных
      state.entities.breweries = payload.reduce((acc, brewery) => {
        acc[brewery.id] = brewery;
        return acc;
      }, {});
      state.ids = payload.map(brewery => brewery.id);
      state.filteredIds = state.ids;
      state.loading = 'succeeded';
      state.error = null;
    },
    setLoading: (state, { payload }) => {
      state.loading = payload;
    },
    setError: (state, { payload }) => {
      state.error = payload;
      state.loading = 'failed';
    },
    filterBreweriesByQuery: (state, { payload }) => {
      const { query } = payload;
      state.currentFilter = query;

      if (!query) {
        state.filteredIds = state.ids;
        return;
      }

      const lowercaseQuery = query.toLowerCase();
      const fieldsToSearch = [
        'name', 'brewery_type', 'address_1', 'address_2',
        'address_3', 'city', 'state_province', 'country',
      ];

      state.filteredIds = state.ids.filter(id => {
        const brewery = state.entities.breweries[id];
        return fieldsToSearch.some(field =>
          brewery[field] && brewery[field].toLowerCase().includes(lowercaseQuery)
        );
      });
    },
  },
});

export const breweryReducer = brewerySlice.reducer;
export const { setBreweryList, filterBreweriesByQuery, setLoading, setError } = brewerySlice.actions;

// Селекторы
const selectBreweryState = (state) => state.brewery;

export const brewerySelectors = {
  selectAllData: createSelector(
    [selectBreweryState],
    (brewery) => ({
      breweryList: brewery.ids.map(id => brewery.entities.breweries[id]),
      filteredList: brewery.filteredIds.map(id => brewery.entities.breweries[id]),
      loading: brewery.loading,
      error: brewery.error,
    })
  )
};
