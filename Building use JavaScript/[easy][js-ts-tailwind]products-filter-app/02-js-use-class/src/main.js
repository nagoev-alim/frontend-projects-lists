/**
 * Этот код реализует функциональность фильтрации продуктов на веб-странице.
 * Он создает интерфейс с кнопками категорий и сеткой продуктов, позволяя
 * пользователю фильтровать продукты по категориям.
 */

import './style.css';
import mockData from './mock';

/**
 * Класс для управления фильтрацией продуктов
 */
class ProductsFilter {
  /**
   * Создает экземпляр ProductsFilter
   */
  constructor() {
    /**
     * Конфигурация приложения
     * @type {Object}
     */
    this.config = {
      /** @type {string} Селектор корневого элемента */
      root: '#app',
      /** @type {Object} Селекторы элементов */
      selectors: {
        /** @type {string} Селектор списка фильтров */
        filterList: '[data-filter-list]',
        /** @type {string} Селектор сетки продуктов */
        productGrid: '[data-product-grid]',
      },
    };

    /**
     * Состояние приложения
     * @type {Object}
     */
    this.state = {
      /** @type {Object} DOM элементы */
      elements: {
        /** @type {HTMLElement} Элемент списка фильтров */
        filterList: null,
        /** @type {HTMLElement} Элемент сетки продуктов */
        productGrid: null,
      },
    };

    /**
     * Утилиты приложения
     * @type {Object}
     */
    this.utils = {
      /**
       * Обрабатывает строку атрибутов данных
       * @param {string} element - Строка с атрибутами
       * @returns {string}
       */
      renderDataAttributes: (element) => element.slice(1, -1),
      /**
       * Делает первую букву заглавной
       * @param {string} str - Исходная строка
       * @returns {string}
       */
      capitalizeFirstLetter: (str) => str.charAt(0).toUpperCase() + str.slice(1),
    };

    this.init();
  }

  /**
   * Создает HTML структуру приложения
   */
  createAppHTML() {
    const { root, selectors: { filterList, productGrid } } = this.config;
    const { renderDataAttributes } = this.utils;
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
  initDOMElements() {
    this.state.elements = {
      filterList: document.querySelector(this.config.selectors.filterList),
      productGrid: document.querySelector(this.config.selectors.productGrid),
    };
  }

  /**
   * Инициализирует приложение
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();

    this.renderControls();
    this.renderProduct();
    this.state.elements.filterList.addEventListener('click', this.handleFilterListClick.bind(this));
  }

  /**
   * Отрисовывает кнопки управления фильтрацией
   */
  renderControls() {
    const categories = ['all', ...new Set(mockData.map((item) => item.category))];

    const buttons = categories
      .map(
        (category) => `
    <li>
      <button class='rounded-md border px-3 py-1.5 ${category === 'all' ? 'bg-slate-300' : 'bg-white hover:bg-slate-300'}' data-category='${category}'>
        ${category === 'all' ? 'All' : this.utils.capitalizeFirstLetter(category)}
      </button>
    </li>
  `,
      )
      .join('');

    this.state.elements.filterList.innerHTML = buttons;
  }

  /**
   * Отрисовывает продукты
   * @param {Array} [items] - Массив продуктов для отображения
   */
  renderProduct(items) {
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

    this.state.elements.productGrid.innerHTML = productItems;
  }

  /**
   * Обрабатывает клик по кнопке фильтра
   * @param {Event} event - Объект события клика
   */
  handleFilterListClick({ target }) {
    if (!target.matches('button[data-category]')) return;

    const buttons = this.state.elements.filterList.querySelectorAll('button');
    buttons.forEach((btn) => btn.classList.replace('bg-slate-300', 'bg-white'));
    target.classList.replace('bg-white', 'bg-slate-300');

    const selectedCategory = target.dataset.category;
    const filteredProducts =
      selectedCategory === 'all'
        ? mockData
        : mockData.filter((product) => product.category === selectedCategory);

    this.renderProduct(filteredProducts);
  }
}

new ProductsFilter();
