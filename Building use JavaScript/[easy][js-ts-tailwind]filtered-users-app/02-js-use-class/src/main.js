/**
 * Этот код создает фильтруемый список пользователей с возможностью поиска по имени.
 * Он использует Faker.js для генерации случайных данных пользователей и
 * реализует функциональность фильтрации в режиме реального времени.
 */

import './style.css';
import { faker } from '@faker-js/faker';

/**
 * Класс для создания и управления фильтруемым списком пользователей.
 */
class FilteredUsers {
  /**
   * Создает экземпляр FilteredUsers.
   */
  constructor() {
    /**
     * Конфигурация приложения.
     * @type {Object}
     */
    this.config = {
      /** @type {string} Корневой селектор для приложения */
      root: '#app',
      /** @type {Object} Селекторы для элементов DOM */
      selectors: {
        /** @type {string} Селектор для поля ввода фильтра */
        filterInput: '[data-filter-input]',
        /** @type {string} Селектор для отфильтрованного списка */
        filteredList: '[data-filtered-list]',
      },
    };

    /**
     * Состояние приложения.
     * @type {Object}
     */
    this.state = {
      /** @type {Object} Элементы DOM */
      elements: {
        /** @type {HTMLInputElement|null} Поле ввода фильтра */
        filterInput: null,
        /** @type {HTMLUListElement|null} Отфильтрованный список */
        filteredList: null,
      },
    };

    /**
     * Утилиты приложения.
     * @type {Object}
     */
    this.utils = {
      /**
       * Подготавливает строку data-атрибута для использования в HTML.
       * @param {string} element - Строка с data-атрибутом
       * @returns {string} Подготовленная строка data-атрибута
       */
      renderDataAttributes: (element) => element.slice(1, -1),

      /**
       * Создает дебаунсированную версию функции.
       * @param {Function} func - Функция для дебаунсинга
       * @param {number} delay - Задержка в миллисекундах
       * @returns {Function} Дебаунсированная функция
       */
      debounce: (func, delay) => {
        let timeoutId;
        return function (...args) {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
      },
    };

    this.init();
  }

  /**
   * Создает HTML структуру приложения.
   */
  createAppHTML() {
    const {
      root,
      selectors: { filterInput, filteredList },
    } = this.config;
    const { renderDataAttributes } = this.utils;
    const rootElement = document.querySelector(root);

    if (!rootElement) return;

    rootElement.innerHTML = `
      <div class='grid max-w-xl w-full gap-4 rounded border p-3 shadow'>
        <h1 class='text-center text-2xl font-bold md:text-4xl'>A Filterable List</h1>
        <input 
          class='rounded border-2 px-3 py-2.5 focus:border-blue-400 focus:outline-none' 
          type='text' 
          ${renderDataAttributes(filterInput)}
          placeholder='Search by name'
        >
        <ul ${renderDataAttributes(filteredList)}></ul>
      </div>    
    `;
  }

  /**
   * Инициализирует элементы DOM.
   */
  initDOMElements() {
    this.state.elements = {
      filterInput: document.querySelector(this.config.selectors.filterInput),
      filteredList: document.querySelector(this.config.selectors.filteredList),
    };
  }

  /**
   * Инициализирует приложение.
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();
    this.renderUsers();
    this.state.elements.filterInput.addEventListener(
      'input',
      this.utils.debounce(this.handleFilterInput.bind(this), 300)
    );
  }

  /**
   * Отрисовывает список пользователей.
   */
  renderUsers() {
    const users = Array.from({ length: 100 }, () => ({
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      jobArea: faker.person.jobArea(),
    }));

    this.state.elements.filteredList.innerHTML = users
      .sort((a, b) =>
        `${a.firstName} ${a.lastName}`.localeCompare(
          `${b.firstName} ${b.lastName}`
        )
      )
      .map(
        (user) => `
          <li class='flex gap-1 border p-2'>
            <span class='text-lg'>${user.firstName} ${user.lastName}</span>
            <span class='font-medium ml-auto'>${user.jobArea}</span>
            <div data-filtered-name='' class='hidden'>${user.firstName} ${user.lastName} ${user.jobArea}</div>
          </li>
        `
      )
      .join('');
  }

  /**
   * Обрабатывает ввод в поле фильтра.
   * @param {Event} event - Событие ввода
   */
  handleFilterInput({ target: { value } }) {
    const trimmedValue = value.trim().toLowerCase();
    const nameElements = document.querySelectorAll('[data-filtered-name]');

    nameElements.forEach((nameElement) => {
      if (nameElement && nameElement.parentElement) {
        const isVisible =
          trimmedValue === '' ||
          nameElement.textContent.toLowerCase().includes(trimmedValue);
        nameElement.parentElement.style.display = isVisible ? 'flex' : 'none';
      }
    });
  }
}

new FilteredUsers();