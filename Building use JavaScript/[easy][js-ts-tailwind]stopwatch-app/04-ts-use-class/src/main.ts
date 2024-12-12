/**
 * Этот код реализует функциональность секундомера с возможностью запуска, паузы и сброса.
 * Он создает пользовательский интерфейс с отображением минут и секунд, а также кнопками управления.
 */

import './style.css';

/**
 * Интерфейс для конфигурации секундомера
 * @typedef {Object} Config
 * @property {string} root - Селектор корневого элемента
 * @property {Object} selectors - Объект с селекторами элементов
 * @property {string} selectors.minutes - Селектор для элемента минут
 * @property {string} selectors.seconds - Селектор для элемента секунд
 * @property {string} selectors.type - Селектор для кнопок управления
 * @property {string[]} types - Массив типов кнопок управления
 */
interface Config {
  root: string;
  selectors: {
    minutes: string;
    seconds: string;
    type: string;
  };
  types: string[];
}

/**
 * Интерфейс для состояния секундомера
 * @typedef {Object} State
 * @property {boolean} isRunning - Флаг, указывающий, запущен ли секундомер
 * @property {number|null} interval - Идентификатор интервала для обновления времени
 * @property {number} time - Текущее время в секундах
 * @property {Object} elements - Объект с ссылками на DOM элементы
 * @property {HTMLElement|null} elements.minutes - Элемент для отображения минут
 * @property {HTMLElement|null} elements.seconds - Элемент для отображения секунд
 * @property {HTMLElement[]} elements.type - Массив кнопок управления
 */
interface State {
  isRunning: boolean;
  interval: number | null;
  time: number;
  elements: {
    minutes: HTMLElement | null;
    seconds: HTMLElement | null;
    type: HTMLElement[];
  };
}

/**
 * Интерфейс для вспомогательных функций
 * @typedef {Object} Utils
 * @property {function(string): string} capitalizeFirstLetter - Функция для капитализации первой буквы строки
 * @property {function(number): string} addLeadingZero - Функция для добавления ведущего нуля к числу
 */
interface Utils {
  capitalizeFirstLetter: (str: string) => string;
  addLeadingZero: (num: number) => string;
}

/**
 * Класс Секундомер
 */
class Stopwatch {
  private config: Config;
  private state: State;
  private utils: Utils;

  /**
   * Создает экземпляр секундомера
   */
  constructor() {
    this.config = {
      root: '#app',
      selectors: {
        minutes: '[data-minutes]',
        seconds: '[data-seconds]',
        type: '[data-type]',
      },
      types: ['start', 'pause', 'reset'],
    };

    this.state = {
      isRunning: false,
      interval: null,
      time: 0,
      elements: {
        minutes: null,
        seconds: null,
        type: [],
      },
    };

    this.utils = {
      capitalizeFirstLetter: (str: string) => str.charAt(0).toUpperCase() + str.slice(1),
      addLeadingZero: (num: number) => num.toString().padStart(2, '0'),
    };

    this.createAppHTML();
    this.initDOMElements();
    this.addEventListeners();
  }

  /**
   * Создает HTML структуру приложения
   * @private
   */
  private createAppHTML(): void {
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
   * @private
   */
  private initDOMElements(): void {
    this.state.elements = {
      minutes: document.querySelector(this.config.selectors.minutes),
      seconds: document.querySelector(this.config.selectors.seconds),
      type: Array.from(document.querySelectorAll(this.config.selectors.type)),
    };
  }

  /**
   * Добавляет обработчики событий
   * @private
   */
  private addEventListeners(): void {
    this.state.elements.type.forEach((button) => button.addEventListener('click', this.handleOperationClick.bind(this)));
  }

  /**
   * Обновляет отображаемое время
   * @private
   */
  private updateTime(): void {
    this.state.time++;
    if (this.state.elements.minutes && this.state.elements.seconds) {
      this.state.elements.minutes.textContent = this.utils.addLeadingZero(Math.floor(this.state.time / 60));
      this.state.elements.seconds.textContent = this.utils.addLeadingZero(this.state.time % 60);
    }
  }

  /**
   * Запускает секундомер
   * @private
   */
  private startTimer(): void {
    if (this.state.isRunning) return;

    this.state.isRunning = true;
    this.state.interval = setInterval(this.updateTime.bind(this), 1000);
  }

  /**
   * Ставит секундомер на паузу
   * @private
   */
  private pauseTimer(): void {
    if (!this.state.isRunning) return;

    this.state.isRunning = false;
    if (this.state.interval) clearInterval(this.state.interval);
  }

  /**
   * Сбрасывает секундомер
   * @private
   */
  private resetTimer(): void {
    if (this.state.interval) clearInterval(this.state.interval);
    this.state.isRunning = false;
    this.state.time = 0;
    if (this.state.elements.minutes && this.state.elements.seconds) {
      this.state.elements.minutes.textContent = '00';
      this.state.elements.seconds.textContent = '00';
    }
  }

  /**
   * Обрабатывает клик по кнопкам управления
   * @param {Event} event - Событие клика
   * @private
   */
  private handleOperationClick(event: Event): void {
    const target = event.target as HTMLElement;
    const type = target.dataset.type;

    const action: { [key: string]: () => void } = {
      start: () => this.startTimer(),
      pause: () => this.pauseTimer(),
      reset: () => this.resetTimer(),
    };

    if (type && action[type]) {
      action[type]();
    }
  }
}

new Stopwatch();