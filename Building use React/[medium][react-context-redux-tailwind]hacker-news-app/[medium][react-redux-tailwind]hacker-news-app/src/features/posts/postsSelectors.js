import { createSelector } from '@reduxjs/toolkit';

/**
 * Базовый селектор для получения состояния постов
 * @param {Object} state - Глобальное состояние Redux
 * @param {Object} state.posts - Состояние постов
 * @returns {Object} Состояние постов
 */
const selectPostsState = ({ posts }) => posts;

/**
 * Селектор для получения массива постов
 * @type {import('@reduxjs/toolkit').Selector<Object, Array>}
 */
const selectPostsHits = createSelector(
  [selectPostsState],
  ({ data: { hits } }) => hits,
);

/**
 * Селектор для получения текущей страницы
 * @type {import('@reduxjs/toolkit').Selector<Object, number>}
 */
const selectPostsPage = createSelector(
  [selectPostsState],
  ({ data: { page } }) => page,
);

/**
 * Селектор для получения общего количества страниц
 * @type {import('@reduxjs/toolkit').Selector<Object, number>}
 */
const selectPostsNbPages = createSelector(
  [selectPostsState],
  ({ data: { nbPages } }) => nbPages,
);

/**
 * Селектор для получения текущего поискового запроса
 * @type {import('@reduxjs/toolkit').Selector<Object, string>}
 */
const selectPostsQuery = createSelector(
  [selectPostsState],
  ({ data: { query } }) => query,
);

/**
 * Селектор для получения статуса запроса
 * @type {import('@reduxjs/toolkit').Selector<Object, string>}
 */
const selectPostsStatus = createSelector(
  [selectPostsState],
  ({ request: { status } }) => status,
);

/**
 * Селектор для получения информации об ошибке
 * @type {import('@reduxjs/toolkit').Selector<Object, boolean | null>}
 */
const selectPostsError = createSelector(
  [selectPostsState],
  ({ request: { error } }) => error,
);

/**
 * Селектор для получения сообщения о запросе
 * @type {import('@reduxjs/toolkit').Selector<Object, string>}
 */
const selectPostsMessage = createSelector(
  [selectPostsState],
  ({ request: { message } }) => message,
);

/**
 * Объект, содержащий все селекторы для постов
 * @type {Object.<string, import('@reduxjs/toolkit').Selector>}
 */
const postsSelectors = {
  selectPostsHits,
  selectPostsPage,
  selectPostsNbPages,
  selectPostsQuery,
  selectPostsStatus,
  selectPostsError,
  selectPostsMessage,
};

export default postsSelectors;
