/**
 * Этот код реализует простой калькулятор с базовыми арифметическими операциями.
 * Он создает пользовательский интерфейс калькулятора, обрабатывает пользовательский ввод
 * и выполняет вычисления. Калькулятор поддерживает сложение, вычитание, умножение и деление,
 * а также работу с десятичными числами.
 */

import './style.css';

/**
 * Объект конфигурации приложения
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента
 * @property {Object} selectors - Объект с селекторами элементов интерфейса
 * @property {Object} calculate - Объект с функциями для выполнения арифметических операций
 */
const APP_CONFIG = {
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
    '/': (a, b) => strip(a / b),
    '*': (a, b) => strip(a * b),
    '+': (a, b) => strip(a + b),
    '-': (a, b) => strip(a - b),
    '=': (_, b) => strip(b),
  },
};

/**
 * Объект состояния приложения
 * @typedef {Object} AppState
 * @property {Object} elements - Объект с ссылками на DOM элементы
 * @property {number} currentTotal - Текущий результат вычислений
 * @property {string} currentOperator - Текущий оператор
 * @property {boolean} isNewInputExpected - Флаг, указывающий на ожидание нового ввода
 */
const APP_STATE = {
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

const APP_UTILS = {
  renderDataAttributes: (element) => element.slice(1, -1),
};

/**
 * Создает HTML разметку калькулятора
 */
function createAppHTML() {
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
 * Инициализирует DOM элементы и сохраняет их в APP_STATE
 */
function initDOMElements() {
  APP_STATE.elements = {
    output: document.querySelector(APP_CONFIG.selectors.output),
    keypad: document.querySelector(APP_CONFIG.selectors.keypad),
    operation: document.querySelectorAll(APP_CONFIG.selectors.operation),
    digit: document.querySelectorAll(APP_CONFIG.selectors.digit),
    decimal: document.querySelector(APP_CONFIG.selectors.decimal),
    clear: document.querySelector(APP_CONFIG.selectors.clear),
    equals: document.querySelector(APP_CONFIG.selectors.equals),
  };
}

/**
 * Инициализирует приложение, создавая HTML и назначая обработчики событий
 */
function initApp() {
  createAppHTML();
  initDOMElements();

  [...APP_STATE.elements.digit].forEach((button) =>
    button.addEventListener('click', handleDigitClick),
  );
  [...APP_STATE.elements.operation].forEach((button) =>
    button.addEventListener('click', handleOperationClick),
  );
  APP_STATE.elements.decimal.addEventListener('click', handleDecimalClick);
  APP_STATE.elements.clear.addEventListener('click', handleClearClick);
}

/**
 * Округляет число до заданной точности
 * @param {number} value - Число для округления
 * @returns {number} Округленное число
 */
function strip(value) {
  return Number(value.toPrecision(12));
}

/**
 * Обрабатывает нажатие на цифровую кнопку
 * @param {Event} event - Событие клика
 */
function handleDigitClick({ target: { textContent: digit } }) {
  const currentOutput = APP_STATE.elements.output.textContent;

  if (APP_STATE.isNewInputExpected) {
    APP_STATE.elements.output.textContent = digit;
    APP_STATE.isNewInputExpected = false;
  } else {
    APP_STATE.elements.output.textContent =
      currentOutput === '0' ? digit : currentOutput + digit;
  }
}

/**
 * Обрабатывает нажатие на кнопку операции
 * @param {Event} event - Событие клика
 */
function handleOperationClick({
  target: {
    dataset: { operation },
  },
}) {
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
 * Обрабатывает нажатие на десятичную точку
 */
function handleDecimalClick() {
  if (APP_STATE.isNewInputExpected || APP_STATE.elements.output.textContent.includes('.')) return;
  APP_STATE.elements.output.textContent += '.';
}

/**
 * Обрабатывает нажатие на кнопку очистки
 */
function handleClearClick() {
  [APP_STATE.currentTotal, APP_STATE.currentOperator, APP_STATE.isNewInputExpected] = [0, '', false];
  APP_STATE.elements.output.textContent = '0';
}

initApp();
