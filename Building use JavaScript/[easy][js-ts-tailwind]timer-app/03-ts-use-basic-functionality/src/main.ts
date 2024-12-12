/**
 * Этот код реализует таймер обратного отсчета с возможностью задания времени пользователем.
 * Он включает в себя функционал запуска, остановки и сброса таймера, а также
 * отображение оставшегося времени и управление видимостью элементов интерфейса.
 */

import './style.css';
import { icons } from 'feather-icons';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

/**
 * Интерфейс конфигурации приложения
 */
interface AppConfig {
  root: string;
  selectors: {
    minutes: string;
    seconds: string;
    controlButton: string;
    resetButton: string;
    form: string;
    hiddenElement: string;
  };
  icons: {
    play: string;
    pause: string;
  };
  hiddenClassname: string;
  maxMinutes: number;
  secondsInMinute: number;
}

/**
 * Конфигурация приложения
 */
const APP_CONFIG: AppConfig = {
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
 * Интерфейс состояния приложения
 */
interface AppState {
  secondsRemaining: number;
  interval: number | null;
  elements: {
    minutes: HTMLElement | null;
    seconds: HTMLElement | null;
    controlButton: HTMLElement | null;
    resetButton: HTMLElement | null;
    form: HTMLFormElement | null;
    hiddenElement: HTMLElement | null;
  };
}

/**
 * Состояние приложения
 */
const APP_STATE: AppState = {
  secondsRemaining: 0,
  interval: null,
  elements: {
    minutes: null,
    seconds: null,
    controlButton: null,
    resetButton: null,
    form: null,
    hiddenElement: null,
  },
};

/**
 * Утилиты приложения
 */
const APP_UTILS = {
  /**
   * Добавляет ведущий ноль к числу, если оно меньше 10
   * @param {number} num - Число для форматирования
   * @returns {string} Отформатированное число в виде строки
   */
  addLeadingZero: (num: number): string => num.toString().padStart(2, '0'),

  /**
   * Обрабатывает строку с данными атрибута
   * @param {string} element - Строка с данными атрибута
   * @returns {string} Обработанная строка
   */
  renderDataAttributes: (element: string): string => element.slice(1, -1),

  /**
   * Показывает сообщение об ошибке
   * @param {string} message - Текст сообщения об ошибке
   */
  showError: (message: string): void => {
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
 * Создает HTML-структуру приложения
 */
function createAppHTML(): void {
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
 * Инициализирует DOM-элементы
 */
function initDOMElements(): void {
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
function initApp(): void {
  createAppHTML();
  initDOMElements();
  APP_STATE.elements.form?.addEventListener('submit', handleFormSubmit, { once: true });
  APP_STATE.elements.controlButton?.addEventListener('click', handleControlButton);
  APP_STATE.elements.resetButton?.addEventListener('click', handleResetButton);
}

/**
 * Переключает видимость элемента
 * @param {HTMLElement} element - Элемент для переключения видимости
 * @param {boolean} isVisible - Флаг видимости
 */
const toggleVisibility = (element: HTMLElement, isVisible: boolean): void => {
  element.dataset.visible = isVisible.toString();
  element.classList.toggle(APP_CONFIG.hiddenClassname, !isVisible);
};

/**
 * Обрабатывает отправку формы
 * @param {Event} event - Событие отправки формы
 */
const handleFormSubmit = (event: Event): void => {
  event.preventDefault();
  const formData = new FormData(event.target as HTMLFormElement);
  const time = Number(formData.get('time')?.toString().trim());
  if (time > 0 && time < APP_CONFIG.maxMinutes) {
    timerStop();
    APP_STATE.secondsRemaining = time * APP_CONFIG.secondsInMinute;
    timerUpdate();
    APP_STATE.elements.hiddenElement?.classList.add('grid');
    APP_STATE.elements.hiddenElement && toggleVisibility(APP_STATE.elements.hiddenElement, true);
    APP_STATE.elements.form && toggleVisibility(APP_STATE.elements.form, false);
    (event.target as HTMLFormElement).reset();
  } else {
    APP_UTILS.showError('Please enter a number from 1 to 59');
  }
};

/**
 * Обрабатывает нажатие на кнопку управления
 */
const handleControlButton = (): void => {
  APP_STATE.interval === null ? timerStart() : timerStop();
};

/**
 * Обрабатывает нажатие на кнопку сброса
 */
const handleResetButton = (): void => {
  timerStop();
  APP_STATE.secondsRemaining = 0;
  timerUpdate();
  APP_STATE.elements.hiddenElement && toggleVisibility(APP_STATE.elements.hiddenElement, false);
  APP_STATE.elements.form && toggleVisibility(APP_STATE.elements.form, true);
};

/**
 * Останавливает таймер
 */
const timerStop = (): void => {
  if (!APP_STATE.interval) return;
  clearInterval(APP_STATE.interval);
  APP_STATE.interval = null;
  updateControl();
};

/**
 * Запускает таймер
 */
const timerStart = (): void => {
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
const timerUpdate = (): void => {
  if (APP_STATE.elements.minutes) {
    APP_STATE.elements.minutes.textContent = APP_UTILS.addLeadingZero(Math.floor(APP_STATE.secondsRemaining / APP_CONFIG.secondsInMinute));
  }
  if (APP_STATE.elements.seconds) {
    APP_STATE.elements.seconds.textContent = APP_UTILS.addLeadingZero((APP_STATE.secondsRemaining % APP_CONFIG.secondsInMinute));
  }
};

/**
 * Обновляет кнопку управления
 */
const updateControl = (): void => {
  if (APP_STATE.elements.controlButton) {
    APP_STATE.elements.controlButton.innerHTML = APP_STATE.interval === null ? APP_CONFIG.icons.play : APP_CONFIG.icons.pause;
  }
};

initApp();