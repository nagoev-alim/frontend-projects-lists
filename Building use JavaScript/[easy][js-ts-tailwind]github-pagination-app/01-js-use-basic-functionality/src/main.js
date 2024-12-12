/**
 * Этот код представляет собой веб-приложение для отображения списка пользователей GitHub с пагинацией.
 * Он загружает данные пользователей через API GitHub, разбивает их на страницы и отображает
 * с возможностью навигации между страницами.
 */

import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';

/**
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента приложения
 * @property {Object} selectors - Объект с селекторами элементов
 * @property {string} selectors.userList - Селектор для списка пользователей
 * @property {string} selectors.paginationControls - Селектор для элементов управления пагинацией
 * @property {string} url - URL для API запроса пользователей GitHub
 */

/**
 * Конфигурация приложения
 * @type {AppConfig}
 */
const APP_CONFIG = {
  root: '#app',
  selectors: {
    userList: '[data-user-list]',
    paginationControls: '[data-pagination-controls]',
  },
  url: 'https://api.github.com/users?since=1&per_page=40',
};

/**
 * @typedef {Object} AppState
 * @property {Object} elements - Объект с DOM элементами
 * @property {number} index - Текущий индекс страницы
 * @property {Array} pages - Массив страниц с пользователями
 */

/**
 * Состояние приложения
 * @type {AppState}
 */
const APP_STATE = {
  elements: {
    userList: null,
    paginationControls: null,
  },
  index: 0,
  pages: [],
};

/**
 * Утилиты приложения
 * @namespace
 */
const APP_UTILS = {
  /**
   * Обрабатывает строку атрибута данных
   * @param {string} element - Строка атрибута данных
   * @returns {string} Обработанная строка
   */
  renderDataAttributes: (element) => element.slice(1, -1),

  /**
   * Конфигурация для уведомлений
   * @type {Object}
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
   * @param {Error} [error] - Объект ошибки
   */
  handleError: (message, error = null) => {
    APP_UTILS.showToast(message);
    if (error) console.error(message, error);
  },
};

/**
 * Создает HTML структуру приложения
 */
function createAppHTML() {
  const { root, selectors: { userList, paginationControls } } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='grid max-w-3xl w-full gap-4 mx-auto p-3'>
      <h1 class='text-2xl md:text-4xl font-bold text-center'>Custom Pagination</h1>
      <ul class='grid gap-3 sm:grid-cols-2 md:grid-cols-3' ${renderDataAttributes(userList)}></ul>
      <ul class='flex flex-wrap items-center justify-center gap-3' ${renderDataAttributes(paginationControls)}></ul>
    </div>
  `;
}

/**
 * Инициализирует DOM элементы
 */
function initDOMElements() {
  APP_STATE.elements = {
    userList: document.querySelector(APP_CONFIG.selectors.userList),
    paginationControls: document.querySelector(APP_CONFIG.selectors.paginationControls),
  };
}

/**
 * Инициализирует приложение
 */
function initApp() {
  createAppHTML();
  initDOMElements();

  (async () => {
    APP_STATE.pages = paginate(await getGithubUsers());
    renderUserList();
    APP_STATE.elements.paginationControls.addEventListener('click', handlePaginationControlsClick);
  })();
}

/**
 * Получает данные пользователей GitHub
 * @returns {Promise<Array>} Массив пользователей
 */
async function getGithubUsers() {
  try {
    const { data } = await axios.get(APP_CONFIG.url);
    return data;
  } catch (error) {
    APP_UTILS.handleError('Error fetching users:', error);
    return [];
  }
}

/**
 * Разбивает данные на страницы
 * @param {Array} data - Массив данных для разбивки
 * @param {number} [itemsPerPage=10] - Количество элементов на странице
 * @returns {Array} Массив страниц
 */
function paginate(data, itemsPerPage = 10) {
  return data.reduce((pages, item, index) => {
    const pageIndex = Math.floor(index / itemsPerPage);
    pages[pageIndex] = pages[pageIndex] || [];
    pages[pageIndex].push(item);
    return pages;
  }, []);
}

/**
 * Отрисовывает список пользователей
 * @param {Array} items - Массив пользователей для отображения
 */
function renderUsers(items) {
  APP_STATE.elements.userList.innerHTML = `
    ${items.map(({ avatar_url, login, html_url }) => `
      <li class='border bg-white min-h-[324px] overflow-hidden rounded'>
        <img class='object-cover w-full' src='${avatar_url}' alt='${login}'>
        <div class='gap-2 grid p-4 place-items-center'>
          <h4 class='font-bold text-lg'>${login}</h4>
          <a class='border hover:bg-gray-100 px-3 py-2.5 rounded transition-colors' href='${html_url}' target='_blank'>View profile</a>
        </div>
      </li>
    `).join('')}
  `;
}

/**
 * Отрисовывает элементы управления пагинацией
 * @param {HTMLElement} container - Контейнер для элементов пагинации
 * @param {Array} pages - Массив страниц
 * @param {number} activeIndex - Индекс активной страницы
 */
function renderPagination(container, pages, activeIndex) {
  if (!container) return;
  const createButton = (text, type, disabled) => `
    <button class='px-2 py-1.5 border rounded ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:bg-slate-50'}' 
            data-type='${type}' ${disabled ? 'disabled' : ''}>
      ${text}
    </button>
  `;

  const pageButtons = pages.map((_, pageIndex) => `
    <li>
      <button class='px-4 py-1.5 border rounded hover:bg-slate-50 ${activeIndex === pageIndex ? 'bg-slate-100' : 'bg-white'}' 
              data-index='${pageIndex}'>
        ${pageIndex + 1}
      </button>
    </li>
  `);

  const prevButton = `<li>${createButton('Prev', 'prev', activeIndex <= 0)}</li>`;
  const nextButton = `<li>${createButton('Next', 'next', activeIndex >= pages.length - 1)}</li>`;

  container.innerHTML = [prevButton, ...pageButtons, nextButton].join('');
}

/**
 * Отрисовывает список пользователей и элементы пагинации
 */
function renderUserList() {
  renderUsers(APP_STATE.pages[APP_STATE.index]);
  renderPagination(APP_STATE.elements.paginationControls, APP_STATE.pages, APP_STATE.index);
}

/**
 * Обрабатывает клики по элементам управления пагинацией
 * @param {Event} event - Объект события клика
 */
function handlePaginationControlsClick({ target: { dataset } }) {
  if (dataset.paginationControls) return;

  if (dataset.index) {
    APP_STATE.index = parseInt(dataset.index);
  } else if (dataset.type) {
    APP_STATE.index += dataset.type === 'next' ? 1 : -1;
  }
  renderUserList();
}

initApp();
