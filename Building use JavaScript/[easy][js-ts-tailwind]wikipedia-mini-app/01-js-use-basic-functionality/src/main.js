/**
 * Это приложение для поиска статей в Wikipedia. Оно позволяет пользователям вводить
 * поисковые запросы и отображает результаты, полученные через API Wikipedia.
 * Приложение использует Toastify для отображения уведомлений и axios для HTTP-запросов.
 */

import './style.css';
import wikiLogo from '/logo.svg';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';

/**
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента приложения
 * @property {Object} selectors - Селекторы для основных элементов
 * @property {string} url - URL для API-запросов к Wikipedia
 */

/** @type {AppConfig} */
const APP_CONFIG = {
  root: '#app',
  selectors: {
    searchForm: '[data-search-form]',
    searchResults: '[data-search-results]',
  },
  url: 'https://en.wikipedia.org/w/api.php?action=query&list=search&srlimit=20&format=json&origin=*&srsearch=',
};

/**
 * @typedef {Object} AppState
 * @property {Object} elements - Ссылки на DOM-элементы
 */

/** @type {AppState} */
const APP_STATE = {
  elements: {
    searchForm: null,
    searchFormButton: null,
    searchResults: null,
  },
};

/**
 * @typedef {Object} AppUtils
 * @property {Function} renderDataAttributes - Функция для рендеринга data-атрибутов
 * @property {Object} toastConfig - Конфигурация для Toastify
 * @property {Function} showToast - Функция для отображения уведомлений
 * @property {Function} handleError - Функция для обработки ошибок
 */

/** @type {AppUtils} */
const APP_UTILS = {
  /**
   * Рендерит data-атрибуты
   * @param {string} element - Строка с data-атрибутом
   * @returns {string} Отформатированная строка data-атрибута
   */
  renderDataAttributes: (element) => element.slice(1, -1),
  
  /**
   * Конфигурация для Toastify
   */
  toastConfig: {
    className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
    duration: 3000,
    gravity: 'bottom',
    position: 'center',
  },
  
  /**
   * Показывает уведомление
   * @param {string} message - Текст уведомления
   */
  showToast: (message) => {
    Toastify({
      text: message,
      ...APP_UTILS.toastConfig,
    }).showToast();
  },
  
  /**
   * Обрабатывает ошибки
   * @param {string} message - Сообщение об ошибке
   * @param {Error} [error] - Объект ошибки (опционально)
   */
  handleError: (message, error = null) => {
    APP_UTILS.showToast(message);
    if (error) console.error(message, error);
  },
};

/**
 * Создает HTML-структуру приложения
 */
function createAppHTML() {
  const { root, selectors: { searchForm, searchResults } } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='mx-auto grid w-full max-w-4xl items-start gap-4'>
      <div class='mx-auto grid w-full max-w-xl place-items-center gap-3 rounded border bg-white p-3'>
        <img src='${wikiLogo}' alt='Wikipedia'>
        <h1 class='text-center text-2xl font-bold md:text-4xl'>Search Wikipedia</h1>
        <form class='grid w-full gap-3' ${renderDataAttributes(searchForm)}>
          <label>
            <input class='w-full rounded border bg-slate-50 px-3 py-2 focus:border-blue-400 focus:outline-none' 
                   type='text' 
                   name='query' 
                   placeholder='Enter something'/>
          </label>
          <button class='border px-3 py-2 hover:bg-slate-50' type='submit'>Search</button>
        </form>
      </div>
      <ul class='hidden grid gap-3 sm:grid-cols-2 md:grid-cols-3' ${renderDataAttributes(searchResults)}></ul>
    </div>
  `;
}

/**
 * Инициализирует ссылки на DOM-элементы
 */
function initDOMElements() {
  APP_STATE.elements = {
    searchForm: document.querySelector(APP_CONFIG.selectors.searchForm),
    searchFormButton: document.querySelector(`${APP_CONFIG.selectors.searchForm} button[type="submit"]`),
    searchResults: document.querySelector(APP_CONFIG.selectors.searchResults),
  };
}

/**
 * Инициализирует приложение
 */
function initApp() {
  createAppHTML();
  initDOMElements();
  APP_STATE.elements.searchForm.addEventListener('submit', handleSearchFormSubmit);
}

/**
 * Отображает результаты поиска
 * @param {Array} search - Массив результатов поиска
 */
function renderSearchResults(search) {
  APP_STATE.elements.searchResults.classList.remove('hidden');
  APP_STATE.elements.searchResults.innerHTML = search
    .map(({ title, snippet, pageid }) => `
    <li class='rounded border bg-white p-3'>
      <a class='grid gap-2' href='https://en.wikipedia.org/?curid=${pageid}' target='_blank' rel='noopener noreferrer'>
        <h4 class='text-lg font-bold'>${title}</h4>
        <p>${snippet}</p>
      </a>
    </li>
  `).join('');
  const matches = APP_STATE.elements.searchResults.querySelectorAll('.searchmatch');
  matches.forEach((match) => {
    match.classList.add('font-bold', 'text-red-500');
  });
}

/**
 * Обрабатывает отправку формы поиска
 * @param {Event} event - Событие отправки формы
 */
async function handleSearchFormSubmit(event) {
  event.preventDefault();
  const query = event.target.query.value.trim();
  if (!query) {
    APP_UTILS.showToast('Please enter a search query');
    return;
  }
  try {
    setButtonState('Loading...', true);
    const searchResults = await fetchSearchResults(query);

    if (searchResults.length === 0) {
      APP_UTILS.showToast('No results found');
      return;
    }
    renderSearchResults(searchResults);
  } catch (error) {
    APP_UTILS.handleError('An error occurred while fetching data', error);
  } finally {
    setButtonState('Search', false);
    event.target.reset();
  }
}

/**
 * Устанавливает состояние кнопки поиска
 * @param {string} text - Текст кнопки
 * @param {boolean} disabled - Флаг отключения кнопки
 */
function setButtonState(text, disabled) {
  APP_STATE.elements.searchFormButton.textContent = text;
  APP_STATE.elements.searchFormButton.disabled = disabled;
}

/**
 * Выполняет запрос к API Wikipedia
 * @param {string} query - Поисковый запрос
 * @returns {Promise<Array>} Массив результатов поиска
 */
async function fetchSearchResults(query) {
  const { data: { query: { search } } } = await axios.get(`${APP_CONFIG.url}${query}`);
  return search;
}

initApp();
