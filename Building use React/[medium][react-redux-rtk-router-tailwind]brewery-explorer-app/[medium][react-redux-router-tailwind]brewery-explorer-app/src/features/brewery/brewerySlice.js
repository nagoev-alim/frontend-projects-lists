import { createSlice } from '@reduxjs/toolkit';
import { breweryActions } from './';

/**
 * Начальное состояние для среза пивоварни.
 * @type {Object}
 */
const initialState = {
  request: {
    status: 'idle',
    error: null,
    message: '',
  },
  data: {
    breweryList: [],
    filteredList: [],
    selectedBrewery: null,
  },
};

/**
 * Обработчик ожидания запроса.
 * @param {Object} state - Текущее состояние.
 */
const handlePending = (state) => {
  state.request.status = 'loading';
  state.request.message = '';
  state.request.error = null;
};

/**
 * Обработчик успешного выполнения запроса.
 * @param {Object} state - Текущее состояние.
 * @param {Object} action - Действие Redux с полезной нагрузкой.
 * @param {Function} updateData - Функция для обновления данных.
 */
const handleFulfilled = (state, action, updateData) => {
  state.request.status = 'success';
  state.request.message = '';
  state.request.error = null;
  updateData(state.data, action.payload);
};

/**
 * Обработчик ошибки запроса.
 * @param {Object} state - Текущее состояние.
 * @param {Object} action - Действие Redux с сообщением об ошибке.
 */
const handleRejected = (state, action) => {
  state.request.status = 'failed';
  state.request.error = true;
  state.request.message = action.payload;
};

/**
 * Срез Redux для управления состоянием пивоварни.
 */
const brewerySlice = createSlice({
  name: 'brewery',
  initialState,
  reducers: {
    /**
     * Фильтрует пивоварни по запросу.
     * @param {Object} state - Текущее состояние.
     * @param {Object} payload - Полезная нагрузка с запросом и элементами.
     */
    filterBreweriesByQuery: (state, { payload }) => {
      if (!payload.query) {
        state.data.breweryList = payload.items;
        return;
      }

      const lowercaseQuery = payload.query.toLowerCase();
      const fieldsToSearch = [
        'name', 'brewery_type', 'address_1', 'address_2',
        'address_3', 'city', 'state_province', 'country',
      ];

      state.data.filteredList = payload.items.filter(item =>
        fieldsToSearch.some(field =>
          item[field] && item[field].toLowerCase().includes(lowercaseQuery),
        ),
      );
    },
  },
  extraReducers: (builder) => {
    /**
     * Добавляет обработчики для асинхронных действий пивоварни.
     * @param {Function} actionCreator - Создатель действия.
     * @param {Function} updateData - Функция для обновления данных.
     */
    const addBreweryCase = (actionCreator, updateData) => {
      builder
        .addCase(actionCreator.pending, handlePending)
        .addCase(actionCreator.fulfilled, (state, action) => handleFulfilled(state, action, updateData))
        .addCase(actionCreator.rejected, handleRejected);
    };

    // Добавление обработчиков для различных асинхронных действий
    addBreweryCase(breweryActions.fetchRandom, (data, payload) => {
      data.breweryList = payload;
      data.filteredList = payload;
    });
    addBreweryCase(breweryActions.fetchById, (data, payload) => {
      console.log(1);
      console.log(payload);
      data.selectedBrewery = payload;
    });
    addBreweryCase(breweryActions.searchByQuery, (data, payload) => {
      data.breweryList = payload;
      data.filteredList = payload;
    });
    addBreweryCase(breweryActions.searchByCountry, (data, payload) => {
      data.breweryList = payload;
      data.filteredList = payload;
    });
    addBreweryCase(breweryActions.searchByCountryAndQuery, (data, payload) => {
      data.breweryList = payload;
      data.filteredList = payload;
    });
  },
});

const breweryReducer = brewerySlice.reducer;

export const { filterBreweriesByQuery } = brewerySlice.actions;

export default breweryReducer;
