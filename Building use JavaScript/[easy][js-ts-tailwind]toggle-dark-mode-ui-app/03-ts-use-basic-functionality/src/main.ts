/**
 * Этот код реализует функциональность переключения темы (светлая/темная) для веб-приложения.
 * Он включает в себя создание HTML-структуры, инициализацию DOM-элементов,
 * управление состоянием темы в localStorage и обновление пользовательского интерфейса.
 */

import './style.css';
import { icons } from 'feather-icons';

/**
 * Интерфейс для конфигурации приложения
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента
 * @property {Object} selectors - Объект с селекторами
 * @property {string} selectors.toggle - Селектор для кнопки переключения темы
 * @property {string} theme - Ключ для хранения темы в localStorage
 * @property {string} className - Имя класса для темной темы
 * @property {string} dark - Значение для темной темы
 * @property {string} light - Значение для светлой темы
 * @property {string} iconSun - SVG-иконка солнца
 * @property {string} iconMoon - SVG-иконка луны
 */
interface AppConfig {
  root: string;
  selectors: {
    toggle: string;
  };
  theme: string;
  className: string;
  dark: string;
  light: string;
  iconSun: string;
  iconMoon: string;
}

/**
 * Интерфейс для состояния приложения
 * @typedef {Object} AppState
 * @property {Object} elements - Объект с DOM-элементами
 * @property {HTMLButtonElement | null} elements.toggle - Кнопка переключения темы
 */
interface AppState {
  elements: {
    toggle: HTMLButtonElement | null;
  };
}

/**
 * Конфигурация приложения
 * @type {AppConfig}
 */
const APP_CONFIG: AppConfig = {
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
 * Состояние приложения
 * @type {AppState}
 */
const APP_STATE: AppState = {
  elements: {
    toggle: null,
  },
};

/**
 * Создает HTML-структуру приложения
 */
function createAppHTML(): void {
  const {
    root,
    selectors: { toggle },
    iconMoon,
  } = APP_CONFIG;
  const rootElement = document.querySelector(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='grid gap-4 justify-items-center'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>Dark Mode</h1>
      <button ${toggle.slice(1, -1)}>${iconMoon}</button>
    </div>
  `;
}

/**
 * Инициализирует DOM-элементы
 */
function initDOMElements(): void {
  APP_STATE.elements = {
    toggle: document.querySelector(APP_CONFIG.selectors.toggle),
  };
}

/**
 * Инициализирует приложение
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();
  initializeTheme();
  APP_STATE.elements.toggle?.addEventListener('click', toggleTheme);
}

/**
 * Получает тему из localStorage
 * @returns {string | null} Сохраненная тема или null
 */
function getThemeFromLocalStorage(): string | null {
  return localStorage.getItem(APP_CONFIG.theme);
}

/**
 * Сохраняет тему в localStorage
 * @param {string} theme - Тема для сохранения
 */
function setThemeInLocalStorage(theme: string): void {
  localStorage.setItem(APP_CONFIG.theme, theme);
}

/**
 * Применяет указанную тему
 * @param {string} theme - Тема для применения
 */
function applyTheme(theme: string): void {
  const isDarkTheme: boolean = theme === APP_CONFIG.dark;

  document.documentElement.classList.toggle(APP_CONFIG.className, isDarkTheme);
  updateButtonIcon(isDarkTheme);
}

/**
 * Переключает текущую тему
 */
function toggleTheme(): void {
  const currentTheme: string = document.documentElement.classList.contains(APP_CONFIG.className) ? APP_CONFIG.light : APP_CONFIG.dark;
  applyTheme(currentTheme);
  setThemeInLocalStorage(currentTheme);
}

/**
 * Обновляет иконку кнопки переключения темы
 * @param {boolean} isDarkTheme - Флаг темной темы
 */
function updateButtonIcon(isDarkTheme: boolean): void {
  if (APP_STATE.elements.toggle) {
    APP_STATE.elements.toggle.innerHTML = isDarkTheme ? APP_CONFIG.iconSun : APP_CONFIG.iconMoon;
  }
}

/**
 * Инициализирует тему при загрузке приложения
 */
function initializeTheme(): void {
  const savedTheme: string | null = getThemeFromLocalStorage();
  if (savedTheme) {
    applyTheme(savedTheme);
  }
}

initApp();
