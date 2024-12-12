/**
 * Этот код реализует класс Stopwatch, который создает и управляет простым секундомером.
 * Секундомер отображает минуты и секунды, обновляясь каждую секунду.
 * Пользователь может запускать, приостанавливать и сбрасывать секундомер с помощью кнопок.
 */

import './style.css';

class Stopwatch {
  /**
   * Создает экземпляр секундомера
   */
  constructor() {
    /** @type {Object} Конфигурация секундомера */
    this.config = {
      /** @type {string} Селектор корневого элемента */
      root: '#app',
      /** @type {Object} Селекторы для элементов DOM */
      selectors: {
        minutes: '[data-minutes]',
        seconds: '[data-seconds]',
        type: '[data-type]',
      },
      /** @type {string[]} Типы кнопок управления */
      types: ['start', 'pause', 'reset'],
    };

    /** @type {Object} Состояние секундомера */
    this.state = {
      /** @type {boolean} Флаг работы таймера */
      isRunning: false,
      /** @type {number|null} ID интервала таймера */
      interval: null,
      /** @type {number} Текущее время в секундах */
      time: 0,
      /** @type {Object} DOM элементы */
      elements: {
        minutes: null,
        seconds: null,
        type: null,
      },
    };

    /** @type {Object} Вспомогательные функции */
    this.utils = {
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

    this.createAppHTML();
    this.initDOMElements();
    this.addEventListeners();
  }

  /**
   * Создает HTML разметку приложения
   */
  createAppHTML() {
    const { root, types, selectors: { minutes, seconds, type: selectorType } } = this.config;
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
              <button class='button shadow font-bold border' ${selectorType.slice(1, -1)}=${type}>${this.utils.capitalizeFirstLetter(type)}</button>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Инициализирует DOM элементы
   */
  initDOMElements() {
    /**
     * Инициализирует элементы DOM и сохраняет их в состоянии.
     * @property {HTMLElement} minutes - Элемент для отображения минут.
     * @property {HTMLElement} seconds - Элемент для отображения секунд.
     * @property {HTMLElement[]} type - Массив кнопок управления секундомером.
     */
    this.state.elements = {
      minutes: document.querySelector(this.config.selectors.minutes),
      seconds: document.querySelector(this.config.selectors.seconds),
      type: Array.from(document.querySelectorAll(this.config.selectors.type)),
    };
  }

  /**
   * Добавляет обработчики событий
   */
  addEventListeners() {
    this.state.elements.type.forEach((button) => button.addEventListener('click', this.handleOperationClick.bind(this)));
  }

  /**
   * Обновляет отображаемое время
   */
  updateTime() {
    this.state.time++;
    this.state.elements.minutes.textContent = this.utils.addLeadingZero(Math.floor(this.state.time / 60));
    this.state.elements.seconds.textContent = this.utils.addLeadingZero(this.state.time % 60);
  }

  /**
   * Запускает таймер
   */
  startTimer() {
    if (this.state.isRunning) return;

    this.state.isRunning = true;
    this.state.interval = setInterval(this.updateTime.bind(this), 1000);
  }

  /**
   * Ставит таймер на паузу
   */
  pauseTimer() {
    if (!this.state.isRunning) return;

    this.state.isRunning = false;
    clearInterval(this.state.interval);
  }

  /**
   * Сбрасывает таймер
   */
  resetTimer() {
    clearInterval(this.state.interval);
    this.state.isRunning = false;
    this.state.time = 0;
    [this.state.elements.minutes.textContent, this.state.elements.seconds.textContent] = ['00', '00'];
  }

  /**
   * Обрабатывает клик по кнопкам управления
   * @param {Event} event - Событие клика
   */
  handleOperationClick({ target: { dataset: { type } } }) {
    const action = {
      start: () => this.startTimer(),
      pause: () => this.pauseTimer(),
      reset: () => this.resetTimer(),
    };

    if (!action[type]) return;

    action[type]();
  }
}

new Stopwatch();