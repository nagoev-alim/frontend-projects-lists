/**
 * Этот код создает интерактивную статистику с анимированными счетчиками.
 * Он генерирует HTML-разметку для отображения статистики и анимирует
 * числовые значения от нуля до целевого значения.
 */

import './style.css';

/**
 * Интерфейс конфигурации приложения
 * @interface
 */
interface AppConfig {
  /** Селектор корневого элемента */
  root: string;
  /** Объект с селекторами */
  selectors: {
    /** Селектор для элементов с целевым значением */
    target: string;
  };
}

/**
 * Конфигурация приложения
 * @type {AppConfig}
 */
const APP_CONFIG: AppConfig = {
  root: '#app',
  selectors: {
    target: '[data-target]',
  },
};

/**
 * Интерфейс состояния приложения
 * @interface
 */
interface AppState {
  /** Объект с элементами DOM */
  elements: {
    /** Элементы с целевыми значениями */
    target: NodeListOf<Element> | null;
  };
}

/**
 * Состояние приложения
 * @type {AppState}
 */
const APP_STATE: AppState = {
  elements: {
    target: null,
  },
};

/**
 * Утилиты приложения
 * @type {Object}
 */
const APP_UTILS = {
  /**
   * Преобразует селектор атрибута в строку для data-атрибута
   * @param {string} element - Селектор атрибута
   * @returns {string} Строка для data-атрибута
   */
  renderDataAttributes: (element: string): string => element.slice(1, -1),
};

/**
 * Создает HTML-разметку приложения
 */
function createAppHTML(): void {
  const {
    root,
    selectors: { target },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='grid w-full max-w-4xl gap-4 rounded border bg-white p-3 shadow'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>Our stats</h1>
      <ul class='grid gap-3 place-items-center text-center lg:grid-cols-3'>
        <li>
          <span class='text-4xl font-bold sm:text-8xl' ${renderDataAttributes(target)}='120'>0</span>
          <p class='font-medium'>Succeeded projects</p>
        </li>
        <li>
          <span class='text-4xl font-bold sm:text-8xl' ${renderDataAttributes(target)}='140'>0</span>
          <p class='font-medium'>Working hours spent</p>
        </li>
        <li>
          <span class='text-4xl font-bold sm:text-8xl' ${renderDataAttributes(target)}='150'>0</span>
          <p class='font-medium'>Happy clients</p>
        </li>
      </ul>
    </div>
  `;
}

/**
 * Инициализирует элементы DOM в состоянии приложения
 */
function initDOMElements(): void {
  APP_STATE.elements = {
    target: document.querySelectorAll(APP_CONFIG.selectors.target),
  };
}

/**
 * Инициализирует приложение
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();

  if (APP_STATE.elements.target) {
    [...APP_STATE.elements.target].forEach((element) => handleElement(element));
  }
}

/**
 * Обрабатывает анимацию счетчика для отдельного элемента
 * @param {Element} element - DOM элемент для анимации
 */
function handleElement(element: Element): void {
  const targetValue = parseInt(element.getAttribute('data-target') || '0', 10);
  const increment = Math.ceil(targetValue / 100);
  let currentValue = 0;

  const updateCounter = (): void => {
    currentValue += increment;
    if (currentValue >= targetValue) {
      element.textContent = `${targetValue}+`;
      clearInterval(counterInterval);
    } else {
      element.textContent = `${currentValue}+`;
    }
  };

  const counterInterval = setInterval(updateCounter, 20);
}

initApp();
