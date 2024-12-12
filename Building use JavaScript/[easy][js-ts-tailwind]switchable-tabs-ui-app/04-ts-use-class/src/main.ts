/**
 * @fileoverview Модуль для создания и управления вкладками (табами).
 * 
 * Этот модуль реализует функциональность горизонтальных и вертикальных вкладок.
 * Он создает HTML-структуру вкладок, инициализирует необходимые DOM-элементы
 * и обрабатывает переключение между вкладками. Класс Tabs инкапсулирует всю
 * логику работы с вкладками, включая их создание, инициализацию и обработку
 * пользовательских взаимодействий.
 */

import './style.css';

/**
 * Интерфейс для конфигурации приложения.
 * @interface
 */
interface AppConfig {
  /** Селектор корневого элемента приложения */
  root: string;
  /** Объект с селекторами для различных элементов вкладок */
  selectors: {
    [key: string]: string;
  };
}

/**
 * Интерфейс для состояния приложения.
 * @interface
 */
interface AppState {
  /** Объект с ссылками на DOM-элементы */
  elements: {
    [key: string]: HTMLElement | null;
  };
}

/**
 * Интерфейс для утилит приложения.
 * @interface
 */
interface AppUtils {
  /** Функция для обработки строки data-атрибута */
  renderDataAttributes: (element: string) => string;
}

/**
 * Класс для создания и управления вкладками.
 */
class Tabs {
  /** Конфигурация приложения */
  private readonly config: AppConfig;
  /** Состояние приложения */
  private readonly state: AppState;
  /** Утилиты приложения */
  private readonly utils: AppUtils;

  /**
   * Создает экземпляр класса Tabs.
   * Инициализирует конфигурацию, состояние и утилиты.
   */
  constructor() {
    this.config = {
      root: '#app',
      selectors: {
        tabControl: '[data-tab-control]',
        tabContent: '[data-tab-content]',
        tabsHorizontal: '.tabs-item--horizontal',
        tabsVertical: '.tabs-item--vertical',
      },
    };

    this.state = {
      elements: {
        tabsHorizontal: null,
        tabsVertical: null,
      },
    };

    this.utils = {
      /**
       * Обрабатывает строку для использования в качестве значения data-атрибута.
       * @param {string} element - Строка для обработки.
       * @returns {string} Обработанная строка.
       */
      renderDataAttributes: (element: string): string => element.slice(1, -1),
    };

    this.init();
  }

  /**
   * Инициализирует приложение.
   * Создает HTML-структуру, инициализирует DOM-элементы и добавляет обработчики событий.
   */
  private init(): void {
    this.createAppHTML();
    this.initDOMElements();
    this.addEventListeners();
  }

  /**
   * Создает HTML-структуру приложения.
   * Формирует разметку для горизонтальных и вертикальных вкладок.
   */
  private createAppHTML(): void {
    const rootElement: HTMLElement | null = document.querySelector(this.config.root);
    if (!rootElement) return;

    rootElement.innerHTML = `
      <div class='tabs gap-3 grid'>
        <h3 class='font-bold md:text-4xl text-2xl text-center'>Tabs Horizontal</h3>
        <div class='bg-white border grid rounded tabs-item--horizontal'>
          <ul class='grid sm:grid-cols-3'>
            ${Array.from({ length: 3 }, (_, i) => `
              <li ${this.utils.renderDataAttributes(this.config.selectors.tabControl)}='${i + 1}' 
                  class='border cursor-pointer font-bold p-3 ${i === 0 ? 'active bg-slate-900 text-white' : 'text-black'}'>
                Tab ${i + 1}
              </li>
            `).join('')}
          </ul>
          <ul class='relative tabs__body'>
            ${Array.from({ length: 3 }, (_, i) => `
              <li ${this.utils.renderDataAttributes(this.config.selectors.tabContent)}='${i + 1}' 
                  class='${i === 0 ? 'active' : ''}'>
                <h3 class='font-bold text-lg'>Tab ${i + 1}</h3>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quisquam, sequi!
              </li>
            `).join('')}
          </ul>
        </div>

        <h3 class='font-bold md:text-4xl text-2xl text-center'>Switchable Vertical</h3>
        <div class='bg-white border grid rounded sm:grid-cols-[200px_auto] sm:items-start tabs-item tabs-item--vertical'>
          <ul class='grid sm:border-r-2'>
            ${Array.from({ length: 3 }, (_, i) => `
              <li ${this.utils.renderDataAttributes(this.config.selectors.tabControl)}='${i + 1}' 
                  class='border-b cursor-pointer font-bold p-3 ${i === 0 ? 'active bg-slate-900 text-white' : 'text-black'}'>
                Tab ${i + 1}
              </li>
            `).join('')}
          </ul>
          <ul class='relative tabs__body'>
            ${Array.from({ length: 3 }, (_, i) => `
              <li ${this.utils.renderDataAttributes(this.config.selectors.tabContent)}='${i + 1}' 
                  class='${i === 0 ? 'active' : ''}'>
                <h3 class='font-bold text-lg'>Tab ${i + 1}</h3>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quisquam, sequi!
              </li>
            `).join('')}
          </ul>
        </div>
      </div>
    `;
  }

  /**
   * Инициализирует DOM-элементы приложения.
   * Находит и сохраняет ссылки на основные элементы вкладок.
   */
  private initDOMElements(): void {
    this.state.elements = {
      tabsHorizontal: document.querySelector<HTMLElement>(this.config.selectors.tabsHorizontal),
      tabsVertical: document.querySelector<HTMLElement>(this.config.selectors.tabsVertical),
    };
  }

  /**
   * Добавляет обработчики событий для вкладок.
   * Устанавливает слушатели кликов на горизонтальные и вертикальные вкладки.
   */
  private addEventListeners(): void {
    [this.state.elements.tabsHorizontal, this.state.elements.tabsVertical].forEach((tabs) => {
      if (!tabs) return;
      tabs.addEventListener('click', this.handleTabControl.bind(this));
    });
  }

  /**
   * Обрабатывает клик по вкладке.
   * Переключает активную вкладку и соответствующий контент.
   * @param {MouseEvent} event - Событие клика.
   */
  private handleTabControl(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.dataset.tabControl) return;

    const tabParent = target.closest('ul');
    const tabsContainer = tabParent?.closest('.tabs-item--horizontal, .tabs-item--vertical');
    const currentTabControl = target.dataset.tabControl;
    const currentTabContent = tabsContainer?.querySelector<HTMLElement>(`[data-tab-content='${currentTabControl}']`);

    const tabControls = tabsContainer?.querySelectorAll<HTMLElement>(this.config.selectors.tabControl);
    const tabContents = tabsContainer?.querySelectorAll<HTMLElement>(this.config.selectors.tabContent);

    tabControls?.forEach(control => {
      control.classList.remove('active', 'bg-slate-900', 'text-white');
      control.classList.add('text-black');
    });

    tabContents?.forEach(content => content.classList.remove('active'));

    target.classList.add('active', 'bg-slate-900', 'text-white');
    target.classList.remove('text-black');
    currentTabContent?.classList.add('active');
  }
}

// Создание экземпляра класса Tabs для инициализации приложения
new Tabs();
