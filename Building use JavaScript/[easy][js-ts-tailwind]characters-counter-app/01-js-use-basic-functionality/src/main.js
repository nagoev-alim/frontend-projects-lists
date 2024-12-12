/**
 * Этот код реализует простое веб-приложение для подсчета слов и символов.
 * Пользователь может вводить текст в текстовую область, и приложение
 * автоматически обновляет количество слов и символов при вводе.
 */

import './style.css';

/**
 * Конфигурация приложения
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента приложения
 * @property {Object} selectors - Селекторы для элементов ввода и вывода
 */
const APP_CONFIG = {
  root: '#app',
  selectors: {
    input: '[data-word-counter-textarea]',
    output: '[data-word-counter-result]',
  },
};

/**
 * Состояние приложения
 * @typedef {Object} AppState
 * @property {Object} elements - Объект для хранения DOM элементов
 */
const APP_STATE = {
  elements: {
    input: null,
    output: null,
  },
};

/**
 * Утилиты приложения
 * @typedef {Object} AppUtils
 */
const APP_UTILS = {
  /**
   * Удаляет квадратные скобки с начала и конца строки
   * @param {string} element - Строка для обработки
   * @returns {string} Обработанная строка
   */
  renderDataAttributes: (element) => element.slice(1, -1),

  /**
   * Создает функцию, которая откладывает вызов другой функции
   * @param {Function} func - Функция для отложенного вызова
   * @param {number} delay - Задержка в миллисекундах
   * @returns {Function} Функция с отложенным вызовом
   */
  debounce: (func, delay) => {
    let timeoutId;
    return function(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  },
};

/**
 * Создает HTML структуру приложения
 */
function createAppHTML() {
  const { root, selectors: { input, output } } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='grid w-full max-w-md gap-4 rounded border p-3 shadow'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>Word Counter</h1>
      <label aria-label='Enter some text below'>
        <textarea class='min-h-[160px] w-full resize-none rounded border-2 p-2 focus:border-blue-400 focus:outline-none' ${renderDataAttributes(input)} placeholder='Enter some text below:'></textarea>
      </label>
      <div class='text-center' ${renderDataAttributes(output)}>You've written <span class='font-bold'>0</span> words and <span class='font-bold'>0</span> characters.</div>
    </div>
  `;
}

/**
 * Инициализирует DOM элементы в состоянии приложения
 */
function initDOMElements() {
  APP_STATE.elements = {
    input: document.querySelector(APP_CONFIG.selectors.input),
    output: document.querySelector(APP_CONFIG.selectors.output),
  };
}

/**
 * Инициализирует приложение
 */
function initApp() {
  createAppHTML();
  initDOMElements();
  APP_STATE.elements.input.addEventListener('input', APP_UTILS.debounce(handleInputChange, 300));
}

/**
 * Подсчитывает количество слов и символов в тексте
 * @param {string} text - Текст для анализа
 * @returns {{words: number, chars: number}} Объект с количеством слов и символов
 */
function countWordsAndChars(text) {
  const words = text.match(/\S+/g) || [];
  return { words: words.length, chars: text.length };
}

/**
 * Создает HTML для вывода результата подсчета
 * @param {{words: number, chars: number}} param0 - Объект с количеством слов и символов
 * @returns {string} HTML строка для вывода результата
 */
function createOutputHTML({ words, chars }) {
  return `You've written <span class='font-bold'>${words}</span> words and <span class='font-bold'>${chars}</span> characters.`;
}

/**
 * Обработчик изменения ввода
 * @param {Event} event - Событие ввода
 */
function handleInputChange({ target: { value } }) {
  const counts = countWordsAndChars(value.trim());
  APP_STATE.elements.output.innerHTML = createOutputHTML(counts);
}

initApp();