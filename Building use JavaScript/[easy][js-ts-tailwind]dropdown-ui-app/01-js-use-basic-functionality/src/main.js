import './style.css';

/**
 * Приложение для создания выпадающего меню.
 * Этот код реализует простое выпадающее меню с возможностью открытия/закрытия
 * при клике на кнопку и закрытия при клике вне меню.
 */

/**
 * Конфигурация приложения
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента
 * @property {Object} selectors - Селекторы элементов
 * @property {string} selectors.dropdownToggle - Селектор кнопки переключения
 * @property {string} selectors.dropdownMenu - Селектор выпадающего меню
 * @property {Array<Object>} mock - Мок-данные для элементов меню
 */
const APP_CONFIG = {
  root: '#app',
  selectors: {
    dropdownToggle: '[data-dropdown-toggle]',
    dropdownMenu: '[data-dropdown-menu]',
  },
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
 * Состояние приложения
 * @typedef {Object} AppState
 * @property {Object} elements - DOM элементы
 * @property {HTMLElement} elements.dropdownToggle - Кнопка переключения
 * @property {HTMLElement} elements.dropdownMenu - Выпадающее меню
 */
const APP_STATE = {
  elements: {
    dropdownToggle: null,
    dropdownMenu: null,
  },
};

/**
 * Утилиты приложения
 * @typedef {Object} AppUtils
 * @property {Function} renderDataAttributes - Функция для рендеринга data-атрибутов
 */
const APP_UTILS = {
  /**
   * Обрабатывает строку для рендеринга data-атрибутов
   * @param {string} element - Строка с data-атрибутом
   * @returns {string} Обработанная строка
   */
  renderDataAttributes: (element) => element.slice(1, -1),
};

/**
 * Создает HTML разметку приложения
 */
function createAppHTML() {
  const {
    root,
    selectors: { dropdownToggle, dropdownMenu },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
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
              ${APP_CONFIG.mock.map(
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
 * Инициализирует DOM элементы
 */
function initDOMElements() {
  APP_STATE.elements = {
    dropdownToggle: document.querySelector(APP_CONFIG.selectors.dropdownToggle),
    dropdownMenu: document.querySelector(APP_CONFIG.selectors.dropdownMenu),
  };
}

/**
 * Инициализирует приложение
 */
function initApp() {
  createAppHTML();
  initDOMElements();
  APP_STATE.elements.dropdownToggle.addEventListener('click', toggleDropdown);
  document.documentElement.addEventListener('click', closeDropdownIfOpen);
}

/**
 * Переключает состояние выпадающего меню
 */
function toggleDropdown() {
  const { dropdownMenu, dropdownToggle } = APP_STATE.elements;
  dropdownMenu.classList.toggle('show');
  dropdownToggle.querySelector('i').classList.toggle('arrow');
}

/**
 * Закрывает выпадающее меню при клике вне его
 * @param {Event} event - Событие клика
 */
function closeDropdownIfOpen(event) {
  const isClickOutsideDropdown = !event.target.matches(APP_CONFIG.selectors.dropdownToggle);
  const isDropdownOpen = APP_STATE.elements.dropdownMenu.classList.contains('show');
  if (isClickOutsideDropdown && isDropdownOpen) toggleDropdown();
}

initApp();
