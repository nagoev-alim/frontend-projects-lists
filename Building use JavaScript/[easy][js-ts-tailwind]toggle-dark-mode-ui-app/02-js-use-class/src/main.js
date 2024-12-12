import './style.css';
import { icons } from 'feather-icons';

/**
 * Класс ToggleTheme отвечает за переключение темы (светлой и темной) на веб-странице.
 * Он создает кнопку для переключения темы, сохраняет выбранную тему в localStorage
 * и применяет её к документу.
 */
class ToggleTheme {
  /**
   * Конструктор класса ToggleTheme.
   * Инициализирует конфигурацию, состояние и вызывает метод init().
   */
  constructor() {
    /**
     * Конфигурация класса ToggleTheme.
     * @type {Object}
     * @property {string} root - CSS селектор корневого элемента.
     * @property {Object} selectors - Селекторы элементов.
     * @property {string} selectors.toggle - Селектор кнопки переключения темы.
     * @property {string} theme - Ключ для хранения темы в localStorage.
     * @property {string} className - Класс, который применяется к документу для темной темы.
     * @property {string} dark - Значение для темной темы.
     * @property {string} light - Значение для светлой темы.
     * @property {string} iconSun - SVG иконка солнца.
     * @property {string} iconMoon - SVG иконка луны.
     */
    this.config = {
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
     * Состояние класса ToggleTheme.
     * @type {Object}
     * @property {Object} elements - Элементы DOM.
     * @property {HTMLElement|null} elements.toggle - Кнопка переключения темы.
     */
    this.state = {
      elements: {
        toggle: null,
      },
    };

    /**
     * Утилиты класса ToggleTheme.
     * @type {Object}
     * @property {Function} renderDataAttributes - Функция для обработки атрибутов данных.
     */
    this.utils = {
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
      selectors: { toggle },
      iconMoon,
    } = this.config;
    const { renderDataAttributes } = this.utils;
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
   * Инициализирует DOM-элементы.
   */
  initDOMElements() {
    this.state.elements = {
      toggle: document.querySelector(this.config.selectors.toggle),
    };
  }

  /**
   * Инициализирует приложение, создавая HTML, инициализируя DOM-элементы
   * и устанавливая обработчик событий на кнопку переключения темы.
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();
    this.initializeTheme();
    this.state.elements.toggle.addEventListener('click', this.toggleTheme.bind(this));
  }

  /**
   * Получает текущую тему из localStorage.
   * @returns {string|null} - Значение темы или null, если тема не найдена.
   */
  getThemeFromLocalStorage() {
    return localStorage.getItem(this.config.theme);
  }

  /**
   * Сохраняет тему в localStorage.
   * @param {string} theme - Значение темы для сохранения.
   */
  setThemeInLocalStorage(theme) {
    localStorage.setItem(this.config.theme, theme);
  }

  /**
   * Применяет тему к документу.
   * @param {string} theme - Значение темы для применения.
   */
  applyTheme(theme) {
    const isDarkTheme = theme === this.config.dark;

    document.documentElement.classList.toggle(this.config.className, isDarkTheme);
    this.updateButtonIcon(isDarkTheme);
  }

  /**
   * Переключает тему и сохраняет её в localStorage.
   */
  toggleTheme() {
    const currentTheme = document.documentElement.classList.contains(this.config.className) ? this.config.light : this.config.dark;
    this.applyTheme(currentTheme);
    this.setThemeInLocalStorage(currentTheme);
  }

  /**
   * Обновляет иконку на кнопке переключения темы.
   * @param {boolean} isDarkTheme - Флаг, указывающий на текущую тему (true для темной, false для светлой).
   */
  updateButtonIcon(isDarkTheme) {
    this.state.elements.toggle.innerHTML = isDarkTheme ? this.config.iconSun : this.config.iconMoon;
  }

  /**
   * Инициализирует тему при загрузке страницы, используя сохраненную тему из localStorage.
   */
  initializeTheme() {
    const savedTheme = this.getThemeFromLocalStorage();
    if (savedTheme) {
      this.applyTheme(savedTheme);
    }
  }
}

// Создаем экземпляр класса ToggleTheme для инициализации функциональности переключения темы.
new ToggleTheme();