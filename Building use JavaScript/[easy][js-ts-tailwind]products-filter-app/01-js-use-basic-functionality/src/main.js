/**
 * Этот код реализует функциональность фильтрации продуктов на веб-странице.
 * Он создает интерфейс с кнопками категорий и сеткой продуктов, позволяя
 * пользователю фильтровать продукты по категориям.
 */

import './style.css';
import mockData from './mock';

/**
 * Конфигурация приложения
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента
 * @property {Object} selectors - Селекторы элементов
 * @property {string} selectors.filterList - Селектор списка фильтров
 * @property {string} selectors.productGrid - Селектор сетки продуктов
 */

/**
 * @type {AppConfig}
 */
const APP_CONFIG = {
  root: '#app',
  selectors: {
    filterList: '[data-filter-list]',
    productGrid: '[data-product-grid]',
  },
};

/**
 * Состояние приложения
 * @typedef {Object} AppState
 * @property {Object} elements - DOM элементы
 * @property {HTMLElement} elements.filterList - Элемент списка фильтров
 * @property {HTMLElement} elements.productGrid - Элемент сетки продуктов
 */

/**
 * @type {AppState}
 */
const APP_STATE = {
  elements: {
    filterList: null,
    productGrid: null,
  },
};

/**
 * Утилиты приложения
 * @typedef {Object} AppUtils
 * @property {function(string): string} renderDataAttributes - Обрабатывает строку атрибутов данных
 * @property {function(string): string} capitalizeFirstLetter - Делает первую букву заглавной
 */

/**
 * @type {AppUtils}
 */
const APP_UTILS = {
  renderDataAttributes: (element) => element.slice(1, -1),
  capitalizeFirstLetter: (str) => str.charAt(0).toUpperCase() + str.slice(1),
};

/**
 * Создает HTML структуру приложения
 */
function createAppHTML() {
  const { root, selectors: { filterList, productGrid } } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='mx-auto grid w-full max-w-6xl items-start gap-3'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>Products Filter</h1>
      <div class='grid gap-3'>
        <ul class='flex flex-wrap justify-center gap-3' ${renderDataAttributes(filterList)}></ul>
        <ul class='grid gap-3 sm:grid-cols-2 md:grid-cols-3' ${renderDataAttributes(productGrid)}></ul>
      </div>
    </div>
  `;
}

/**
 * Инициализирует DOM элементы
 */
function initDOMElements() {
  APP_STATE.elements = {
    filterList: document.querySelector(APP_CONFIG.selectors.filterList),
    productGrid: document.querySelector(APP_CONFIG.selectors.productGrid),
  };
}

/**
 * Инициализирует приложение
 */
function initApp() {
  createAppHTML();
  initDOMElements();

  renderControls();
  renderProduct();
  APP_STATE.elements.filterList.addEventListener('click', handleFilterListClick);
}

/**
 * Отрисовывает кнопки управления фильтрацией
 */
function renderControls() {
  const categories = ['all', ...new Set(mockData.map((item) => item.category))];

  const buttons = categories
    .map(
      (category) => `
    <li>
      <button class='rounded-md border px-3 py-1.5 ${category === 'all' ? 'bg-slate-300' : 'bg-white hover:bg-slate-300'}' data-category='${category}'>
        ${category === 'all' ? 'All' : APP_UTILS.capitalizeFirstLetter(category)}
      </button>
    </li>
  `,
    )
    .join('');

  APP_STATE.elements.filterList.innerHTML = buttons;
}

/**
 * Отрисовывает продукты
 * @param {Array} [items] - Массив продуктов для отображения
 */
function renderProduct(items) {
  const itemsToRender = items ?? mockData;
  const productItems = itemsToRender
    .map(
      ({ title, price, img, desc, category }) => `
    <li class='overflow-hidden rounded border bg-white' data-category='${category}'>
      <img class='h-[250px] w-full object-cover' src='${img}' alt='${title}'>
      <div class='grid gap-3 p-3'>
        <div class='flex justify-between'>
          <h4 class='text-lg font-bold'>${title}</h4>
          <p class='font-medium'>$${price}</p>
        </div>
        <p class='text-sm text-gray-600'>${desc}</p>
      </div>
    </li>
  `,
    )
    .join('');

  APP_STATE.elements.productGrid.innerHTML = productItems;
}

/**
 * Обрабатывает клик по кнопке фильтра
 * @param {Event} event - Объект события клика
 */
function handleFilterListClick({ target }) {
  if (!target.matches('button[data-category]')) return;

  const buttons = APP_STATE.elements.filterList.querySelectorAll('button');
  buttons.forEach((btn) => btn.classList.replace('bg-slate-300', 'bg-white'));
  target.classList.replace('bg-white', 'bg-slate-300');

  const selectedCategory = target.dataset.category;
  const filteredProducts =
    selectedCategory === 'all'
      ? mockData
      : mockData.filter((product) => product.category === selectedCategory);

  renderProduct(filteredProducts);
}

initApp();
