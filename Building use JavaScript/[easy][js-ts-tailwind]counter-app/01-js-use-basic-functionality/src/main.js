/**
 * Этот код реализует простое приложение-счетчик.
 * Пользователь может увеличивать, уменьшать значение счетчика или сбрасывать его.
 * Приложение использует JavaScript для манипуляций с DOM и управления состоянием.
 */

import './style.css';

/**
 * Конфигурация приложения
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента приложения
 * @property {Object} selectors - Объект с селекторами элементов
 * @property {string} selectors.count - Селектор элемента счетчика
 * @property {string} selectors.buttons - Селектор кнопок
 * @property {number} step - Шаг изменения счетчика
 * @property {Object} operations - Объект с названиями операций
 */
const APP_CONFIG = {
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

/**
 * Состояние приложения
 * @typedef {Object} AppState
 * @property {number} counter - Текущее значение счетчика
 * @property {Object} elements - Объект с DOM элементами
 * @property {HTMLElement|null} elements.count - Элемент отображения счетчика
 * @property {NodeList|null} elements.buttons - Список кнопок управления
 */
const APP_STATE = {
  counter: 0,
  elements: {
    count: null,
    buttons: null,
  },
};

/**
 * Создает HTML структуру приложения
 */
function createAppHTML() {
  const { selectors: { count }, operations: { INCREMENT, DECREMENT, RESET }, root } = APP_CONFIG;
  const { counter } = APP_STATE;
  const rootElement = document.querySelector(root);

  if (!rootElement) return;

  /**
   * Создает HTML кнопки
   * @param {string} text - Текст кнопки
   * @param {string} className - CSS классы кнопки
   * @param {string} operation - Тип операции
   * @returns {string} HTML разметка кнопки
   */
  function createButton(text, className, operation) {
    return `<button class='${className}' data-operation="${operation}">${text}</button>`;
  }

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
 * Инициализирует DOM элементы в состоянии приложения
 */
function initDOMElements() {
  /**
   * Инициализация элементов DOM в состоянии приложения
   *
   * @property {HTMLElement|null} count - Элемент счетчика, найденный по селектору
   * @property {NodeList|null} buttons - Список кнопок управления, найденных по селектору
   */
   APP_STATE.elements = {
    count: document.querySelector(APP_CONFIG.selectors.count),
    buttons: document.querySelectorAll(APP_CONFIG.selectors.buttons),
  };
}

/**
 * Обновляет значение счетчика в состоянии и на странице
 * @param {number} value - Новое значение счетчика
 */
function updateCounter(value) {
  if (!APP_STATE.elements.count) return;
  APP_STATE.counter = value;
  APP_STATE.elements.count.textContent = APP_STATE.counter.toString();
}

/**
 * Обрабатывает клик по кнопке операции
 * @param {Event} event - Объект события клика
 */
function handleOperationClick({ target: { dataset: { operation } } }) {
  const { operations: { INCREMENT, DECREMENT, RESET }, step } = APP_CONFIG;

  const operationsList = {
    [INCREMENT]: () => updateCounter(APP_STATE.counter + step),
    [DECREMENT]: () => updateCounter(APP_STATE.counter - step),
    [RESET]: () => updateCounter(0),
  };

  if (!operation || !(operation in operationsList)) return;

  operationsList[operation]();
}

/**
 * Инициализирует приложение
 */
function initApp() {
  createAppHTML();
  initDOMElements();
  APP_STATE.elements.buttons.forEach(button => button?.addEventListener('click', handleOperationClick));
}

initApp();