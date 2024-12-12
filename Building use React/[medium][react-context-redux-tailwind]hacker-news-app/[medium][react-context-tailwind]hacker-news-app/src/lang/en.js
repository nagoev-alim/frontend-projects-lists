/**
 * @module LANG
 * @description Модуль, содержащий константы с текстовыми строками на английском языке для интерфейса приложения GitHub User Search.
 */
const LANG = {
  errors: {
    fetchData: 'An error occurred:',
    queryValidation: 'Please enter a valid query',
  },
  controls: {
    next: 'Next Page',
    prev: 'Previous Page',
  },
  actionTypes: {
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',
    SET_STORIES: 'SET_STORIES',
    REMOVE_ITEM: 'REMOVE_ITEM',
    HANDLE_PAGE: 'HANDLE_PAGE',
    HANDLE_SEARCH: 'HANDLE_SEARCH',
  },
  form: {
    label: 'Enter search query',
  },
  confirm: 'Are you sure you want to remove this item?',
};

export default LANG;
