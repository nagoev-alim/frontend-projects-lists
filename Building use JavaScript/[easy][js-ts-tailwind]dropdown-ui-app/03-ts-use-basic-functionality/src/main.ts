import './style.css';

/**
 * Приложение для создания выпадающего меню.
 * Этот код реализует простое выпадающее меню с возможностью открытия/закрытия
 * при клике на кнопку и закрытия при клике вне меню.
 */

/**
 * @interface Config
 * @description Конфигурация приложения
 */
interface Config {
  /** Корневой селектор */
  root: string;
  /** Селекторы элементов */
  selectors: {
    [key: string]: string;
  };
  /** Мок-данные для элементов меню */
  mock: Array<{ ico: string; label: string }>;
}

/**
 * @constant APP_CONFIG
 * @description Конфигурация приложения
 */
const APP_CONFIG: Config = {
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
 * @interface State
 * @description Состояние приложения
 */
interface State {
  /** DOM элементы */
  elements: {
    [key: string]: HTMLElement | null
  };
}

/**
 * @constant APP_STATE
 * @description Состояние приложения
 */
const APP_STATE: State = {
  elements: Object.fromEntries(Object.keys(APP_CONFIG.selectors).map(key => [key, null])),
};

/**
 * @function renderDataAttributes
 * @description Обрабатывает строку для рендеринга data-атрибутов
 * @param {string} element - Строка с data-атрибутом
 * @returns {string} Обработанная строка
 */
const renderDataAttributes = (element: string): string => element.slice(1, -1);

/**
 * @function createAppHTML
 * @description Создает HTML разметку приложения
 */
function createAppHTML(): void {
  const {
    root,
    selectors: { dropdownToggle, dropdownMenu },
  } = APP_CONFIG;
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
 * @function initDOMElements
 * @description Инициализирует DOM элементы
 */
function initDOMElements(): void {
  APP_STATE.elements = {
    dropdownToggle: document.querySelector(APP_CONFIG.selectors.dropdownToggle),
    dropdownMenu: document.querySelector(APP_CONFIG.selectors.dropdownMenu),
  };
}

/**
 * @function initApp
 * @description Инициализирует приложение
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();
  APP_STATE.elements.dropdownToggle?.addEventListener('click', toggleDropdown);
  document.documentElement.addEventListener('click', closeDropdownIfOpen);
}

/**
 * @function toggleDropdown
 * @description Переключает состояние выпадающего меню
 */
function toggleDropdown(): void {
  const { dropdownMenu, dropdownToggle } = APP_STATE.elements;
  if (!dropdownMenu || !dropdownToggle) return;
  dropdownMenu.classList.toggle('show');
  dropdownToggle.querySelector('i')?.classList.toggle('arrow');
}

/**
 * @function closeDropdownIfOpen
 * @description Закрывает выпадающее меню при клике вне его
 * @param {Event} event - Событие клика
 */
function closeDropdownIfOpen(event: Event): void {
  if (!(event.target instanceof Element)) return;
  
  const isClickOutsideDropdown = !event.target.matches(APP_CONFIG.selectors.dropdownToggle);
  const isDropdownOpen = APP_STATE.elements.dropdownMenu?.classList.contains('show');
  
  if (isClickOutsideDropdown && isDropdownOpen) {
    toggleDropdown();
  }
}

initApp();
