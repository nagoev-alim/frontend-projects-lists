import './style.css';

/**
 * @fileoverview
 * Этот файл содержит класс DropDown, который реализует функциональность выпадающего меню.
 * Класс создает HTML-структуру меню, инициализирует необходимые элементы DOM и
 * обрабатывает события для открытия/закрытия меню.
 */

/**
 * Класс, реализующий функциональность выпадающего меню.
 */
class DropDown {
  /**
   * Создает экземпляр класса DropDown.
   */
  constructor() {
    /**
     * Конфигурация класса.
     * @type {Object}
     */
    this.config = {
      /** Корневой элемент для вставки меню. */
      root: '#app',
      /** Селекторы для элементов меню. */
      selectors: {
        dropdownToggle: '[data-dropdown-toggle]',
        dropdownMenu: '[data-dropdown-menu]',
      },
      /** Моковые данные для пунктов меню. */
      mock: [
        { ico: `<i class='bx bx-plus-circle'></i>`, label: 'Create New' },
        { ico: `<i class='bx bx-book'></i>`, label: 'All Drafts' },
        { ico: `<i class='bx bx-folder'></i>`, label: 'Move To' },
        { ico: `<i class='bx bx-user'></i>`, label: 'Profile Settings' },
        { ico: `<i class='bx bx-bell'></i>`, label: 'Notification' },
        { ico: `<i class='bx bx-cog'></i>`, label: 'Settings' },
      ],
    };

    /**
     * Состояние класса.
     * @type {Object}
     */
    this.state = {
      elements: {
        dropdownToggle: null,
        dropdownMenu: null,
      },
    };

    /**
     * Утилитные функции.
     * @type {Object}
     */
    this.utils = {
      /**
       * Удаляет первый и последний символы из строки.
       * @param {string} element - Строка для обработки.
       * @returns {string} Обработанная строка.
       */
      renderDataAttributes: (element) => element.slice(1, -1),
    };

    this.init();
  }

  /**
   * Создает HTML-структуру приложения.
   */
  createAppHTML() {
    const {
      root,
      selectors: { dropdownToggle, dropdownMenu },
    } = this.config;
    const { renderDataAttributes } = this.utils;
    const rootElement = document.querySelector(root);

    if (!rootElement) return;

    rootElement.innerHTML = `
    <div class='grid w-full max-w-md gap-4 rounded border bg-white p-3 shadow'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'></h1>
      <div class='components'>
        <div class='component01'>
          <div class='dropdown'>
            <button class='dropdown__trigger' ${renderDataAttributes(dropdownToggle)}>
              Dropdown
              <i class='bx bx-chevron-down'></i>
            </button>
            <ul class='dropdown__list' ${renderDataAttributes(dropdownMenu)}>
              ${this.config.mock.map(
      ({ ico, label }) => `
                <li class='dropdown__item'>
                  <a href='#' class='dropdown__link'>${ico} ${label}</a>
                </li>
              `,
    ).join('')}
            </ul>
          </div>
        </div>
      </div>
    </div>
  `;
  }

  /**
   * Инициализирует элементы DOM.
   */
  initDOMElements() {
    this.state.elements = {
      dropdownToggle: document.querySelector(this.config.selectors.dropdownToggle),
      dropdownMenu: document.querySelector(this.config.selectors.dropdownMenu),
    };
  }

  /**
   * Инициализирует приложение.
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();
    this.state.elements.dropdownToggle.addEventListener('click', this.toggleDropdown.bind(this));
    document.documentElement.addEventListener('click', this.closeDropdownIfOpen.bind(this));
  }

  /**
   * Переключает состояние выпадающего меню.
   */
  toggleDropdown() {
    const { dropdownMenu, dropdownToggle } = this.state.elements;
    dropdownMenu.classList.toggle('show');
    dropdownToggle.querySelector('i').classList.toggle('arrow');
  }

  /**
   * Закрывает выпадающее меню, если оно открыто и клик был вне меню.
   * @param {Event} event - Объект события клика.
   */
  closeDropdownIfOpen(event) {
    const isClickOutsideDropdown = !event.target.matches(this.config.selectors.dropdownToggle);
    const isDropdownOpen = this.state.elements.dropdownMenu.classList.contains('show');
    if (isClickOutsideDropdown && isDropdownOpen) this.toggleDropdown();
  }
}

new DropDown();
