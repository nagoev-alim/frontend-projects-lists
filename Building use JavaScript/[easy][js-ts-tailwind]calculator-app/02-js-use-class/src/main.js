/**
 * Этот файл содержит класс Calculator, который реализует функциональность калькулятора.
 * Калькулятор поддерживает базовые арифметические операции, работу с десятичными числами
 * и очистку результата. Класс создает пользовательский интерфейс калькулятора в HTML
 * и обрабатывает взаимодействие пользователя с кнопками калькулятора.
 */

import './style.css';

class Calculator {
  /**
   * Создает экземпляр калькулятора и инициализирует его.
   */
  constructor() {
    /**
     * @type {Object} Конфигурация калькулятора
     * @property {string} root - Селектор корневого элемента
     * @property {Object} selectors - Селекторы для различных элементов калькулятора
     * @property {Object} calculate - Функции для выполнения арифметических операций
     */
    this.config = {
      root: '#app',
      selectors: {
        output: '[data-output]',
        keypad: '[data-keypad]',
        operation: '[data-operation]',
        digit: '[data-digit]',
        decimal: '[data-decimal]',
        clear: '[data-clear]',
        equals: '[data-equals]',
      },
      calculate: {
        '/': (a, b) => this.strip(a / b),
        '*': (a, b) => this.strip(a * b),
        '+': (a, b) => this.strip(a + b),
        '-': (a, b) => this.strip(a - b),
        '=': (_, b) => this.strip(b),
      },
    };

    /**
     * @type {Object} Состояние калькулятора
     * @property {Object} elements - DOM элементы калькулятора
     * @property {number} currentTotal - Текущий результат вычислений
     * @property {string} currentOperator - Текущий оператор
     * @property {boolean} isNewInputExpected - Флаг ожидания нового ввода
     */
    this.state = {
      elements: {
        output: null,
        keypad: null,
        operation: null,
        digit: null,
        decimal: null,
        clear: null,
        equals: null,
      },
      currentTotal: 0,
      currentOperator: '',
      isNewInputExpected: false,
    };

    /**
     * @type {Object} Вспомогательные функции
     * @property {Function} renderDataAttributes - Функция для рендеринга data-атрибутов
     */
    this.utils = {
      renderDataAttributes: (element) => element.slice(1, -1),
    };

    this.init();
  }

  /**
   * Создает HTML структуру калькулятора.
   */
  createAppHTML() {
    const {
      root,
      selectors: { output, keypad, operation, digit, decimal, clear, equals },
    } = this.config;
    const { renderDataAttributes } = this.utils;
    const rootElement = document.querySelector(root);

    if (!rootElement) return;

    rootElement.innerHTML = `
    <div class='calculator grid w-full max-w-md gap-4 rounded border p-3 shadow'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>Calculator</h1>
      <div class='container'>
        <div class='display'>
          <span class='text-3xl font-medium' ${renderDataAttributes(output)}>0</span>
        </div>
        <div class='body' ${renderDataAttributes(keypad)}>
          <button class='operator' ${renderDataAttributes(operation)}='+'>+</button>
          <button class='operator' ${renderDataAttributes(operation)}='-'>-</button>
          <button class='operator' ${renderDataAttributes(operation)}='*'>×</button>
          <button class='operator' ${renderDataAttributes(operation)}='/'>÷</button>
          <button class='number' ${renderDataAttributes(digit)}='7'>7</button>
          <button class='number' ${renderDataAttributes(digit)}='8'>8</button>
          <button class='number' ${renderDataAttributes(digit)}='9'>9</button>
          <button class='number' ${renderDataAttributes(digit)}='4'>4</button>
          <button class='number' ${renderDataAttributes(digit)}='5'>5</button>
          <button class='number' ${renderDataAttributes(digit)}='6'>6</button>
          <button class='number' ${renderDataAttributes(digit)}='1'>1</button>
          <button class='number' ${renderDataAttributes(digit)}='2'>2</button>
          <button class='number' ${renderDataAttributes(digit)}='3'>3</button>
          <button class='decimal' ${renderDataAttributes(decimal)}='.'>.</button>
          <button class='number' ${renderDataAttributes(digit)}='0'>0</button>
          <button class='clear' ${renderDataAttributes(clear)}>C</button>
          <button class='equal operator' ${renderDataAttributes(operation)}='=' ${renderDataAttributes(equals)}='='>=</button>
        </div>
      </div>
    </div>
  `;
  }

  /**
   * Инициализирует DOM элементы калькулятора.
   */
  initDOMElements() {
    this.state.elements = {
      output: document.querySelector(this.config.selectors.output),
      keypad: document.querySelector(this.config.selectors.keypad),
      operation: document.querySelectorAll(this.config.selectors.operation),
      digit: document.querySelectorAll(this.config.selectors.digit),
      decimal: document.querySelector(this.config.selectors.decimal),
      clear: document.querySelector(this.config.selectors.clear),
      equals: document.querySelector(this.config.selectors.equals),
    };
  }

  /**
   * Инициализирует калькулятор, создавая HTML и добавляя обработчики событий.
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();

    [...this.state.elements.digit].forEach((button) =>
      button.addEventListener('click', this.handleDigitClick.bind(this))
    );
    [...this.state.elements.operation].forEach((button) =>
      button.addEventListener('click', this.handleOperationClick.bind(this))
    );
    this.state.elements.decimal.addEventListener('click', this.handleDecimalClick.bind(this));
    this.state.elements.clear.addEventListener('click', this.handleClearClick.bind(this));
  }

  /**
   * Округляет число до 12 значащих цифр для предотвращения ошибок с плавающей запятой.
   * @param {number} value - Число для округления
   * @returns {number} Округленное число
   */
  strip(value) {
    return Number(value.toPrecision(12));
  }

  /**
   * Обрабатывает нажатие на цифровую кнопку.
   * @param {Event} event - Событие клика
   */
  handleDigitClick({ target: { textContent: digit } }) {
    const currentOutput = this.state.elements.output.textContent;

    if (this.state.isNewInputExpected) {
      this.state.elements.output.textContent = digit;
      this.state.isNewInputExpected = false;
    } else {
      this.state.elements.output.textContent =
        currentOutput === '0' ? digit : currentOutput + digit;
    }
  }

  /**
   * Обрабатывает нажатие на кнопку операции.
   * @param {Event} event - Событие клика
   */
  handleOperationClick({
    target: {
      dataset: { operation },
    },
  }) {
    const currentOutput = Number(this.state.elements.output.textContent);

    if (this.state.currentOperator && this.state.isNewInputExpected) {
      this.state.currentOperator = operation;
      return;
    }

    if (this.state.currentTotal) {
      const calculation = this.config.calculate[this.state.currentOperator](
        this.state.currentTotal,
        currentOutput
      );
      this.state.elements.output.textContent = calculation.toString();
      this.state.currentTotal = calculation;
    } else {
      this.state.currentTotal = currentOutput;
    }

    this.state.isNewInputExpected = true;
    this.state.currentOperator = operation ?? '';
  }

  /**
   * Обрабатывает нажатие на кнопку десятичной точки.
   */
  handleDecimalClick() {
    if (this.state.isNewInputExpected || this.state.elements.output.textContent.includes('.')) return;
    this.state.elements.output.textContent += '.';
  }

  /**
   * Обрабатывает нажатие на кнопку очистки.
   */
  handleClearClick() {
    [this.state.currentTotal, this.state.currentOperator, this.state.isNewInputExpected] = [0, '', false];
    this.state.elements.output.textContent = '0';
  }
}

new Calculator();
