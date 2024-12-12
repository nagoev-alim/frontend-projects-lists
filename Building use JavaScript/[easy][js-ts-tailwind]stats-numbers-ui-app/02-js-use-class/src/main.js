/**
 * Этот код создает класс StatsCounter, который генерирует и управляет
 * интерактивной статистикой с анимированными счетчиками. Он создает
 * HTML-разметку для отображения статистики и анимирует числовые значения
 * от нуля до целевого значения.
 */

import './style.css';

/**
 * Класс для создания и управления анимированными счетчиками статистики
 */
class StatsCounter {
  /**
   * Создает экземпляр StatsCounter
   */
  constructor() {
    /**
     * Конфигурация приложения
     * @type {Object}
     */
    this.config = {
      /** @type {string} Селектор корневого элемента */
      root: '#app',
      /** @type {Object} Селекторы для поиска элементов */
      selectors: {
        /** @type {string} Селектор для элементов с целевым значением */
        target: '[data-target]',
      },
    };

    /**
     * Состояние приложения
     * @type {Object}
     */
    this.state = {
      /** @type {Object} Элементы DOM */
      elements: {
        /** @type {NodeList|null} Элементы с целевыми значениями */
        target: null,
      },
    };

    /**
     * Утилиты приложения
     * @type {Object}
     */
    this.utils = {
      /**
       * Преобразует селектор атрибута в строку для data-атрибута
       * @param {string} element - Селектор атрибута
       * @returns {string} Строка для data-атрибута
       */
      renderDataAttributes: (element) => element.slice(1, -1),
    };

    this.init();
  }

  /**
   * Создает HTML-разметку приложения
   */
  createAppHTML() {
    const {
      root,
      selectors: { target },
    } = this.config;
    const { renderDataAttributes } = this.utils;
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
  initDOMElements() {
    this.state.elements = {
      target: document.querySelectorAll(this.config.selectors.target),
    };
  }

  /**
   * Инициализирует приложение
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();

    [...this.state.elements.target].forEach((element) => this.handleElement(element));
  }

  /**
   * Обрабатывает анимацию счетчика для отдельного элемента
   * @param {Element} element - DOM элемент для анимации
   */
  handleElement(element) {
    const targetValue = parseInt(element.dataset.target);
    const increment = Math.ceil(targetValue / 100);
    let currentValue = 0;

    const updateCounter = () => {
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
}

new StatsCounter();
