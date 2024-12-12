/**
 * Данный код представляет собой приложение для поиска статей в Wikipedia.
 * Оно позволяет пользователям вводить поисковые запросы и отображает результаты,
 * полученные через API Wikipedia. Приложение использует Toastify для отображения
 * уведомлений и axios для выполнения HTTP-запросов. Код организован в виде класса
 * Wikipedia, который инкапсулирует всю функциональность приложения.
 */

import './style.css';
import wikiLogo from '/logo.svg';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';

/**
 * Класс Wikipedia представляет основную функциональность приложения для поиска в Wikipedia.
 */
class Wikipedia {
  /**
   * Создает экземпляр класса Wikipedia и инициализирует приложение.
   */
  constructor() {
    /**
     * @type {Object} Конфигурация приложения
     * @property {string} root - Селектор корневого элемента
     * @property {Object} selectors - Селекторы для форм поиска и результатов
     * @property {string} url - URL API Wikipedia для поиска
     */
    this.config = {
      root: '#app',
      selectors: {
        searchForm: '[data-search-form]',
        searchResults: '[data-search-results]',
      },
      url: 'https://en.wikipedia.org/w/api.php?action=query&list=search&srlimit=20&format=json&origin=*&srsearch=',
    };

    /**
     * @type {Object} Состояние приложения
     * @property {Object} elements - Ссылки на DOM-элементы
     */
    this.state = {
      elements: {
        searchForm: null,
        searchFormButton: null,
        searchResults: null,
      },
    };

    /**
     * @type {Object} Вспомогательные утилиты
     */
    this.utils = {
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
          ...this.utils.toastConfig,
        }).showToast();
      },

      /**
       * Обрабатывает ошибки
       * @param {string} message - Сообщение об ошибке
       * @param {Error} [error] - Объект ошибки (опционально)
       */
      handleError: (message, error = null) => {
        this.utils.showToast(message);
        if (error) console.error(message, error);
      },
    };

    this.init();
  }

  /**
   * Создает HTML-структуру приложения
   */
  createAppHTML() {
    const { root, selectors: { searchForm, searchResults } } = this.config;
    const { renderDataAttributes } = this.utils;
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
   * Инициализирует DOM-элементы
   */
  initDOMElements() {
    this.state.elements = {
      searchForm: document.querySelector(this.config.selectors.searchForm),
      searchFormButton: document.querySelector(`${this.config.selectors.searchForm} button[type="submit"]`),
      searchResults: document.querySelector(this.config.selectors.searchResults),
    };
  }

  /**
   * Инициализирует приложение
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();
    this.state.elements.searchForm.addEventListener('submit', this.handleSearchFormSubmit.bind(this));
  }

  /**
   * Отображает результаты поиска
   * @param {Array} search - Массив результатов поиска
   */
  renderSearchResults(search) {
    this.state.elements.searchResults.classList.remove('hidden');
    this.state.elements.searchResults.innerHTML = search
      .map(({ title, snippet, pageid }) => `
    <li class='rounded border bg-white p-3'>
      <a class='grid gap-2' href='https://en.wikipedia.org/?curid=${pageid}' target='_blank' rel='noopener noreferrer'>
        <h4 class='text-lg font-bold'>${title}</h4>
        <p>${snippet}</p>
      </a>
    </li>
  `).join('');
    const matches = this.state.elements.searchResults.querySelectorAll('.searchmatch');
    matches.forEach((match) => {
      match.classList.add('font-bold', 'text-red-500');
    });
  }

  /**
   * Обрабатывает отправку формы поиска
   * @param {Event} event - Событие отправки формы
   */
  async handleSearchFormSubmit(event) {
    event.preventDefault();
    const query = event.target.query.value.trim();
    if (!query) {
      this.utils.showToast('Please enter a search query');
      return;
    }
    try {
      this.setButtonState('Loading...', true);
      const searchResults = await this.fetchSearchResults(query);

      if (searchResults.length === 0) {
        this.utils.showToast('No results found');
        return;
      }
      this.renderSearchResults(searchResults);
    } catch (error) {
      this.utils.handleError('An error occurred while fetching data', error);
    } finally {
      this.setButtonState('Search', false);
      event.target.reset();
    }
  }

  /**
   * Устанавливает состояние кнопки поиска
   * @param {string} text - Текст кнопки
   * @param {boolean} disabled - Флаг отключения кнопки
   */
  setButtonState(text, disabled) {
    this.state.elements.searchFormButton.textContent = text;
    this.state.elements.searchFormButton.disabled = disabled;
  }

  /**
   * Выполняет запрос к API Wikipedia
   * @param {string} query - Поисковый запрос
   * @returns {Promise<Array>} Массив результатов поиска
   */
  async fetchSearchResults(query) {
    const { data: { query: { search } } } = await axios.get(`${this.config.url}${query}`);
    return search;
  }
}

new Wikipedia();
