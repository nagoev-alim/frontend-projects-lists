/**
 * Этот модуль реализует простой счетчик с возможностью увеличения, уменьшения и сброса значения.
 * Он использует класс Counter для инкапсуляции всей функциональности и управления состоянием.
 */

import './style.css';

/**
 * Класс Counter представляет счетчик с пользовательским интерфейсом.
 */
class Counter {
  /**
   * Создает экземпляр Counter и инициализирует его.
   */
  constructor() {
    /**
     * Конфигурация счетчика.
     * @type {Object}
     */
    this.config = {
      /** Селектор корневого элемента. */
      root: '#app',
      /** Объект с селекторами элементов. */
      selectors: {
        /** Селектор элемента отображения счетчика. */
        count: '[data-counter]',
        /** Селектор кнопок управления. */
        buttons: '[data-operation]',
      },
      /** Шаг изменения счетчика. */
      step: 1,
      /** Названия операций. */
      operations: {
        INCREMENT: 'increment',
        DECREMENT: 'decrement',
        RESET: 'reset',
      },
    };

    /**
     * Состояние счетчика.
     * @type {Object}
     */
    this.state = {
      /** Текущее значение счетчика. */
      counter: 0,
      /** Объект с DOM элементами. */
      elements: {
        /** Элемент отображения счетчика. */
        count: null,
        /** Коллекция кнопок управления. */
        buttons: null,
      },
    };

    this.init();
  }

  /**
   * Создает HTML структуру приложения.
   */
  createAppHTML() {
    const { selectors: { count }, operations: { INCREMENT, DECREMENT, RESET }, root } = this.config;
    const { counter } = this.state;
    const rootElement = document.querySelector(root);

    if (!rootElement) return;

    /**
     * Создает HTML кнопки.
     * @param {string} text - Текст кнопки.
     * @param {string} className - CSS классы кнопки.
     * @param {string} operation - Тип операции.
     * @returns {string} HTML разметка кнопки.
     */
    const createButton = (text, className, operation) => {
      return `<button class='${className}' data-operation="${operation}">${text}</button>`;
    };

    rootElement.innerHTML = `
      <div class='w-full max-w-sm mx-auto border rounded-lg p-4 md:p-6 grid gap-4 text-center'>
        <h1 class='text-2xl md:text-5xl font-bold'>Counter</h1>
        <p class='text-6xl md:text-8xl font-bold' ${count.slice(1, -1)}>${counter}</p>
        <div class='grid grid-cols-1 sm:grid-cols-3 gap-2'>
          ${createButton('Decrement', 'border-2 border-red-400 rounded-md p-2 text-red-400', DECREMENT)}
          ${createButton('Reset', 'border-2 rounded-md p-2', RESET)}
          ${createButton('Increment', 'border-2 border-green-400 rounded-md p-2 text-green-400', INCREMENT)}
        </div>
      </div>`;
  }

  /**
   * Инициализирует DOM элементы.
   */
  initDOMElements() {
    this.state.elements = {
      count: document.querySelector(this.config.selectors.count),
      buttons: document.querySelectorAll(this.config.selectors.buttons),
    };
  }

  /**
   * Обновляет значение счетчика.
   * @param {number} value - Новое значение счетчика.
   */
  updateCounter(value) {
    if (!this.state.elements.count) return;
    this.state.counter = value;
    this.state.elements.count.textContent = this.state.counter.toString();
  }

  /**
   * Обрабатывает клик по кнопке операции.
   * @param {Event} event - Объект события клика.
   */
  handleOperationClick = ({ target: { dataset: { operation } } }) => {
    const { operations: { INCREMENT, DECREMENT, RESET }, step } = this.config;

    const operationsList = {
      [INCREMENT]: () => this.updateCounter(this.state.counter + step),
      [DECREMENT]: () => this.updateCounter(this.state.counter - step),
      [RESET]: () => this.updateCounter(0),
    };

    if (!operation || !(operation in operationsList)) return;

    operationsList[operation]();
  };

  /**
   * Инициализирует приложение.
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();
    this.state.elements.buttons.forEach(button => button?.addEventListener('click', this.handleOperationClick));
  }
}

new Counter();