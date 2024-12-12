/**
 * Этот код реализует простой секундомер с функциями старта, паузы и сброса.
 * Он использует TypeScript для строгой типизации и создает интерфейс секундомера
 * динамически в DOM. Секундомер отображает минуты и секунды, обновляясь каждую секунду.
 */

import './style.css';

/**
 * Интерфейс для конфигурации приложения
 * @interface
 */
interface AppConfig {
  /** Селектор корневого элемента */
  root: string;
  /** Объект с селекторами для различных элементов */
  selectors: {
    /** Селектор для элемента минут */
    minutes: string;
    /** Селектор для элемента секунд */
    seconds: string;
    /** Селектор для кнопок управления */
    type: string;
  };
  /** Массив типов кнопок управления */
  types: string[];
}

/**
 * Конфигурация приложения
 * @type {AppConfig}
 */
const APP_CONFIG: AppConfig = {
  root: '#app',
  selectors: {
    minutes: '[data-minutes]',
    seconds: '[data-seconds]',
    type: '[data-type]',
  },
  types: ['start', 'pause', 'reset'],
};

/**
 * Интерфейс для состояния приложения
 * @interface
 */
interface AppState {
  /** Флаг работы таймера */
  isRunning: boolean;
  /** ID интервала таймера */
  interval: number | null;
  /** Текущее время в секундах */
  time: number;
  /** Объект с DOM элементами */
  elements: {
    /** Элемент для отображения минут */
    minutes: HTMLElement | null;
    /** Элемент для отображения секунд */
    seconds: HTMLElement | null;
    /** Массив кнопок управления */
    type: HTMLElement[] | null;
  };
}

/**
 * Состояние приложения
 * @type {AppState}
 */
const APP_STATE: AppState = {
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
 * Объект с утилитарными функциями
 * @type {Object}
 */
const APP_UTILS = {
  /**
   * Делает первую букву строки заглавной
   * @param {string} str - Исходная строка
   * @returns {string} Строка с заглавной первой буквой
   */
  capitalizeFirstLetter: (str: string): string => str.charAt(0).toUpperCase() + str.slice(1),

  /**
   * Добавляет ведущий ноль к числу, если оно меньше 10
   * @param {number} num - Исходное число
   * @returns {string} Строка с ведущим нулем или без него
   */
  addLeadingZero: (num: number): string => num.toString().padStart(2, '0'),
};

/**
 * Создает HTML разметку приложения
 */
function createAppHTML(): void {
  const { root, types, selectors: { minutes, seconds, type: selectorType } } = APP_CONFIG;
  const rootElement: HTMLElement | null = document.querySelector(root);

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
function initDOMElements(): void {
  APP_STATE.elements = {
    minutes: document.querySelector<HTMLElement>(APP_CONFIG.selectors.minutes),
    seconds: document.querySelector<HTMLElement>(APP_CONFIG.selectors.seconds),
    type: Array.from(document.querySelectorAll<HTMLElement>(APP_CONFIG.selectors.type)),
  };
}

/**
 * Обновляет отображаемое время
 */
function updateTime(): void {
  APP_STATE.time++;
  if (APP_STATE.elements.minutes && APP_STATE.elements.seconds) {
    APP_STATE.elements.minutes.textContent = APP_UTILS.addLeadingZero(Math.floor(APP_STATE.time / 60));
    APP_STATE.elements.seconds.textContent = APP_UTILS.addLeadingZero(APP_STATE.time % 60);
  }
}

/**
 * Запускает таймер
 */
function startTimer(): void {
  if (APP_STATE.isRunning) return;

  APP_STATE.isRunning = true;
  APP_STATE.interval = setInterval(updateTime, 1000);
}

/**
 * Ставит таймер на паузу
 */
function pauseTimer(): void {
  if (!APP_STATE.isRunning) return;

  APP_STATE.isRunning = false;
  if (APP_STATE.interval !== null) {
    clearInterval(APP_STATE.interval);
  }
}

/**
 * Сбрасывает таймер
 */
function resetTimer(): void {
  if (APP_STATE.interval !== null) {
    clearInterval(APP_STATE.interval);
  }
  APP_STATE.isRunning = false;
  APP_STATE.time = 0;
  if (APP_STATE.elements.minutes && APP_STATE.elements.seconds) {
    APP_STATE.elements.minutes.textContent = '00';
    APP_STATE.elements.seconds.textContent = '00';
  }
}

/**
 * Обрабатывает клик по кнопкам управления
 * @param {Event} event - Событие клика
 */
function handleOperationClick(event: Event): void {
  const target = event.target as HTMLElement;
  const type = target.dataset.type;

  const action: { [key: string]: () => void } = {
    start: startTimer,
    pause: pauseTimer,
    reset: resetTimer,
  };

  if (type && action[type]) {
    action[type]();
  }
}

/**
 * Инициализирует приложение
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();
  if (APP_STATE.elements.type) {
    APP_STATE.elements.type.forEach((button) => button.addEventListener('click', handleOperationClick));
  }
}

initApp();