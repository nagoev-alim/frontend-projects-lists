/**
 * Этот модуль реализует таймер обратного отсчета с пользовательским интерфейсом.
 * Пользователь может ввести количество минут, запустить, приостановить и сбросить таймер.
 * Код использует объектно-ориентированный подход с классом Timer.
 */

import './style.css';
import { icons } from 'feather-icons';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

/**
 * Класс, представляющий таймер обратного отсчета
 */
class Timer {
  /**
   * Создает экземпляр Timer
   */
  constructor() {
    /**
     * Конфигурация таймера
     * @type {Object}
     */
    this.config = {
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
     * Состояние таймера
     * @type {Object}
     */
    this.state = {
      secondsRemaining: 0,
      interval: null,
      elements: {},
    };

    /**
     * Утилиты таймера
     * @type {Object}
     */
    this.utils = {
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
          className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
          duration: 3000,
          gravity: 'bottom',
          position: 'center',
        }).showToast();
      },
    };

    this.init();
  }

  /**
   * Создает HTML структуру приложения
   */
  createAppHTML() {
    const {
      root,
      selectors: { minutes, seconds, controlButton, resetButton, hiddenElement },
      icons: { play },
    } = this.config;
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
        <div ${this.utils.renderDataAttributes(hiddenElement)} class='hidden gap-3 place-items-center'>
          <div class='font-bold text-3xl md:text-6xl'>
            <span ${this.utils.renderDataAttributes(minutes)}>00</span><span>:</span><span ${this.utils.renderDataAttributes(seconds)}>00</span>
          </div>
          <button class='p-2 border shadow hover:bg-slate-100' ${this.utils.renderDataAttributes(controlButton)}>${play}</button>
          <button class='p-2 border shadow hover:bg-slate-100' ${this.utils.renderDataAttributes(resetButton)}>Reset Timer</button>
        </div>
      </div>`;
  }

  /**
   * Инициализирует DOM элементы
   */
  initDOMElements() {
    this.state.elements = {
      minutes: document.querySelector(this.config.selectors.minutes),
      seconds: document.querySelector(this.config.selectors.seconds),
      controlButton: document.querySelector(this.config.selectors.controlButton),
      resetButton: document.querySelector(this.config.selectors.resetButton),
      form: document.querySelector(this.config.selectors.form),
      hiddenElement: document.querySelector(this.config.selectors.hiddenElement),
    };
  }

  /**
   * Переключает видимость элемента
   * @param {HTMLElement} element - Элемент для переключения
   * @param {boolean} isVisible - Флаг видимости
   */
  toggleVisibility(element, isVisible) {
    element.dataset.visible = isVisible.toString();
    element.classList.toggle(this.config.hiddenClassname, !isVisible);
  }

  /**
   * Обрабатывает отправку формы
   * @param {Event} event - Событие отправки формы
   */
  handleFormSubmit = (event) => {
    event.preventDefault();
    const time = Number(new FormData(event.target).get('time').trim());
    if (time > 0 && time < this.config.maxMinutes) {
      this.timerStop();
      this.state.secondsRemaining = time * this.config.secondsInMinute;
      this.timerUpdate();
      this.state.elements.hiddenElement.classList.add('grid');
      this.toggleVisibility(this.state.elements.hiddenElement, true);
      this.toggleVisibility(event.target, false);
      event.target.reset();
    } else {
      this.utils.showError('Please enter a number from 1 to 59');
    }
  };

  /**
   * Обрабатывает нажатие на кнопку управления
   */
  handleControlButton = () => {
    this.state.interval === null ? this.timerStart() : this.timerStop();
  };

  /**
   * Обрабатывает нажатие на кнопку сброса
   */
  handleResetButton = () => {
    this.timerStop();
    this.state.secondsRemaining = 0;
    this.timerUpdate();
    this.toggleVisibility(this.state.elements.hiddenElement, false);
    this.toggleVisibility(this.state.elements.form, true);
  };

  /**
   * Останавливает таймер
   */
  timerStop() {
    if (!this.state.interval) return;
    clearInterval(this.state.interval);
    this.state.interval = null;
    this.updateControl();
  }

  /**
   * Запускает таймер
   */
  timerStart() {
    if (this.state.secondsRemaining === 0) return;
    this.state.interval = setInterval(() => {
      this.state.secondsRemaining--;
      this.timerUpdate();
      if (this.state.secondsRemaining === 0) {
        this.timerStop();
      }
    }, 1000);
    this.updateControl();
  }

  /**
   * Обновляет отображение таймера
   */
  timerUpdate() {
    this.state.elements.minutes.textContent = this.utils.addLeadingZero(Math.floor(this.state.secondsRemaining / this.config.secondsInMinute));
    this.state.elements.seconds.textContent = this.utils.addLeadingZero((this.state.secondsRemaining % this.config.secondsInMinute));
  }

  /**
   * Обновляет кнопку управления
   */
  updateControl() {
    this.state.elements.controlButton.innerHTML = `${this.state.interval === null ? this.config.icons.play : this.config.icons.pause}`;
  }

  /**
   * Инициализирует таймер
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();
    this.state.elements.form.addEventListener('submit', this.handleFormSubmit, { once: true });
    this.state.elements.controlButton.addEventListener('click', this.handleControlButton);
    this.state.elements.resetButton.addEventListener('click', this.handleResetButton);
  }
}

new Timer();