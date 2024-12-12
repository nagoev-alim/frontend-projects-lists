
/**
 * @fileoverview Модуль для создания и управления вкладками (табами).
 * Этот модуль реализует функциональность горизонтальных и вертикальных вкладок.
 * Он создает HTML-структуру вкладок, инициализирует необходимые DOM-элементы
 * и обрабатывает переключение между вкладками.
 */

import './style.css';

/** Интерфейс для конфигурации приложения */
interface AppConfig {
  root: string;
  selectors: {
    [key: string]: string;
  }
}

/** Конфигурация приложения */
const APP_CONFIG: AppConfig = {
  root: '#app',
  selectors: {
    tabControl: '[data-tab-control]',
    tabContent: '[data-tab-content]',
    tabsHorizontal: '.tabs-item--horizontal',
    tabsVertical: '.tabs-item--vertical',
  },
};

/** Интерфейс для состояния приложения */
interface AppState {
  elements: {
    [key: string]: HTMLElement | null;
  },
}

/** Состояние приложения */
const APP_STATE: AppState = {
  elements: {
    tabsHorizontal: null,
    tabsVertical: null,
  },
};

/** Интерфейс для утилит приложения */
interface AppUtils {
  renderDataAttributes: (element: string) => string;
}

/** Утилиты приложения */
const APP_UTILS: AppUtils = {
  /**
   * Обрабатывает строку с data-атрибутом.
   * @param {string} element - Строка с data-атрибутом.
   * @returns {string} Обработанная строка.
   */
  renderDataAttributes: (element: string): string => element.slice(1, -1),
};

/**
 * Создает HTML-структуру приложения.
 * @returns {void}
 */
function createAppHTML(): void {
  const {
    root,
    selectors: { tabControl, tabContent },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement: HTMLElement | null = document.querySelector(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='tabs gap-3 grid'>
      <h3 class='font-bold md:text-4xl text-2xl text-center'>Tabs Horizontal</h3>
      <div class='bg-white border grid rounded tabs-item--horizontal'>
        <ul class='grid sm:grid-cols-3'>
          ${Array.from({ length: 3 }).map((_, i) => `<li ${renderDataAttributes(tabControl)}='${i + 1}' class='border cursor-pointer font-bold p-3 ${i === 0 ? 'active bg-slate-900 text-white' : 'text-black'}'>Tab ${i + 1}</li>`).join('')}
        </ul>
        <ul class='relative tabs__body'>
          ${Array.from({ length: 3 }).map((_, i) => `
            <li ${renderDataAttributes(tabContent)}='${i + 1}' class='${i === 0 ? 'active' : ''}'>
              <h3 class='font-bold text-lg'>Tab ${i + 1}</h3>
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quisquam, sequi!
            </li>
          `).join('')}
        </ul>
      </div>

      <h3 class='font-bold md:text-4xl text-2xl text-center'>Switchable Vertical</h3>
      <div class='bg-white border grid rounded sm:grid-cols-[200px_auto] sm:items-start tabs-item tabs-item--vertical'>
        <ul class='grid sm:border-r-2'>
         ${Array.from({ length: 3 }).map((_, i) => `<li ${renderDataAttributes(tabControl)}='${i + 1}' class='border-b cursor-pointer font-bold p-3 ${i === 0 ? 'active bg-slate-900 text-white' : 'text-black'}'>Tab ${i + 1}</li>`).join('')}
        </ul>
        <ul class='relative tabs__body'>
          ${Array.from({ length: 3 }).map((_, i) => `
            <li ${renderDataAttributes(tabContent)}='${i + 1}' class='${i === 0 ? 'active' : ''}'>
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
 * @returns {void}
 */
function initDOMElements(): void {
  APP_STATE.elements = {
    tabsHorizontal: document.querySelector<HTMLElement>(APP_CONFIG.selectors.tabsHorizontal),
    tabsVertical: document.querySelector<HTMLElement>(APP_CONFIG.selectors.tabsVertical),
  };
}

/**
 * Инициализирует приложение.
 * Создает HTML-структуру, инициализирует DOM-элементы и добавляет обработчики событий.
 * @returns {void}
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();
  [APP_STATE.elements.tabsHorizontal, APP_STATE.elements.tabsVertical].forEach((tabs) => {
    if (!tabs) return;
    tabs.addEventListener('click', handleTabControl);
  });
}

/**
 * Обрабатывает клик по вкладке.
 * Переключает активную вкладку и соответствующий контент.
 * @param {MouseEvent} event - Событие клика.
 * @returns {void}
 */
function handleTabControl(event: MouseEvent): void {
  event.preventDefault();
  const target = event.target as HTMLElement;
  if (!target.dataset.tabControl) return;

  const tabParent = target.closest('ul');
  const tabsContainer = tabParent?.closest('.tabs-item--horizontal, .tabs-item--vertical');
  const currentTabControl = target.dataset.tabControl;
  const currentTabContent = tabsContainer?.querySelector<HTMLElement>(`[data-tab-content='${currentTabControl}']`);

  const tabControls = tabsContainer?.querySelectorAll<HTMLElement>(APP_CONFIG.selectors.tabControl);
  const tabContents = tabsContainer?.querySelectorAll<HTMLElement>(APP_CONFIG.selectors.tabContent);

  tabControls?.forEach(control => {
    control.classList.remove('active', 'bg-slate-900', 'text-white');
    control.classList.add('text-black');
  });

  tabContents?.forEach(content => content.classList.remove('active'));

  target.classList.add('active', 'bg-slate-900', 'text-white');
  target.classList.remove('text-black');
  currentTabContent?.classList.add('active');
}

// Инициализация приложения
initApp();
