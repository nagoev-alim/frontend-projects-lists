/**
 * Этот код реализует таймер обратного отсчета с пользовательским интерфейсом.
 * Пользователь может ввести количество минут, запустить, приостановить и сбросить таймер.
 * Код использует модульную структуру с конфигурацией, состоянием и утилитами.
 */

import './style.css';
import { icons } from 'feather-icons';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

/**
 * Конфигурация приложения
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента
 * @property {Object} selectors - Объект с селекторами элементов
 * @property {Object} icons - Объект с SVG иконками
 * @property {string} hiddenClassname - Класс для скрытия элементов
 * @property {number} maxMinutes - Максимальное количество минут
 * @property {number} secondsInMinute - Количество секунд в минуте
 */
const APP_CONFIG = {
  root: '#app',
  selectors: {
    minutes: '[data-minutes]',
    seconds: '[data-seconds]',
    controlButton: '[data-control]',
    resetButton: '[data-reset]',
    form: '[data-form]',
    hiddenElement: '[data-visible="false"]',
  },
  icons: {
    play: icons.play.toSvg(),
    pause: icons.pause.toSvg(),
  },
  hiddenClassname: 'hidden',
  maxMinutes: 59,
  secondsInMinute: 60,
};

/**
 * Состояние приложения
 * @typedef {Object} AppState
 * @property {number} secondsRemaining - Оставшееся время в секундах
 * @property {number|null} interval - ID интервала таймера
 * @property {Object} elements - Объект с DOM элементами
 */
const APP_STATE = {
  secondsRemaining: 0,
  interval: null,
  elements: {},
};

/**
 * Утилиты приложения
 * @typedef {Object} AppUtils
 * @property {Function} addLeadingZero - Добавляет ведущий ноль к числу
 * @property {Function} renderDataAttributes - Форматирует строку для data-атрибутов
 * @property {Function} showError - Показывает сообщение об ошибке
 */
const APP_UTILS = {
  /**
   * Добавляет ведущий ноль к числу
   * @param {number} num - Число для форматирования
   * @returns {string} Отформатированное число
   */
  addLeadingZero: (num) => num.toString().padStart(2, '0'),

  /**
   * Форматирует строку для data-атрибутов
   * @param {string} element - Строка для форматирования
   * @returns {string} Отформатированная строка
   */
  renderDataAttributes: (element) => element.slice(1, -1),

  /**
   * Показывает сообщение об ошибке
   * @param {string} message - Текст сообщения об ошибке
   */
  showError: (message) => {
    Toastify({
      text: message,
      className:
        'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
      duration: 3000,
      gravity: 'bottom',
      position: 'center',
    }).showToast();
  },
};

/**
 * Создает HTML структуру приложения
 */
function createAppHTML() {
  const {
    root,
    selectors: { minutes, seconds, controlButton, resetButton, hiddenElement },
    icons: { play },
  } = APP_CONFIG;
  const rootElement = document.querySelector(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='border shadow rounded max-w-md w-full p-4 grid gap-3'>
      <h1 class='text-center font-bold text-2xl md:text-4xl'>Timer</h1>
      <form data-form>
        <label aria-label='Enter number of minutes'>
          <input autocomplete='off' type='number' name='time' placeholder='Enter number of minutes:' class='w-full block p-3 rounded border-2 focus:outline-none focus:border-blue-300'>
        </label>
      </form>
      <div ${APP_UTILS.renderDataAttributes(hiddenElement)} class='hidden gap-3 place-items-center'>
        <div class='font-bold text-3xl md:text-6xl'>
          <span ${APP_UTILS.renderDataAttributes(minutes)}>00</span><span>:</span><span ${APP_UTILS.renderDataAttributes(seconds)}>00</span>
        </div>
        <button class='p-2 border shadow hover:bg-slate-100' ${APP_UTILS.renderDataAttributes(controlButton)}>${play}</button>
        <button class='p-2 border shadow hover:bg-slate-100' ${APP_UTILS.renderDataAttributes(resetButton)}>Reset Timer</button>
      </div>
    </div>`;
}

/**
 * Инициализирует DOM элементы
 */
function initDOMElements() {
  APP_STATE.elements = {
    minutes: document.querySelector(APP_CONFIG.selectors.minutes),
    seconds: document.querySelector(APP_CONFIG.selectors.seconds),
    controlButton: document.querySelector(APP_CONFIG.selectors.controlButton),
    resetButton: document.querySelector(APP_CONFIG.selectors.resetButton),
    form: document.querySelector(APP_CONFIG.selectors.form),
    hiddenElement: document.querySelector(APP_CONFIG.selectors.hiddenElement),
  };
}

/**
 * Инициализирует приложение
 */
function initApp() {
  createAppHTML();
  initDOMElements();
  APP_STATE.elements.form.addEventListener('submit', handleFormSubmit, { once: true });
  APP_STATE.elements.controlButton.addEventListener('click', handleControlButton);
  APP_STATE.elements.resetButton.addEventListener('click', handleResetButton);
}

/**
 * Переключает видимость элемента
 * @param {HTMLElement} element - Элемент для переключения
 * @param {boolean} isVisible - Флаг видимости
 */
const toggleVisibility = (element, isVisible) => {
  element.dataset.visible = isVisible.toString();
  element.classList.toggle(APP_CONFIG.hiddenClassname, !isVisible);
};

/**
 * Обрабатывает отправку формы
 * @param {Event} event - Событие отправки формы
 */
const handleFormSubmit = (event) => {
  event.preventDefault();
  const time = Number(new FormData(event.target).get('time').trim());
  if (time > 0 && time < APP_CONFIG.maxMinutes) {
    timerStop();
    APP_STATE.secondsRemaining = time * APP_CONFIG.secondsInMinute;
    timerUpdate();
    APP_STATE.elements.hiddenElement.classList.add('grid');
    toggleVisibility(APP_STATE.elements.hiddenElement, true);
    toggleVisibility(event.target, false);
    event.target.reset();
  } else {
    APP_UTILS.showError('Please enter a number from 1 to 59');
  }
};

/**
 * Обрабатывает нажатие на кнопку управления таймером
 */
const handleControlButton = () => {
  APP_STATE.interval === null ? timerStart() : timerStop();
};

/**
 * Обрабатывает нажатие на кнопку сброса таймера
 */
const handleResetButton = () => {
  timerStop();
  APP_STATE.secondsRemaining = 0;
  timerUpdate();
  toggleVisibility(APP_STATE.elements.hiddenElement, false);
  toggleVisibility(APP_STATE.elements.form, true);
};

/**
 * Останавливает таймер
 */
const timerStop = () => {
  if (!APP_STATE.interval) return;
  clearInterval(APP_STATE.interval);
  APP_STATE.interval = null;
  updateControl();
};

/**
 * Запускает таймер
 */
const timerStart = () => {
  if (APP_STATE.secondsRemaining === 0) return;
  APP_STATE.interval = setInterval(() => {
    APP_STATE.secondsRemaining--;
    timerUpdate();
    if (APP_STATE.secondsRemaining === 0) {
      timerStop();
    }
  }, 1000);
  updateControl();
};

/**
 * Обновляет отображение таймера
 */
const timerUpdate = () => {
  APP_STATE.elements.minutes.textContent = APP_UTILS.addLeadingZero(Math.floor(APP_STATE.secondsRemaining / APP_CONFIG.secondsInMinute));
  APP_STATE.elements.seconds.textContent = APP_UTILS.addLeadingZero((APP_STATE.secondsRemaining % APP_CONFIG.secondsInMinute));
};

/**
 * Обновляет отображение кнопки управления
 */
const updateControl = () => APP_STATE.elements.controlButton.innerHTML = `${APP_STATE.interval === null ? APP_CONFIG.icons.play : APP_CONFIG.icons.pause}`;

initApp();