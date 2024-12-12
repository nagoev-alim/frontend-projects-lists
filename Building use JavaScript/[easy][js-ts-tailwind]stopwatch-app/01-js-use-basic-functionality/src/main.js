/**
 * Этот код реализует простой секундомер с кнопками "Старт", "Пауза" и "Сброс".
 * Секундомер отображает минуты и секунды, обновляясь каждую секунду.
 * Интерфейс создается динамически и вставляется в корневой элемент DOM.
 */

import './style.css';

/**
 * Конфигурация приложения
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента
 * @property {Object} selectors - Селекторы для элементов DOM
 * @property {string[]} types - Типы кнопок управления
 */
const APP_CONFIG = {
  root: '#app',
  selectors: {
    minutes: '[data-minutes]',
    seconds: '[data-seconds]',
    type: '[data-type]',
  },
  types: ['start', 'pause', 'reset'],
};

/**
 * Состояние приложения
 * @typedef {Object} AppState
 * @property {boolean} isRunning - Флаг работы таймера
 * @property {number|null} interval - ID интервала таймера
 * @property {number} time - Текущее время в секундах
 * @property {Object} elements - DOM элементы
 */
const APP_STATE = {
  isRunning: false,
  interval: null,
  time: 0,
  elements: {
    minutes: null,
    seconds: null,
    type: null,
  },
};

/**
 * Вспомогательные функции
 * @type {Object}
 */
const APP_UTILS = {
  /**
   * Делает первую букву строки заглавной
   * @param {string} str - Исходная строка
   * @returns {string} Строка с заглавной первой буквой
   */
  capitalizeFirstLetter: (str) => str.charAt(0).toUpperCase() + str.slice(1),

  /**
   * Добавляет ведущий ноль к числу
   * @param {number} num - Исходное число
   * @returns {string} Строка с ведущим нулем
   */
  addLeadingZero: (num) => num.toString().padStart(2, '0'),
};

/**
 * Создает HTML разметку приложения
 */
function createAppHTML() {
  const { root, types, selectors: { minutes, seconds, type: selectorType } } = APP_CONFIG;
  const rootElement = document.querySelector(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='border shadow rounded max-w-sm mx-auto w-full p-4 md:p-8'>
      <div class='grid gap-3'>
        <h1 class='text-center font-bold text-2xl md:text-4xl leading-none'>StopWatch</h1>
        <div class='text-center font-bold text-2xl  md:text-7xl leading-none'>
          <span ${minutes.slice(1, -1)}>00</span>:<span ${seconds.slice(1, -1)}>00</span>
        </div>
        <div class='grid gap-2 sm:grid-cols-3'>
          ${types.map((type) => `
            <button class='button shadow font-bold border' ${selectorType.slice(1, -1)}=${type}>${APP_UTILS.capitalizeFirstLetter(type)}</button>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

/**
 * Инициализирует DOM элементы
 */
function initDOMElements() {
  APP_STATE.elements = {
    minutes: document.querySelector(APP_CONFIG.selectors.minutes),
    seconds: document.querySelector(APP_CONFIG.selectors.seconds),
    type: Array.from(document.querySelectorAll(APP_CONFIG.selectors.type)),
  };
}

/**
 * Обновляет отображаемое время
 */
function updateTime() {
  APP_STATE.time++;
  APP_STATE.elements.minutes.textContent = APP_UTILS.addLeadingZero(Math.floor(APP_STATE.time / 60));
  APP_STATE.elements.seconds.textContent = APP_UTILS.addLeadingZero(APP_STATE.time % 60);
}

/**
 * Запускает таймер
 */
function startTimer() {
  if (APP_STATE.isRunning) return;

  APP_STATE.isRunning = true;
  APP_STATE.interval = setInterval(updateTime, 1000);
}

/**
 * Ставит таймер на паузу
 */
function pauseTimer() {
  if (!APP_STATE.isRunning) return;

  APP_STATE.isRunning = false;
  clearInterval(APP_STATE.interval);
}

/**
 * Сбрасывает таймер
 */
function resetTimer() {
  clearInterval(APP_STATE.interval);
  APP_STATE.isRunning = false;
  APP_STATE.time = 0;
  [APP_STATE.elements.minutes.textContent, APP_STATE.elements.seconds.textContent] = ['00', '00'];
}

/**
 * Обрабатывает клик по кнопкам управления
 * @param {Event} event - Событие клика
 */
function handleOperationClick({ target: { dataset: { type } } }) {
  const action = {
    start: () => startTimer(),
    pause: () => pauseTimer(),
    reset: () => resetTimer(),
  };

  if (!action[type]) return;

  action[type]();
}

/**
 * Инициализирует приложение
 */
function initApp() {
  createAppHTML();
  initDOMElements();
  APP_STATE.elements.type.forEach((button) => button.addEventListener('click', handleOperationClick));
}

initApp();