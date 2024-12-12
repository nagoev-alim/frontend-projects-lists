/**
 * Этот модуль реализует простой счетчик с возможностью увеличения, уменьшения и сброса значения.
 * Он использует класс Counter для инкапсуляции всей функциональности и управления состоянием.
 * Счетчик отображается на веб-странице и позволяет пользователю взаимодействовать с ним через кнопки.
 */

import './style.css';

/**
 * Интерфейс для конфигурации счетчика.
 */
interface Config {
  /** Селектор корневого элемента */
  root: string;
  /** Селекторы для различных элементов счетчика */
  selectors: {
    /** Селектор для элемента, отображающего значение счетчика */
    count: string;
    /** Селектор для кнопок управления */
    buttons: string;
  };
  /** Шаг изменения счетчика */
  step: number;
  /** Типы операций */
  operations: {
    /** Операция увеличения */
    INCREMENT: string;
    /** Операция уменьшения */
    DECREMENT: string;
    /** Операция сброса */
    RESET: string;
  };
}

/**
 * Интерфейс для состояния счетчика.
 */
interface State {
  /** Текущее значение счетчика */
  counter: number;
  /** Ссылки на DOM элементы */
  elements: {
    /** Элемент, отображающий значение счетчика */
    count: HTMLElement | null;
    /** Коллекция кнопок управления */
    buttons: NodeListOf<HTMLElement> | null;
  };
}

/**
 * Класс Counter представляет счетчик с пользовательским интерфейсом.
 */
class Counter {
  /** Конфигурация счетчика */
  private config: Config;
  /** Состояние счетчика */
  private state: State;

  /**
   * Создает экземпляр Counter и инициализирует его.
   */
  constructor() {
    this.config = {
      root: '#app',
      selectors: {
        count: '[data-counter]',
        buttons: '[data-operation]',
      },
      step: 1,
      operations: {
        INCREMENT: 'increment',
        DECREMENT: 'decrement',
        RESET: 'reset',
      },
    };

    this.state = {
      counter: 0,
      elements: {
        count: null,
        buttons: null,
      },
    };

    this.init();
  }

  /**
   * Создает HTML структуру приложения.
   */
  private createAppHTML(): void {
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
    const createButton = (text: string, className: string, operation: string): string => {
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
  private initDOMElements(): void {
    this.state.elements = {
      count: document.querySelector(this.config.selectors.count),
      buttons: document.querySelectorAll(this.config.selectors.buttons),
    };
  }

  /**
   * Обновляет значение счетчика.
   * @param {number} value - Новое значение счетчика.
   */
  private updateCounter(value: number): void {
    if (!this.state.elements.count) return;
    this.state.counter = value;
    this.state.elements.count.textContent = this.state.counter.toString();
  }

  /**
   * Обрабатывает клик по кнопке операции.
   * @param {Event} event - Объект события клика.
   */
  private handleOperationClick = ({ target }: Event): void => {
    if (!(target instanceof HTMLElement)) return;
    const operation = target.dataset.operation;
    const { operations: { INCREMENT, DECREMENT, RESET }, step } = this.config;

    const operationsList: { [key: string]: () => void } = {
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
  private init(): void {
    this.createAppHTML();
    this.initDOMElements();
    this.state.elements.buttons?.forEach(button => button.addEventListener('click', this.handleOperationClick));
  }
}

new Counter();