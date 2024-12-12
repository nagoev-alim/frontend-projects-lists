/**
 * Этот код реализует простой калькулятор с графическим интерфейсом.
 * Он поддерживает основные арифметические операции и имеет функции
 * для обработки ввода цифр, операций, десятичной точки и очистки.
 */

import './style.css';

/**
 * Интерфейс для конфигурации приложения
 */
interface AppConfig {
  /** Корневой селектор для приложения */
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
 * Интерфейс для состояния приложения
 */
interface AppState {
  /** Элементы DOM калькулятора */
  elements: {
    output: HTMLElement | null,
    keypad: HTMLElement | null,
    operation: HTMLElement[],
    digit: HTMLElement[],
    decimal: HTMLElement | null,
    clear: HTMLElement | null,
    equals: HTMLElement | null,
  };
  /** Текущий итог вычислений */
  currentTotal: number;
  /** Текущий оператор */
  currentOperator: string;
  /** Флаг, указывающий, ожидается ли новый ввод */
  isNewInputExpected: boolean;
}

/**
 * Интерфейс для утилит приложения
 */
interface AppUtils {
  /** Функция для рендеринга data-атрибутов */
  renderDataAttributes: (element: string) => string;
}

/**
 * Конфигурация приложения
 */
const APP_CONFIG: AppConfig = {
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
    '/': (a: number, b: number) => strip(a / b),
    '*': (a: number, b: number) => strip(a * b),
    '+': (a: number, b: number) => strip(a + b),
    '-': (a: number, b: number) => strip(a - b),
    '=': (_: number, b: number) => strip(b),
  },
};

/**
 * Состояние приложения
 */
const APP_STATE: AppState = {
  elements: {
    output: null,
    keypad: null,
    operation: [],
    digit: [],
    decimal: null,
    clear: null,
    equals: null,
  },
  currentTotal: 0,
  currentOperator: '',
  isNewInputExpected: false,
};

/**
 * Утилиты приложения
 */
const APP_UTILS: AppUtils = {
  renderDataAttributes: (element: string): string => element.slice(1, -1),
};

/**
 * Создает HTML-структуру калькулятора
 */
function createAppHTML(): void {
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
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
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
 * Инициализирует элементы DOM в состоянии приложения
 */
function initDOMElements(): void {
  APP_STATE.elements = {
    output: document.querySelector(APP_CONFIG.selectors.output),
    keypad: document.querySelector(APP_CONFIG.selectors.keypad),
    operation: Array.from(document.querySelectorAll(APP_CONFIG.selectors.operation)),
    digit: Array.from(document.querySelectorAll(APP_CONFIG.selectors.digit)),
    decimal: document.querySelector(APP_CONFIG.selectors.decimal),
    clear: document.querySelector(APP_CONFIG.selectors.clear),
    equals: document.querySelector(APP_CONFIG.selectors.equals),
  };
}

/**
 * Инициализирует приложение
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();
  APP_STATE.elements.digit.forEach((button) =>
    button.addEventListener('click', handleDigitClick),
  );
  APP_STATE.elements.operation.forEach((button) =>
    button.addEventListener('click', handleOperationClick),
  );
  APP_STATE.elements.decimal?.addEventListener('click', handleDecimalClick);
  APP_STATE.elements.clear?.addEventListener('click', handleClearClick);
}

/**
 * Округляет число до 12 значащих цифр
 * @param value - Число для округления
 * @returns Округленное число
 */
function strip(value: number): number {
  return Number(value.toPrecision(12));
}

/**
 * Обрабатывает клик по цифровой кнопке
 * @param event - Событие клика мыши
 */
function handleDigitClick(event: MouseEvent): void {
  const digit = (event.target as HTMLElement).textContent;
  if (!digit || !APP_STATE.elements.output) return;

  const currentOutput = APP_STATE.elements.output.textContent;

  if (APP_STATE.isNewInputExpected) {
    APP_STATE.elements.output.textContent = digit;
    APP_STATE.isNewInputExpected = false;
  } else {
    APP_STATE.elements.output.textContent =
      currentOutput === '0' ? digit : (currentOutput ?? '') + digit;
  }
}

/**
 * Обрабатывает клик по кнопке операции
 * @param event - Событие клика мыши
 */
function handleOperationClick(event: MouseEvent): void {
  const operation = (event.target as HTMLElement).dataset.operation;
  if (!operation || !APP_STATE.elements.output) return;

  const currentOutput = Number(APP_STATE.elements.output.textContent);

  if (APP_STATE.currentOperator && APP_STATE.isNewInputExpected) {
    APP_STATE.currentOperator = operation;
    return;
  }

  if (APP_STATE.currentTotal) {
    const calculation = APP_CONFIG.calculate[APP_STATE.currentOperator](APP_STATE.currentTotal, currentOutput);
    APP_STATE.elements.output.textContent = calculation.toString();
    APP_STATE.currentTotal = calculation;
  } else {
    APP_STATE.currentTotal = currentOutput;
  }

  APP_STATE.isNewInputExpected = true;
  APP_STATE.currentOperator = operation ?? '';
}

/**
 * Обрабатывает клик по кнопке десятичной точки
 */
function handleDecimalClick(): void {
  if (!APP_STATE.elements.output) return;
  if (APP_STATE.isNewInputExpected || APP_STATE.elements.output.textContent?.includes('.')) return;
  APP_STATE.elements.output.textContent += '.';
}

/**
 * Обрабатывает клик по кнопке очистки
 */
function handleClearClick(): void {
  if (!APP_STATE.elements.output) return;
  [APP_STATE.currentTotal, APP_STATE.currentOperator, APP_STATE.isNewInputExpected] = [0, '', false];
  APP_STATE.elements.output.textContent = '0';
}

initApp();
