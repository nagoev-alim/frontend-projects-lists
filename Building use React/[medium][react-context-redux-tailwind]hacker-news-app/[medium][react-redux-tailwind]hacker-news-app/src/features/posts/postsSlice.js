import { createSlice } from '@reduxjs/toolkit';
import { postsActions } from './';

/**
 * @typedef {Object} RequestState
 * @property {'idle' | 'loading' | 'success' | 'failed'} status - Текущий статус запроса
 * @property {boolean | null} error - Наличие ошибки
 * @property {string} message - Сообщение об ошибке или успешном выполнении
 */

/**
 * @typedef {Object} DataState
 * @property {Array} hits - Массив результатов поиска
 * @property {string} query - Текущий поисковый запрос
 * @property {number} page - Номер текущей страницы
 * @property {number} nbPages - Общее количество страниц
 */

/**
 * @typedef {Object} PostsState
 * @property {RequestState} request - Состояние запроса
 * @property {DataState} data - Данные постов
 */

/** @type {PostsState} */
const initialState = {
  request: {
    status: 'idle',
    error: null,
    message: '',
  },
  data: {
    hits: [],
    query: 'react',
    page: 0,
    nbPages: 0,
  },
};

/**
 * Обработчик начала асинхронной операции
 * @param {PostsState} state - Текущее состояние
 */
const handlePending = (state) => {
  state.request.status = 'loading';
  state.request.message = '';
  state.request.error = null;
};

/**
 * Обработчик успешного завершения асинхронной операции
 * @param {PostsState} state - Текущее состояние
 * @param {Object} action - Action с данными
 * @param {Function} updateData - Функция для обновления данных
 */
const handleFulfilled = (state, action, updateData) => {
  state.request.status = 'success';
  state.request.message = '';
  state.request.error = null;
  updateData(state.data, action.payload);
};

/**
 * Обработчик ошибки асинхронной операции
 * @param {PostsState} state - Текущее состояние
 * @param {Object} action - Action с данными об ошибке
 */
const handleRejected = (state, action) => {
  state.request.status = 'failed';
  state.request.error = true;
  state.request.message = action.payload;
};

/**
 * Slice для управления состоянием постов
 */
const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    /**
     * Удаление элемента из списка постов
     * @param {PostsState} state - Текущее состояние
     * @param {Object} action - Action с payload содержащим objectID для удаления
     */
    removeItem: (state, { payload }) => {
      state.data.hits = state.data.hits.filter(({ objectID }) => objectID !== payload);
    },
    /**
     * Обновление поискового запроса
     * @param {PostsState} state - Текущее состояние
     * @param {Object} action - Action с payload содержащим новый поисковый запрос
     */
    searchStory: (state, { payload }) => {
      state.data.query = payload;
      state.data.page = 0;
    },
    /**
     * Изменение текущей страницы
     * @param {PostsState} state - Текущее состояние
     * @param {Object} action - Action с payload, указывающим направление изменения ('increase' или 'decrease')
     */
    handlePage: (state, { payload }) => {
      const isDecrease = payload === 'decrease';
      const change = isDecrease ? -1 : 1;
      state.data.page = (state.data.page + change + state.data.nbPages) % state.data.nbPages;
    },
  },
  extraReducers: (builder) => {
    /**
     * Добавление обработчиков для асинхронного action
     * @param {Object} actionCreator - Асинхронный action creator
     * @param {Function} updateData - Функция для обновления данных
     */
    const addGithubCase = (actionCreator, updateData) => {
      builder
        .addCase(actionCreator.pending, handlePending)
        .addCase(actionCreator.fulfilled, (state, action) => handleFulfilled(state, action, updateData))
        .addCase(actionCreator.rejected, handleRejected);
    };

    // Добавление обработчиков для action searchQuery
    addGithubCase(postsActions.searchQuery, (data, payload) => {
      data.hits = payload.hits;
      data.nbPages = payload.nbPages;
    });
  },
});

const postsReducer = postsSlice.reducer;

export const { removeItem, searchStory, handlePage } = postsSlice.actions;

export default postsReducer;
