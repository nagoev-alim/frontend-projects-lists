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
 * @class APIFinder
 * @description Класс для поиска и отображения API из различных категорий.
 */
class APIFinder {
  /**
   * @constructor
   * @description Создает экземпляр APIFinder и инициализирует конфигурацию, состояние и утилиты.
   */
  constructor() {
    /**
     * @property {Object} config - Конфигурация приложения
     * @property {string} config.root - Селектор корневого элемента
     * @property {Object} config.selectors - Селекторы для различных элементов DOM
     * @property {string[]} config.ACTIVE_BUTTON_CLASSES - Классы для активной кнопки категории
     * @property {Array<{key: string, label: string}>} config.FIELDS - Поля для отображения в карточках API
     */
    this.config = {
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
      ],
    };

    /**
     * @property {Object} state - Состояние приложения
     * @property {Object} state.elements - Ссылки на элементы DOM
     */
    this.state = {
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
     * @property {Object} utils - Утилиты приложения
     */
    this.utils = {
      /**
       * @method renderDataAttributes
       * @param {string} element - Строка с data-атрибутом
       * @returns {string} Обработанная строка без квадратных скобок
       */
      renderDataAttributes: (element) => element.slice(1, -1),

      /**
       * @property {Object} toastConfig - Конфигурация для Toastify
       */
      toastConfig: {
        className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
        duration: 3000,
        gravity: 'bottom',
        position: 'center',
      },

      /**
       * @method showToast
       * @param {string} message - Сообщение для отображения
       * @description Отображает уведомление с помощью Toastify
       */
      showToast: (message) => {
        Toastify({
          text: message,
          ...this.utils.toastConfig,
        }).showToast();
      },

      /**
       * @method handleError
       * @param {string} message - Сообщение об ошибке
       * @param {Error} [error=null] - Объект ошибки (необязательный)
       * @description Обрабатывает ошибки, отображая уведомление и логируя в консоль
       */
      handleError: (message, error = null) => {
        this.utils.showToast(message);
        if (error) console.error(message, error);
      },

      /**
       * @method debounce
       * @param {Function} func - Функция для debounce
       * @param {number} delay - Задержка в миллисекундах
       * @returns {Function} Функция с примененным debounce
       * @description Создает debounce версию переданной функции
       */
      debounce: (func, delay) => {
        let timeoutId;
        return function(...args) {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
      },
    };

    this.init();
  }

  /**
   * Создает HTML-структуру приложения
   */
  createAppHTML() {
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
    } = this.config;
    const { renderDataAttributes } = this.utils;
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
  initDOMElements() {
    this.state.elements = {
      searchFormInput: document.querySelector(`${this.config.selectors.searchForm} input`),
      resultContainer: document.querySelector(this.config.selectors.resultContainer),
      categoriesCount: document.querySelector(this.config.selectors.categoriesCount),
      categoryButtons: document.querySelector(this.config.selectors.categoryButtons),
      apiList: document.querySelector(this.config.selectors.apiList),
      apiCards: document.querySelector(this.config.selectors.apiCards),
    };
  }

  /**
   * Инициализирует приложение
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();
    (async () => {
      await this.getCategories();
      this.state.elements.searchFormInput.addEventListener('input', this.utils.debounce(this.handleInputChange.bind(this), 300));
    })();
  }


  /**
   * Получает и отображает категории
   */
  async getCategories() {
    try {
      this.renderCategories(CATEGORIES);
    } catch (error) {
      this.utils.handleError('Failed to fetch categories', error);
    }
  }

  /**
   * Отрисовывает категории
   * @param {Object} categories - Объект с категориями
   * @param {number} categories.count - Количество категорий
   * @param {Array} categories.entries - Массив категорий
   */
  renderCategories({ count, entries }) {
    this.state.elements.categoriesCount.textContent = String(count);
    this.state.elements.categoryButtons.innerHTML = '';

    const fragment = document.createDocumentFragment();

    entries.forEach(({ name, slug }) => {
      const li = document.createElement('li');
      li.innerHTML = `<button class='px-3 py-2 border hover:bg-slate-50' data-category='${slug}'>${name}</button>`;
      const button = li.querySelector('[data-category]');

      button.addEventListener('click', async () => {
        this.updateButtonStyles(button);
        await this.getCategory(name);
      });

      fragment.appendChild(li);
    });

    this.state.elements.categoryButtons.appendChild(fragment);
  }

  /**
   * Обновляет стили кнопок категорий
   * @param {HTMLElement} selectedButton - Выбранная кнопка
   */
  updateButtonStyles(selectedButton) {
    const allButtons = document.querySelectorAll('[data-category]');
    allButtons.forEach(button => button.classList.remove(...this.config.ACTIVE_BUTTON_CLASSES));
    selectedButton.classList.add(...this.config.ACTIVE_BUTTON_CLASSES);
  }

  /**
   * Получает и отображает API для выбранной категории
   * @param {string} category - Название категории
   */
  async getCategory(category) {
    try {
      this.renderApiCards(RESOURCES.entries.reduce((acc, entry) => {
        const category = entry.Category;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(entry);
        return acc;
      }, {})[category]);
    } catch (error) {
      this.utils.handleError('Failed to fetch APIs for category', error);
    }
  }

  /**
   * Отрисовывает карточки API
   * @param {Array} items - Массив API
   */
  renderApiCards(items) {
    this.state.elements.apiList.classList.remove('hidden');

    const cardItems = items.map(this.createApiCard.bind(this)).join('');
    this.state.elements.apiList.innerHTML = `<ul class="grid gap-3 items-start sm:grid-cols-2 md:grid-cols-3">${cardItems}</ul>`;
  }

  /**
   * Создает HTML для карточки API
   * @param {Object} entry - Объект с данными API
   * @returns {string} HTML карточки
   */
  createApiCard(entry) {
    const cardContent = this.config.FIELDS.map(({ key, label }) => `
    <p>
      <span class="font-bold">${label}:</span>
      <span>${entry[key] || '-'}</span>
    </p>
  `).join('');

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
  handleInputChange(event) {
    const value = event.target.value;
    if (!value?.length) {
      this.state.elements.apiList.classList.add('hidden');
      return;
    }

    const filteredItems = RESOURCES.entries.filter(
      (entry) =>
        entry.Description.toLowerCase().includes(value.toLowerCase()) ||
        entry.API.toLowerCase().includes(value.toLowerCase()),
    );

    this.renderApiCards(filteredItems);
  }
}

new APIFinder();
