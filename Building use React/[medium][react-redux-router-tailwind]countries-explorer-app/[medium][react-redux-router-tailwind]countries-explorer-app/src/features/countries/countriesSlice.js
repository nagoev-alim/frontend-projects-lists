import { createSlice } from '@reduxjs/toolkit';
import { countriesActions } from './';

/**
 * Начальное состояние для slice стран.
 * @type {Object}
 */
const initialState = {
  request: {
    status: 'idle',
    error: null,
    message: '',
  },
  data: {
    countries: [],
    countriesFiltered: [],
    selectedCountry: null,
  },
};

/**
 * Обработчик для pending состояния асинхронного action'а.
 * @param {Object} state - Текущее состояние.
 */
const handlePending = (state) => {
  state.request.status = 'loading';
  state.request.message = '';
  state.request.error = null;
};

/**
 * Обработчик для fulfilled состояния асинхронного action'а.
 * @param {Object} state - Текущее состояние.
 * @param {Object} action - Action с payload.
 * @param {Function} updateData - Функция для обновления данных.
 */
const handleFulfilled = (state, action, updateData) => {
  state.request.status = 'success';
  state.request.message = '';
  state.request.error = null;
  updateData(state.data, action.payload);
};

/**
 * Обработчик для rejected состояния асинхронного action'а.
 * @param {Object} state - Текущее состояние.
 * @param {Object} action - Action с payload ошибки.
 */
const handleRejected = (state, action) => {
  state.request.status = 'failed';
  state.request.error = true;
  state.request.message = action.payload;
};

/**
 * Slice для управления состоянием стран.
 */
const countriesSlice = createSlice({
  name: 'countries',
  initialState,
  reducers: {
    /**
     * Reducer для фильтрации стран по запросу и региону.
     * @param {Object} state - Текущее состояние.
     * @param {Object} payload - Данные для фильтрации.
     */
    filterCountriesByQuery: (state, { payload: { countries, formState: { search, region } } }) => {
      state.data.countriesFiltered = countries.filter(country =>
        (!region || country.region.includes(region)) &&
        (!search || country.name.toLowerCase().includes(search.toLowerCase())),
      );
    },
  },
  extraReducers: (builder) => {
    /**
     * Функция для добавления обработчиков асинхронных action'ов.
     * @param {Function} actionCreator - Создатель асинхронного action'а.
     * @param {Function} updateData - Функция для обновления данных.
     */
    const addCountriesCase = (actionCreator, updateData) => {
      builder
        .addCase(actionCreator.pending, handlePending)
        .addCase(actionCreator.fulfilled, (state, action) => handleFulfilled(state, action, updateData))
        .addCase(actionCreator.rejected, handleRejected);
    };
    
    // Добавление обработчиков для fetchAllCountries
    addCountriesCase(countriesActions.fetchAllCountries, (data, payload) => {
      data.countries = payload;
      data.countriesFiltered = payload;
    });
    
    // Добавление обработчиков для fetchCountryByName
    addCountriesCase(countriesActions.fetchCountryByName, (data, payload) => {
      data.selectedCountry = payload;
    });
  },
});

const countriesReducer = countriesSlice.reducer;

export const { filterCountriesByQuery } = countriesSlice.actions;

export default countriesReducer;
