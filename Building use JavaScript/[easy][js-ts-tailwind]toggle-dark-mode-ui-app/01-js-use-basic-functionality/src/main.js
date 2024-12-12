/**
 * Этот код реализует функциональность переключения темы (светлая/темная) на веб-странице.
 * Он включает в себя создание HTML-разметки, инициализацию DOM-элементов,
 * управление состоянием темы в localStorage и обновление UI в соответствии с выбранной темой.
 */

import './style.css';
import { icons } from 'feather-icons';

/**
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента приложения
 * @property {Object} selectors - Объект с селекторами элементов
 * @property {string} selectors.toggle - Селектор кнопки переключения темы
 * @property {string} theme - Ключ для хранения темы в localStorage
 * @property {string} className - Класс для применения темной темы
 * @property {string} dark - Значение для темной темы
 * @property {string} light - Значение для светлой темы
 * @property {string} iconSun - SVG-иконка солнца
 * @property {string} iconMoon - SVG-иконка луны
 */
const APP_CONFIG = {
  root: '#app',
  selectors: {
    toggle: '[data-theme-toggle]',
  },
  theme: 'theme',
  className: 'dark-theme',
  dark: 'dark',
  light: 'light',
  iconSun: icons.sun.toSvg(),
  iconMoon: icons.moon.toSvg(),
};

/**
 * @typedef {Object} AppState
 * @property {Object} elements - Объект с DOM-элементами
 * @property {HTMLElement|null} elements.toggle - Кнопка переключения темы
 */
const APP_STATE = {
  elements: {
    toggle: null,
  },
};

/**
 * @typedef {Object} AppUtils
 * @property {Function} renderDataAttributes - Функция для обработки data-атрибутов
 */
const APP_UTILS = {
  /**
   * Удаляет квадратные скобки из строки с data-атрибутом
   * @param {string} element - Строка с data-атрибутом
   * @returns {string} Обработанная строка
   */
  renderDataAttributes: (element) => element.slice(1, -1),
};

/**
 * Создает HTML-разметку приложения
 */
function createAppHTML() {
  const {
    root,
    selectors: { toggle },
    iconMoon,
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='grid gap-4 justify-items-center'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>Dark Mode</h1>
      <button ${renderDataAttributes(toggle)}>${iconMoon}</button>
    </div>
  `;
}

/**
 * Инициализирует DOM-элементы
 */
function initDOMElements() {
  APP_STATE.elements = {
    toggle: document.querySelector(APP_CONFIG.selectors.toggle),
  };
}

/**
 * Инициализирует приложение
 */
function initApp() {
  createAppHTML();
  initDOMElements();
  initializeTheme();
  APP_STATE.elements.toggle.addEventListener('click', toggleTheme);
}

/**
 * Получает сохраненную тему из localStorage
 * @returns {string|null} Сохраненная тема или null
 */
function getThemeFromLocalStorage() {
  return localStorage.getItem(APP_CONFIG.theme);
}

/**
 * Сохраняет тему в localStorage
 * @param {string} theme - Тема для сохранения
 */
function setThemeInLocalStorage(theme) {
  localStorage.setItem(APP_CONFIG.theme, theme);
}

/**
 * Применяет указанную тему
 * @param {string} theme - Тема для применения
 */
function applyTheme(theme) {
  const isDarkTheme = theme === APP_CONFIG.dark;

  document.documentElement.classList.toggle(APP_CONFIG.className, isDarkTheme);
  updateButtonIcon(isDarkTheme);
}

/**
 * Переключает текущую тему
 */
function toggleTheme() {
  const currentTheme = document.documentElement.classList.contains(
    APP_CONFIG.className,
  )
    ? APP_CONFIG.light
    : APP_CONFIG.dark;
  applyTheme(currentTheme);
  setThemeInLocalStorage(currentTheme);
}

/**
 * Обновляет иконку кнопки переключения темы
 * @param {boolean} isDarkTheme - Флаг темной темы
 */
function updateButtonIcon(isDarkTheme) {
  APP_STATE.elements.toggle.innerHTML = isDarkTheme ? APP_CONFIG.iconSun : APP_CONFIG.iconMoon;
}

/**
 * Инициализирует тему при загрузке страницы
 */
function initializeTheme() {
  const savedTheme = getThemeFromLocalStorage();
  if (savedTheme) {
    applyTheme(savedTheme);
  }
}

initApp();
