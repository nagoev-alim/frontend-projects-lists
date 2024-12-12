/**
 * @fileoverview Приложение для поиска и отображения API из различных категорий.
 * Позволяет пользователям искать API по ключевым словам и просматривать их по категориям.
 * Использует локальные JSON файлы для данных и Toastify для уведомлений.
 */

import './style.css';
import CATEGORIES from './categories.json';
import RESOURCES from './resources.json';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

/**
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента приложения
 * @property {Object} selectors - Объект с селекторами для различных элементов DOM
 * @property {string[]} ACTIVE_BUTTON_CLASSES - Классы для активной кнопки категории
 * @property {Array<{key: string, label: string}>} FIELDS - Поля для отображения в карточках API
 */

/**
 * Конфигурация приложения
 * @type {AppConfig}
 */
const APP_CONFIG = {
  root: '#app',
  selectors: {
    searchForm: '[data-search-form]',
    resultContainer: '[data-result-container]',
    categoriesCount: '[data-categories-count]',
    categoryButtons: '[data-category-buttons]',
    apiList: '[data-api-list]',
    apiCards: '[data-api-cards]',
  },
  ACTIVE_BUTTON_CLASSES: ['bg-neutral-900', 'text-white', 'font-bold', 'hover:bg-neutral-800'],
  FIELDS: [
    { key: 'API', label: 'Title' },
    { key: 'Description', label: 'Description' },
    { key: 'Auth', label: 'Auth' },
    { key: 'Cors', label: 'Cors' },
    { key: 'Category', label: 'Category' },
  ]
};

/**
 * @typedef {Object} AppState
 * @property {Object} elements - Объект с ссылками на элементы DOM
 */

/**
 * Состояние приложения
 * @type {AppState}
 */
const APP_STATE = {
  elements: {
    searchFormInput: null,
    resultContainer: null,
    categoriesCount: null,
    categoryButtons: null,
    apiList: null,
    apiCards: null,
  },
};

/**
 * @typedef {Object} AppUtils
 * @property {function(string): string} renderDataAttributes - Функция для рендеринга data-атрибутов
 * @property {Object} toastConfig - Конфигурация для Toastify
 * @property {function(string): void} showToast - Функция для отображения уведомлений
 * @property {function(string, Error=): void} handleError - Функция для обработки ошибок
 * @property {function(Function, number): Function} debounce - Функция для debounce
 */

/**
 * Утилиты приложения
 * @type {AppUtils}
 */
const APP_UTILS = {
  renderDataAttributes: (element) => element.slice(1, -1),
  toastConfig: {
    className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
    duration: 3000,
    gravity: 'bottom',
    position: 'center',
  },
  showToast: (message) => {
    Toastify({
      text: message,
      ...APP_UTILS.toastConfig,
    }).showToast();
  },
  handleError: (message, error = null) => {
    APP_UTILS.showToast(message);
    if (error) console.error(message, error);
  },
  debounce: (func, delay) => {
    let timeoutId;
    return function(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  },
};

/**
 * Создает HTML-структуру приложения
 */
function createAppHTML() {
  const {
    root,
    selectors: {
      searchForm,
      resultContainer,
      categoriesCount,
      categoryButtons,
      apiList,
      apiCards,
    },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='mx-auto grid w-full max-w-4xl gap-4 p-3'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>Search APIs</h1>
      <div class='grid gap-3'>
        <form class='mx-auto grid w-full max-w-lg gap-2 rounded border bg-white p-3' ${renderDataAttributes(searchForm)}>
          <label>
            <input class='w-full rounded border bg-slate-50 px-3 py-2 focus:border-blue-400 focus:outline-none' type='text' name='category' placeholder='Enter keywords'>
          </label>
        </form>

        <div class='mx-auto grid w-full gap-2' ${renderDataAttributes(resultContainer)}>
          <div class='grid gap-4 rounded border bg-white p-3'>
            <h3 class='font-medium'>Total categories: <span ${renderDataAttributes(categoriesCount)} class='font-bold'>0</span></h3>
            <ul class='flex flex-wrap items-center justify-center gap-3' ${renderDataAttributes(categoryButtons)}></ul>
          </div>

          <div class='hidden grid gap-4 rounded border bg-white p-3' ${renderDataAttributes(apiList)}>
            <h3 class='font-medium'>List API</h3>
            <ul class='grid gap-3 items-start sm:grid-cols-2 md:grid-cols-3' ${renderDataAttributes(apiCards)}></ul>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Инициализирует элементы DOM в состоянии приложения
 */
function initDOMElements() {
  APP_STATE.elements = {
    searchFormInput: document.querySelector(`${APP_CONFIG.selectors.searchForm} input`),
    resultContainer: document.querySelector(APP_CONFIG.selectors.resultContainer),
    categoriesCount: document.querySelector(APP_CONFIG.selectors.categoriesCount),
    categoryButtons: document.querySelector(APP_CONFIG.selectors.categoryButtons),
    apiList: document.querySelector(APP_CONFIG.selectors.apiList),
    apiCards: document.querySelector(APP_CONFIG.selectors.apiCards),
  };
}

/**
 * Инициализирует приложение
 */
function initApp() {
  createAppHTML();
  initDOMElements();
  (async () => {
    await getCategories();
    APP_STATE.elements.searchFormInput.addEventListener(
      'input',
      APP_UTILS.debounce(handleInputChange, 300),
    );
  })();
}

/**
 * Получает и отображает категории
 */
async function getCategories() {
  try {
    renderCategories(CATEGORIES);
  } catch (error) {
    APP_UTILS.handleError('Failed to fetch categories', error);
  }
}

/**
 * Отрисовывает категории
 * @param {Object} categories - Объект с категориями
 * @param {number} categories.count - Количество категорий
 * @param {Array} categories.entries - Массив категорий
 */
function renderCategories({ count, entries }) {
  APP_STATE.elements.categoriesCount.textContent = String(count);
  APP_STATE.elements.categoryButtons.innerHTML = '';

  const fragment = document.createDocumentFragment();

  entries.forEach(({ name, slug }) => {
    const li = document.createElement('li');
    li.innerHTML = `<button class='px-3 py-2 border hover:bg-slate-50' data-category='${slug}'>${name}</button>`;
    const button = li.querySelector('[data-category]');

    button.addEventListener('click', async () => {
      updateButtonStyles(button);
      await getCategory(name);
    });

    fragment.appendChild(li);
  });

  APP_STATE.elements.categoryButtons.appendChild(fragment);
}

/**
 * Обновляет стили кнопок категорий
 * @param {HTMLElement} selectedButton - Выбранная кнопка
 */
function updateButtonStyles(selectedButton) {
  const allButtons = document.querySelectorAll('[data-category]');
  allButtons.forEach(button => button.classList.remove(...APP_CONFIG.ACTIVE_BUTTON_CLASSES));
  selectedButton.classList.add(...APP_CONFIG.ACTIVE_BUTTON_CLASSES);
}

/**
 * Получает и отображает API для выбранной категории
 * @param {string} category - Название категории
 */
async function getCategory(category) {
  try {
    renderApiCards(RESOURCES.entries.reduce((acc, entry) => {
      const category = entry.Category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(entry);
      return acc;
    }, {})[category]);
  } catch (error) {
    APP_UTILS.handleError('Failed to fetch APIs for category', error);
  }
}

/**
 * Отрисовывает карточки API
 * @param {Array} items - Массив API
 */
function renderApiCards(items) {
  APP_STATE.elements.apiList.classList.remove('hidden');

  const cardItems = items.map(createApiCard).join('');
  APP_STATE.elements.apiList.innerHTML = `<ul class="grid gap-3 items-start sm:grid-cols-2 md:grid-cols-3">${cardItems}</ul>`;
}

/**
 * Создает HTML для карточки API
 * @param {Object} entry - Объект с данными API
 * @returns {string} HTML карточки
 */
function createApiCard(entry) {
  const cardContent = APP_CONFIG.FIELDS.map(({ key, label }) => `
    <p>
      <span class="font-bold">${label}:</span>
      <span>${entry[key] || '-'}</span>
    </p>
  `,).join('');

  return `
    <li class="bg-slate-50 rounded p-2 border">
      <a href="${entry.Link}" target="_blank">
        ${cardContent}
      </a>
    </li>
  `;
}

/**
 * Обрабатывает изменение ввода в поле поиска
 * @param {Event} event - Событие изменения ввода
 */
function handleInputChange(event) {
  const value = event.target.value;
  if (!value?.length) {
    APP_STATE.elements.apiList.classList.add('hidden');
    return;
  }

  const filteredItems = RESOURCES.entries.filter(
    (entry) =>
      entry.Description.toLowerCase().includes(value.toLowerCase()) ||
      entry.API.toLowerCase().includes(value.toLowerCase()),
  );

  renderApiCards(filteredItems);
}

initApp();
