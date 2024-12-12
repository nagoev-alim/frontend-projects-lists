/**
 * @module appActions
 * @description Модуль, содержащий действия для управления состоянием приложения Hacker News.
 * Этот модуль предоставляет набор функций для выполнения асинхронных операций,
 * таких как загрузка данных, и синхронных операций, таких как удаление элементов,
 * поиск и управление пагинацией.
 *
 * @requires axios - Библиотека для выполнения HTTP-запросов
 * @requires ../lang/index.js - Модуль с языковыми константами и типами действий
 * @requires ../utils/index.js - Модуль с утилитарными функциями
 */

import { LANG } from '../lang/index.js';
import axios from 'axios';
import { showToast } from '../utils/index.js';

const {
  actionTypes: {
    SET_LOADING,
    SET_STORIES,
    SET_ERROR,
    REMOVE_ITEM,
    HANDLE_SEARCH,
    HANDLE_PAGE,
  },
  errors,
} = LANG;

/**
 * @typedef {Object} AppActions
 * @property {function} fetchData - Асинхронная функция для загрузки данных с API Hacker News
 * @property {function} removeItem - Функция для удаления элемента из списка
 * @property {function} searchStory - Функция для выполнения поиска
 * @property {function} handlePage - Функция для управления пагинацией
 */

/**
 * Объект, содержащий все действия приложения
 * @type {AppActions}
 */
const appActions = {
  /**
   * Загружает данные с API Hacker News
   * @async
   * @function fetchData
   * @param {function} dispatch - Функция dispatch для отправки действий в reducer
   * @param {string} query - Поисковый запрос
   * @param {number} page - Номер страницы для загрузки
   * @throws {Error} Ошибка при загрузке данных
   */
  fetchData: async (dispatch, query, page) => {
    try {
      dispatch({ type: SET_LOADING, payload: true });
      const { data: { hits, nbPages } } = await axios.get('https://hn.algolia.com/api/v1/search', {
        params: { query, page },
      });
      dispatch({ type: SET_STORIES, payload: { hits, nbPages } });
    } catch (error) {
      console.error(errors.fetchData, error);
      showToast(errors.fetchData, 'error');
      dispatch({ type: SET_ERROR, payload: true });
    } finally {
      dispatch({ type: SET_LOADING, payload: false });
    }
  },

  /**
   * Удаляет элемент из списка историй
   * @function removeItem
   * @param {function} dispatch - Функция dispatch для отправки действий в reducer
   * @param {string} payload - ID элемента для удаления
   */
  removeItem: (dispatch, payload) => dispatch({
    type: REMOVE_ITEM,
    payload,
  }),

  /**
   * Выполняет поиск историй
   * @function searchStory
   * @param {function} dispatch - Функция dispatch для отправки действий в reducer
   * @param {string} payload - Поисковый запрос
   */
  searchStory: (dispatch, payload) => dispatch({
    type: HANDLE_SEARCH,
    payload,
  }),

  /**
   * Обновляет текущую страницу
   * @function handlePage
   * @param {function} dispatch - Функция dispatch для отправки действий в reducer
   * @param {number} payload - Номер новой страницы
   */
  handlePage: (dispatch, payload) => dispatch({
    type: HANDLE_PAGE,
    payload,
  }),
};

export default appActions;
