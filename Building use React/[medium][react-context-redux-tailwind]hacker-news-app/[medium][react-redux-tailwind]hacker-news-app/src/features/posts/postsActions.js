import { createAsyncThunk } from '@reduxjs/toolkit';
import { postsService } from '../../services';

/**
 * Константа, определяющая тип действия для поискового запроса
 * @type {string}
 */
const SEARCH_QUERY = 'countries/searchQuery';

/**
 * Создает асинхронный thunk для постов
 * @param {string} type - Тип действия
 * @param {Function} apiMethod - Метод API для выполнения запроса
 * @returns {import('@reduxjs/toolkit').AsyncThunk} Асинхронный thunk
 */
const createPostsThunk = (type, apiMethod) => createAsyncThunk(type, apiMethod);

/**
 * Объект, содержащий асинхронные действия для постов
 * @type {Object.<string, import('@reduxjs/toolkit').AsyncThunk>}
 */
const postsActions = {
  /**
   * Асинхронное действие для выполнения поискового запроса
   * @type {import('@reduxjs/toolkit').AsyncThunk}
   */
  searchQuery: createPostsThunk(SEARCH_QUERY, postsService.searchQuery),
};

export default postsActions;
