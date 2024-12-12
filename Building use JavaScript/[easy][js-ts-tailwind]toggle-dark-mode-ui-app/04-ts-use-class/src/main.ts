/**
 * Этот модуль реализует функциональность переключения темы (светлая/темная) для веб-приложения.
 * Он создает интерфейс с кнопкой переключения, сохраняет выбранную тему в localStorage
 * и применяет соответствующие стили к документу.
 */

import './style.css';
import { icons } from 'feather-icons';

/** Конфигурация для класса ToggleTheme */
interface Config {
  /** Селектор корневого элемента приложения */
  root: string;
  /** Объект с селекторами */
  selectors: {
    /** Селектор для кнопки переключения темы */
    toggle: string;
  };
  /** Ключ для хранения темы в localStorage */
  theme: string;
  /** Имя класса для темной темы */
  className: string;
  /** Идентификатор темной темы */
  dark: string;
  /** Идентификатор светлой темы */
  light: string;
  /** SVG иконка для солнца (светлая тема) */
  iconSun: string;
  /** SVG иконка для луны (темная тема) */
  iconMoon: string;
}

/** Состояние приложения */
interface State {
  /** Объект с элементами DOM */
  elements: {
    /** Кнопка переключения темы */
    toggle: HTMLButtonElement | null;
  };
}

/** Утилиты для работы с данными */
interface Utils {
  /** Функция для обработки data-атрибутов */
  renderDataAttributes: (element: string) => string;
}

class ToggleTheme {
  /** Конфигурация класса */
  private readonly config: Config;
  /** Состояние класса */
  private state: State;
  /** Утилиты класса */
  private readonly utils: Utils;

  constructor() {
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

    this.state = {
      elements: {
        toggle: null,
      },
    };

    this.utils = {
      renderDataAttributes: (element: string): string => element.slice(1, -1),
    };

    this.init();
  }

  /**
   * Создает HTML-разметку приложения
   */
  private createAppHTML(): void {
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
   * Инициализирует DOM-элементы
   */
  private initDOMElements(): void {
    this.state.elements = {
      toggle: document.querySelector(this.config.selectors.toggle),
    };
  }

  /**
   * Инициализирует приложение
   */
  private init(): void {
    this.createAppHTML();
    this.initDOMElements();
    this.initializeTheme();
    this.state.elements.toggle?.addEventListener('click', this.toggleTheme.bind(this));
  }

  /**
   * Получает сохраненную тему из localStorage
   * @returns {string | null} Сохраненная тема или null
   */
  private getThemeFromLocalStorage(): string | null {
    return localStorage.getItem(this.config.theme);
  }

  /**
   * Сохраняет тему в localStorage
   * @param {string} theme - Тема для сохранения
   */
  private setThemeInLocalStorage(theme: string): void {
    localStorage.setItem(this.config.theme, theme);
  }

  /**
   * Применяет указанную тему
   * @param {string} theme - Тема для применения
   */
  private applyTheme(theme: string): void {
    const isDarkTheme: boolean = theme === this.config.dark;

    document.documentElement.classList.toggle(this.config.className, isDarkTheme);
    this.updateButtonIcon(isDarkTheme);
  }

  /**
   * Переключает текущую тему
   */
  private toggleTheme(): void {
    const currentTheme: string = document.documentElement.classList.contains(this.config.className) ? this.config.light : this.config.dark;
    this.applyTheme(currentTheme);
    this.setThemeInLocalStorage(currentTheme);
  }

  /**
   * Обновляет иконку на кнопке переключения темы
   * @param {boolean} isDarkTheme - Флаг темной темы
   */
  private updateButtonIcon(isDarkTheme: boolean): void {
    if (this.state.elements.toggle) {
      this.state.elements.toggle.innerHTML = isDarkTheme ? this.config.iconSun : this.config.iconMoon;
    }
  }

  /**
   * Инициализирует тему при загрузке приложения
   */
  private initializeTheme(): void {
    const savedTheme: string | null = this.getThemeFromLocalStorage();
    if (savedTheme) {
      this.applyTheme(savedTheme);
    }
  }
}

new ToggleTheme();
