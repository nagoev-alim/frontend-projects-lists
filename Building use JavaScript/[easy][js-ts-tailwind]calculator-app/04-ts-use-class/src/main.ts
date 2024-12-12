/**
 * Этот файл содержит реализацию калькулятора на TypeScript.
 * Калькулятор поддерживает базовые арифметические операции,
 * имеет пользовательский интерфейс и обрабатывает пользовательский ввод.
 */

import './style.css';

/**
 * Интерфейс для конфигурации калькулятора
 */
interface CalculatorConfig {
  /** Корневой элемент для рендеринга калькулятора */
  root: string;
  /** Селекторы для различных элементов калькулятора */
  selectors: {
    [key: string]: string;
  };
  /** Функции для выполнения арифметических операций */
  calculate: {
    [key: string]: (a: number, b: number) => number;
  };
}

/**
 * Интерфейс для состояния калькулятора
 */
interface CalculatorState {
  /** Ссылки на DOM элементы калькулятора */
  elements: {
    output: HTMLElement | null;
    keypad: HTMLElement | null;
    operation: NodeListOf<HTMLElement> | null;
    digit: NodeListOf<HTMLElement> | null;
    decimal: HTMLElement | null;
    clear: HTMLElement | null;
    equals: HTMLElement | null;
  };
  /** Текущий результат вычислений */
  currentTotal: number;
  /** Текущий оператор */
  currentOperator: string;
  /** Флаг, указывающий на ожидание нового ввода */
  isNewInputExpected: boolean;
}

/**
 * Интерфейс для вспомогательных функций калькулятора
 */
interface CalculatorUtils {
  /** Функция для рендеринга data-атрибутов */
  renderDataAttributes: (element: string) => string;
}

/**
 * Класс Calculator реализует функциональность калькулятора
 */
class Calculator {
  /** Конфигурация калькулятора */
  private readonly config: CalculatorConfig;
  /** Состояние калькулятора */
  private state: CalculatorState;
  /** Вспомогательные функции */
  private readonly utils: CalculatorUtils;

  /**
   * Создает экземпляр калькулятора
   */
  constructor() {
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
        '/': (a: number, b: number) => this.strip(a / b),
        '*': (a: number, b: number) => this.strip(a * b),
        '+': (a: number, b: number) => this.strip(a + b),
        '-': (a: number, b: number) => this.strip(a - b),
        '=': (_: number, b: number) => this.strip(b),
      },
    };

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

    this.utils = {
      renderDataAttributes: (element: string): string => element.slice(1, -1),
    };

    this.init();
  }

  /**
   * Создает HTML разметку для калькулятора
   */
  private createAppHTML(): void {
    const {
      root,
      selectors: {
        output,
        keypad,
        operation,
        digit,
        decimal,
        clear,
        equals,
      },
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
   * Инициализирует DOM элементы калькулятора
   */
  private initDOMElements(): void {
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
   * Инициализирует калькулятор
   */
  private init(): void {
    this.createAppHTML();
    this.initDOMElements();

    if (this.state.elements.digit) {
      [...this.state.elements.digit].forEach((button) =>
        button.addEventListener('click', this.handleDigitClick.bind(this)),
      );
    }
    if (this.state.elements.operation) {
      [...this.state.elements.operation].forEach((button) =>
        button.addEventListener('click', this.handleOperationClick.bind(this)),
      );
    }
    this.state.elements.decimal?.addEventListener('click', this.handleDecimalClick.bind(this));
    this.state.elements.clear?.addEventListener('click', this.handleClearClick.bind(this));
  }

  /**
   * Округляет число до 12 знаков после запятой
   * @param value - Число для округления
   * @returns Округленное число
   */
  private strip(value: number): number {
    return Number(value.toPrecision(12));
  }

  /**
   * Обрабатывает клик по цифровой кнопке
   * @param event - Событие клика
   */
  private handleDigitClick({ target }: MouseEvent): void {
    if (!(target instanceof HTMLElement) || !this.state.elements.output) return;
    const digit = target.textContent;
    if (!digit) return;

    const currentOutput = this.state.elements.output.textContent;

    if (this.state.isNewInputExpected) {
      this.state.elements.output.textContent = digit;
      this.state.isNewInputExpected = false;
    } else {
      this.state.elements.output.textContent =
        currentOutput === '0' ? digit : (currentOutput ?? '') + digit;
    }
  }

  /**
   * Обрабатывает клик по кнопке операции
   * @param event - Событие клика
   */
  private handleOperationClick({ target }: MouseEvent): void {
    if (!(target instanceof HTMLElement) || !this.state.elements.output) return;
    const operation = target.dataset.operation;
    if (!operation) return;

    const currentOutput = Number(this.state.elements.output.textContent);

    if (this.state.currentOperator && this.state.isNewInputExpected) {
      this.state.currentOperator = operation;
      return;
    }

    if (this.state.currentTotal) {
      const calculation = this.config.calculate[this.state.currentOperator](this.state.currentTotal, currentOutput);
      this.state.elements.output.textContent = calculation.toString();
      this.state.currentTotal = calculation;
    } else {
      this.state.currentTotal = currentOutput;
    }

    this.state.isNewInputExpected = true;
    this.state.currentOperator = operation;
  }

  /**
   * Обрабатывает клик по кнопке десятичной точки
   */
  private handleDecimalClick(): void {
    if (!this.state.elements.output) return;
    if (this.state.isNewInputExpected || this.state.elements.output.textContent?.includes('.')) return;
    this.state.elements.output.textContent += '.';
  }

  /**
   * Обрабатывает клик по кнопке очистки
   */
  private handleClearClick(): void {
    if (!this.state.elements.output) return;
    [this.state.currentTotal, this.state.currentOperator, this.state.isNewInputExpected] = [0, '', false];
    this.state.elements.output.textContent = '0';
  }
}

new Calculator();
