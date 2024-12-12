/**
 * Этот файл содержит класс AlarmClock, который реализует функциональность будильника.
 * Он позволяет пользователю устанавливать время будильника, отображать текущее время
 * и воспроизводить звук при срабатывании будильника.
 */

import './style.css';
import sound from '/sound.mp3';
import { icons } from 'feather-icons';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

/**
 * Класс, реализующий функциональность будильника
 */
class AlarmClock {
  /**
   * Создает экземпляр AlarmClock
   */
  constructor() {
    /**
     * @type {Object} Конфигурация будильника
     * @property {string} root - Селектор корневого элемента
     * @property {Object} selectors - Селекторы для различных элементов интерфейса
     * @property {string} icon - SVG иконка будильника
     * @property {string[]} alarmTime - Возможные периоды времени (AM/PM)
     */
    this.config = {
      root: '#app',
      selectors: {
        hour: '[data-hour]',
        minute: '[data-minute]',
        period: '[data-period]',
        clock: '[data-clock]',
        set: '[data-set]',
        root: '[data-root]',
        icon: '[data-icon]',
      },
      icon: icons.bell.toSvg({ width: 80, height: 80 }),
      alarmTime: ['AM', 'PM'],
    };

    /**
     * @type {Object} Состояние будильника
     * @property {Audio} audio - Аудио объект для воспроизведения звука будильника
     * @property {boolean} alarmState - Состояние будильника (включен/выключен)
     * @property {string} alarmTimeString - Строка с установленным временем будильника
     * @property {Object} elements - Объект с ссылками на DOM элементы
     */
    this.state = {
      audio: new Audio(sound),
      alarmState: false,
      alarmTimeString: '',
      elements: {},
    };

    /**
     * @type {Object} Вспомогательные функции
     */
    this.utils = {
      /**
       * Добавляет ведущий ноль к числу, если оно меньше 10
       * @param {number} num - Число для форматирования
       * @returns {string} Отформатированное число
       */
      addLeadingZero: (num) => num.toString().padStart(2, '0'),

      /**
       * Удаляет квадратные скобки из строки с data-атрибутом
       * @param {string} element - Строка с data-атрибутом
       * @returns {string} Строка без квадратных скобок
       */
      renderDataAttributes: (element) => element.slice(1, -1),

      /**
       * Генерирует массив отформатированных чисел
       * @param {number} num - Количество чисел для генерации
       * @returns {string[]} Массив отформатированных чисел
       */
      generateFormattedTime: (num) =>
        Array.from({ length: num }, (_, i) => (i + 1).toString().padStart(2, '0')),

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
   * Создает HTML разметку для будильника
   */
  createAppHTML() {
    const {
      root,
      icon: iconElement,
      alarmTime,
      selectors: { hour, minute, period, clock, set, root: rootSelector, icon },
    } = this.config;
    const { renderDataAttributes, generateFormattedTime } = this.utils;
    const rootElement = document.querySelector(root);

    if (!rootElement) return;

    const generateOptions = (value) => value.map((option) => `<option value='${option}'>${option}</option>`).join('');

    rootElement.innerHTML = `
      <div class='border shadow rounded max-w-md w-full p-4 grid gap-5'>
        <h1 class='text-center font-bold text-2xl md:text-4xl'>Alarm Clock</h1>
        <div class='grid place-items-center gap-3' ${renderDataAttributes(rootSelector)}>
          <div class='w-[80px] mx-auto' ${renderDataAttributes(icon)}>${iconElement}</div>
          <p class='font-bold text-2xl text-center md:text-5xl' ${renderDataAttributes(clock)}>00:00:00 PM</p>
          <div class='grid gap-3 w-full sm:grid-cols-3'>
            <select class='border-2 px-4 py-2.5 rounded block w-full cursor-pointer' ${renderDataAttributes(hour)}>
              <option value='Hour'>Hour</option>
              ${generateOptions(generateFormattedTime(12))}
            </select>
            <select class='border-2 px-4 py-2.5 rounded block w-full cursor-pointer' ${renderDataAttributes(minute)}>
              <option value='Minute'>Minute</option>
              ${generateOptions(generateFormattedTime(60))}
            </select>
            <select class='border-2 px-4 py-2.5 rounded block w-full cursor-pointer' ${renderDataAttributes(period)}>
              <option value='AM/PM'>AM/PM</option>
              ${generateOptions(alarmTime)}
            </select>
          </div>
          <button class='border shadow px-4 py-2.5 w-full hover:bg-gray-100' ${renderDataAttributes(set)}>Set Alarm</button>
        </div>
      </div>`;
  }

  /**
   * Инициализирует DOM элементы
   */
  initDOMElements() {
    this.state.elements = {
      hour: document.querySelector(this.config.selectors.hour),
      minute: document.querySelector(this.config.selectors.minute),
      period: document.querySelector(this.config.selectors.period),
      clock: document.querySelector(this.config.selectors.clock),
      set: document.querySelector(this.config.selectors.set),
      root: document.querySelector(this.config.selectors.root),
      icon: document.querySelector(this.config.selectors.icon),
    };
  }

  /**
   * Обработчик клика на кнопку установки/сброса будильника
   */
  handleSetAlarmClick = () => {
    return this.state.alarmState ? this.toggleAlarm(false) : this.setAlarm();
  };

  /**
   * Переключает состояние будильника
   * @param {boolean} state - Новое состояние будильника
   */
  toggleAlarm(state) {
    Object.assign(this.state, {
      alarmTimeString: state ? this.formatAlarmTime() : '',
      alarmState: state,
    });

    this.state.elements.root.classList.toggle('disabled', state);
    this.state.elements.set.innerText = state ? 'Clear Alarm' : 'Set Alarm';

    if (this.state.elements.icon) {
      this.state.elements.icon.classList.toggle('animate-bounce', !state);
    }

    if (!state) {
      this.state.audio.pause();
      [this.state.elements.hour, this.state.elements.minute, this.state.elements.period].forEach(
        (el) => (el.selectedIndex = 0),
      );
      this.state.elements.icon.classList.remove('animate-bounce');
    }
  }

  /**
   * Форматирует время будильника
   * @returns {string} Отформатированное время будильника
   */
  formatAlarmTime() {
    const { hour, minute, period } = {
      hour: Number(this.state.elements.hour.value),
      minute: Number(this.state.elements.minute.value),
      period: this.state.elements.period.value,
    };
    return `${this.utils.addLeadingZero(hour)}:${this.utils.addLeadingZero(minute)} ${period}`;
  }

  /**
   * Устанавливает будильник
   */
  setAlarm() {
    if (
      !(
        Number(this.state.elements.hour.value) &&
        Number(this.state.elements.minute.value) &&
        this.state.elements.period.value !== 'AM/PM'
      )
    ) {
      this.utils.showError('Please, select a valid time to set alarm!');
      return;
    }

    this.toggleAlarm(true);
  }

  /**
   * Форматирует время
   * @param {Date} date - Объект даты
   * @returns {string[]} Массив с отформатированными компонентами времени
   */
  formatTime(date) {
    let h = date.getHours();
    const m = date.getMinutes();
    const s = date.getSeconds();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return [h, m, s, ampm].map(this.utils.addLeadingZero);
  }

  /**
   * Проверяет, не пора ли включить будильник
   * @param {string} h - Часы
   * @param {string} m - Минуты
   * @param {string} ampm - Период (AM/PM)
   */
  checkAlarm(h, m, ampm) {
    if (this.state.alarmTimeString === `${h}:${m} ${ampm}`) {
      this.state.audio.play();
      this.state.audio.loop = true;
      if (this.state.elements.icon) {
        this.state.elements.icon.classList.add('animate-bounce');
      }
    }
  }

  /**
   * Обновляет время на экране
   * @returns {number} ID интервала
   */
  updateTime() {
    return setInterval(() => {
      const date = new Date();
      const [h, m, s, ampm] = this.formatTime(date);
      this.state.elements.clock.innerText = `${h}:${m}:${s} ${ampm}`;
      this.checkAlarm(h, m, ampm);
    }, 1000);
  }

  /**
   * Инициализирует будильник
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();
    this.state.elements.set.addEventListener('click', this.handleSetAlarmClick);
    this.updateTime();
  }
}

new AlarmClock();