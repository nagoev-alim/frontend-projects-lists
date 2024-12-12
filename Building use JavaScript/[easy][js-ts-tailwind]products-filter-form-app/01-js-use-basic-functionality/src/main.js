/**
 * Этот код представляет собой приложение для фильтрации продуктов.
 * Он отображает список продуктов, позволяет фильтровать их по компаниям
 * и осуществлять поиск по названию продукта.
 */

import './style.css';
import mockData from './mock';

/**
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента приложения
 * @property {Object} selectors - Объект с селекторами элементов
 */

/**
 * @type {AppConfig}
 */
const APP_CONFIG = {
  root: '#app',
  selectors: {
    filterForm: '[data-filter-form]',
    companyList: '[data-company-list]',
    productContainer: '[data-product-container]',
    productList: '[data-product-list]',
  },
};

/**
 * @typedef {Object} AppState
 * @property {Object} elements - Объект с DOM элементами
 * @property {Array} products - Массив продуктов
 */

/**
 * @type {AppState}
 */
const APP_STATE = {
  elements: {
    filterForm: null,
    companyList: null,
    productContainer: null,
    productList: null,
  },
  products: mockData,
};

/**
 * @typedef {Object} AppUtils
 * @property {Function} renderDataAttributes - Функция для рендеринга data-атрибутов
 * @property {Function} capitalizeFirstLetter - Функция для капитализации первой буквы строки
 */

/**
 * @type {AppUtils}
 */
const APP_UTILS = {
  /**
   * Удаляет квадратные скобки из строки с data-атрибутом
   * @param {string} element - Строка с data-атрибутом
   * @returns {string} Строка без квадратных скобок
   */
  renderDataAttributes: (element) => element.slice(1, -1),

  /**
   * Делает первую букву строки заглавной
   * @param {string} str - Исходная строка
   * @returns {string} Строка с заглавной первой буквой
   */
  capitalizeFirstLetter: (str) => str.charAt(0).toUpperCase() + str.slice(1),
};

/**
 * Создает HTML-разметку приложения
 */
function createAppHTML() {
  const {
    root,
    selectors: { filterForm, companyList, productContainer, productList },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='mx-auto grid w-full max-w-6xl items-start gap-4 p-3'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>Products Filter</h1>
      <div class='grid items-start gap-3 xl:grid-cols-[300px_1fr]'>
        <div class='grid gap-3'>
          <form ${renderDataAttributes(filterForm)}>
            <input
              class='w-full rounded border bg-slate-50 px-3 py-2.5 focus:border-blue-400 focus:outline-none'
              name='query'
              type='search'
              placeholder='Search'
            >
          </form>
          <h5 class='text-sm font-medium'>Company</h5>
          <ul class='flex flex-wrap gap-2 xl:grid' ${renderDataAttributes(companyList)}></ul>
        </div>
        <div ${renderDataAttributes(productContainer)}>
          <ul class='grid gap-3' ${renderDataAttributes(productList)}></ul>
        </div>
      </div>
    </div>
  `;
}

/**
 * Инициализирует DOM элементы приложения
 */
function initDOMElements() {
  APP_STATE.elements = {
    filterForm: document.querySelector(APP_CONFIG.selectors.filterForm),
    companyList: document.querySelector(APP_CONFIG.selectors.companyList),
    productContainer: document.querySelector(APP_CONFIG.selectors.productContainer),
    productList: document.querySelector(APP_CONFIG.selectors.productList),
  };
}

/**
 * Инициализирует приложение
 */
function initApp() {
  createAppHTML();
  initDOMElements();

  renderProducts();
  renderFilters();
  APP_STATE.elements.filterForm.addEventListener('keyup', handleFilterFormKeyup);
  APP_STATE.elements.companyList.addEventListener('click', handleProductContainerClick);
}

/**
 * Отрисовывает список продуктов
 */
function renderProducts() {
  const productList = APP_STATE.products
    .map(
      ({ id, title, image, price }) => `
    <li class='bg-white border rounded overflow-hidden' data-id='${id}'>
      <img class='h-[250px] w-full object-cover' src='${image}' alt='${title}'>
      <div class='grid gap-3 p-3'>
        <h3 class='text-lg font-bold'>${title}</h3>
        <p>${price}</p>
      </div>
    </li>
  `,
    )
    .join('');

  const html = APP_STATE.products.length
    ? `<ul class='grid gap-3 sm:grid-cols-2 md:grid-cols-3' data-products>${productList}</ul>`
    : `<h5 class='font-medium'>No products matched your search</h5>`;

  APP_STATE.elements.productContainer.innerHTML = html;
}

/**
 * Отрисовывает фильтры по компаниям
 */
function renderFilters() {
  const companies = ['all', ...new Set(mockData.map(({ company }) => company))];
  const filterButtons = companies
    .map(
      (company) => `
    <li>
      <button 
        class='border px-3 py-1.5 xl:w-full xl:justify-start ${company === 'all' ? 'bg-slate-100' : 'bg-white'}'
        data-filter-btn 
        data-id='${company}'
      >
        ${APP_UTILS.capitalizeFirstLetter(company)}
      </button>
    </li>
  `,
    )
    .join('');

  APP_STATE.elements.companyList.innerHTML = filterButtons;
}

/**
 * Обработчик события ввода в поле поиска
 * @param {Event} event - Событие ввода
 */
function handleFilterFormKeyup({ target: { value } }) {
  const buttons = APP_STATE.elements.companyList.querySelectorAll('button');
  buttons.forEach((btn) => btn.classList.replace('bg-slate-100', 'bg-white'));

  APP_STATE.products = mockData.filter(({ title }) =>
    title.toLowerCase().includes(value.toLowerCase()),
  );

  if (value.trim() === '') {
    buttons[0].classList.replace('bg-white', 'bg-slate-100');
  }
  renderProducts();
}

/**
 * Обработчик клика по кнопкам фильтра компаний
 * @param {Event} event - Событие клика
 */
function handleProductContainerClick({ target }) {
  if (target.dataset.filterBtn !== '') return false;
  const buttons = APP_STATE.elements.companyList.querySelectorAll('button');
  buttons.forEach((btn) => btn.classList.replace('bg-slate-100', 'bg-white'));
  target.classList.replace('bg-white', 'bg-slate-100');

  APP_STATE.products =
    target.dataset.id === 'all'
      ? mockData
      : mockData.filter(({ company }) => company === target.dataset.id);
  APP_STATE.elements.filterForm.reset();
  renderProducts();
}

initApp();
