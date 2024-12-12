/**
 * Этот код реализует пагинацию для отображения списка пользователей GitHub.
 * Он загружает данные пользователей с API GitHub, разбивает их на страницы
 * и предоставляет интерфейс для навигации по этим страницам.
 */

import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';

class Pagination {
  /**
   * Создает экземпляр класса Pagination.
   */
  constructor() {
    /**
     * Конфигурация приложения.
     * @type {Object}
     */
    this.config = {
      /** @type {string} Корневой элемент приложения */
      root: '#app',
      /** @type {Object} Селекторы для элементов DOM */
      selectors: {
        /** @type {string} Селектор для списка пользователей */
        userList: '[data-user-list]',
        /** @type {string} Селектор для элементов управления пагинацией */
        paginationControls: '[data-pagination-controls]',
      },
      /** @type {string} URL для получения данных пользователей GitHub */
      url: 'https://api.github.com/users?since=1&per_page=40',
    };

    /**
     * Состояние приложения.
     * @type {Object}
     */
    this.state = {
      /** @type {Object} Элементы DOM */
      elements: {
        /** @type {HTMLElement|null} Элемент списка пользователей */
        userList: null,
        /** @type {HTMLElement|null} Элемент управления пагинацией */
        paginationControls: null,
      },
      /** @type {number} Текущий индекс страницы */
      index: 0,
      /** @type {Array} Массив страниц с данными пользователей */
      pages: [],
    };

    /**
     * Вспомогательные функции.
     * @type {Object}
     */
    this.utils = {
      /**
       * Обрабатывает строку для использования в качестве атрибута данных.
       * @param {string} element - Строка для обработки
       * @returns {string} Обработанная строка
       */
      renderDataAttributes: (element) => element.slice(1, -1),

      /**
       * Отображает сообщение об ошибке.
       * @param {string} message - Текст сообщения об ошибке
       * @param {Error} [error=null] - Объект ошибки (опционально)
       */
      handleError: (message, error = null) => {
        Toastify({
          text: message,
          className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
          duration: 3000,
          gravity: 'bottom',
          position: 'center',
        }).showToast();
        if (error) console.error(message, error);
      },
    };

    this.init();
  }

  /**
   * Создает HTML-разметку приложения.
   */
  createAppHTML() {
    const { root, selectors: { userList, paginationControls } } = this.config;
    const { renderDataAttributes } = this.utils;
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
   * Инициализирует элементы DOM.
   */
  initDOMElements() {
    this.state.elements = {
      userList: document.querySelector(this.config.selectors.userList),
      paginationControls: document.querySelector(this.config.selectors.paginationControls),
    };
  }

  /**
   * Инициализирует приложение.
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();

    (async () => {
      this.state.pages = this.paginate(await this.getGithubUsers());
      this.renderUserList();
      this.state.elements.paginationControls.addEventListener('click', this.handlePaginationControlsClick.bind(this));
    })();
  }

  /**
   * Получает данные пользователей GitHub.
   * @returns {Promise<Array>} Массив данных пользователей
   */
  async getGithubUsers() {
    try {
      const { data } = await axios.get(this.config.url);
      return data;
    } catch (error) {
      this.utils.handleError('Error fetching users:', error);
      return [];
    }
  }

  /**
   * Разбивает данные на страницы.
   * @param {Array} data - Массив данных для разбивки
   * @param {number} [itemsPerPage=10] - Количество элементов на странице
   * @returns {Array} Массив страниц
   */
  paginate(data, itemsPerPage = 10) {
    return data.reduce((pages, item, index) => {
      const pageIndex = Math.floor(index / itemsPerPage);
      pages[pageIndex] = pages[pageIndex] || [];
      pages[pageIndex].push(item);
      return pages;
    }, []);
  }

  /**
   * Отрисовывает список пользователей.
   * @param {Array} items - Массив пользователей для отображения
   */
  renderUsers(items) {
    this.state.elements.userList.innerHTML = `
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
   * Отрисовывает элементы управления пагинацией.
   * @param {HTMLElement} container - Контейнер для элементов управления
   * @param {Array} pages - Массив страниц
   * @param {number} activeIndex - Индекс активной страницы
   */
  renderPagination(container, pages, activeIndex) {
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
   * Отрисовывает список пользователей и элементы управления пагинацией.
   */
  renderUserList() {
    this.renderUsers(this.state.pages[this.state.index]);
    this.renderPagination(this.state.elements.paginationControls, this.state.pages, this.state.index);
  }

  /**
   * Обрабатывает клик по элементам управления пагинацией.
   * @param {Event} event - Объект события клика
   */
  handlePaginationControlsClick({ target: { dataset } }) {
    if (dataset.paginationControls) return;

    if (dataset.index) {
      this.state.index = parseInt(dataset.index);
    } else if (dataset.type) {
      this.state.index += dataset.type === 'next' ? 1 : -1;
    }
    this.renderUserList();
  }
}

new Pagination();
