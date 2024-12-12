/**
 * Приложение для создания обратного отсчета.
 * Позволяет пользователю задать название и дату события, после чего
 * отображает оставшееся время до этого события. Использует локальное
 * хранилище для сохранения данных между сессиями.
 */

import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

/**
 * Конфигурация приложения.
 */
interface AppConfig {
  /** Корневой элемент приложения */
  root: string;
  /** Селекторы для элементов DOM */
  selectors: {
    [key: string]: string;
  };
}

/**
 * Состояние приложения.
 */
interface AppState {
  /** Элементы DOM */
  elements: {
    [key: string]: HTMLElement;
  };
  /** Текущая дата */
  today: string;
  /** Значение обратного отсчета в миллисекундах */
  countdownValue: number | null;
  /** Интервал обновления отсчета */
  interval: any;
  /** Название события */
  countdownName: string | null;
  /** Дата события */
  countdownDate: string | null;
}

/**
 * Утилиты приложения.
 */
interface AppUtils {
  /** Добавляет ведущий ноль к числу */
  addLeadingZero: (num: number) => string;
  /** Делает первую букву строки заглавной */
  capitalizeFirstLetter: (str: string) => string;
  /** Рендерит data-атрибуты */
  renderDataAttributes: (element: string) => string;
  /** Конфигурация для toast-уведомлений */
  toastConfig: {
    className: string;
    duration?: number;
    gravity?: 'top' | 'bottom';
    position?: 'left' | 'center' | 'right';
  };
  /** Показывает toast-уведомление */
  showToast: (message: string) => void;
}


class Countdown {
  private readonly config: AppConfig;
  private readonly state: AppState;
  private readonly utils: AppUtils;

  /**
   * Создает экземпляр приложения Countdown.
   * Инициализирует конфигурацию, состояние и утилиты.
   */
  constructor() {
    this.config = {
      root: '#app',
      selectors: {
        title: '[data-countdown-title]',
        config: '[data-countdown-config]',
        form: '[data-countdown-form]',
        date: '[data-countdown-date]',
        display: '[data-countdown-display]',
        days: '[data-countdown-days]',
        hours: '[data-countdown-hours]',
        minutes: '[data-countdown-minutes]',
        seconds: '[data-countdown-seconds]',
        reset: '[data-countdown-reset]',
        finish: '[data-countdown-finish]',
        finishText: '[data-countdown-finish-text]',
        finishBtn: '[data-countdown-finish-btn]',
      },
    };

    this.state = {
      elements: {
        title: document.createElement('div'),
        config: document.createElement('div'),
        form: document.createElement('div'),
        date: document.createElement('div'),
        display: document.createElement('div'),
        days: document.createElement('div'),
        hours: document.createElement('div'),
        minutes: document.createElement('div'),
        seconds: document.createElement('div'),
        reset: document.createElement('div'),
        finish: document.createElement('div'),
        finishText: document.createElement('div'),
        finishBtn: document.createElement('div'),
      },
      today: new Date().toISOString().split('T')[0],
      countdownValue: null,
      interval: null,
      countdownName: null,
      countdownDate: null,
    };

    this.utils = {
      addLeadingZero: (num) => num.toString().padStart(2, '0'),
      capitalizeFirstLetter: (str) => str.charAt(0).toUpperCase() + str.slice(1),
      renderDataAttributes: (element) => element.slice(1, -1),
      toastConfig: {
        className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
        duration: 3000,
        gravity: 'bottom',
        position: 'center',
      },
      showToast: (message) => {
        Toastify({
          text: message,
          ...this.utils.toastConfig,
        }).showToast();
      },
    };

    this.init();
  }

  /**
   * Инициализирует приложение.
   * Создает HTML, инициализирует DOM элементы, загружает данные из localStorage,
   * устанавливает минимальную дату и добавляет обработчики событий.
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();
    this.displayLocalStorageData();
    this.state.elements.date.setAttribute('min', this.state.today);
    this.state.elements.form.addEventListener('submit', this.handleFormSubmit.bind(this));
    [this.state.elements.reset, this.state.elements.finishBtn].forEach((btn) => btn.addEventListener('click', this.handleResetClick.bind(this)));
  }

  /**
   * Создает HTML-разметку приложения.
   * Использует конфигурацию и утилиты для генерации структуры приложения.
   */
  createAppHTML() {
    const {
      root,
      selectors: {
        title,
        config,
        form,
        date,
        display,
        reset,
        finish,
        finishText,
        finishBtn,
      },
    } = this.config;
    const { renderDataAttributes } = this.utils;
    const rootElement = document.querySelector(root);

    if (!rootElement) return;

    rootElement.innerHTML = `
    <div class='max-w-md w-full rounded border bg-white p-3 shadow grid gap-4'>
      <h1 class='text-center text-2xl font-bold md:text-4xl' ${renderDataAttributes(title)}>Countdown</h1>
      <div ${renderDataAttributes(config)}>
        <form class='grid gap-3' ${renderDataAttributes(form)}>
          <label class='grid gap-1'>
            <span class='text-sm font-medium'>Name</span>
            <input
              class='w-full rounded border bg-slate-50 px-3 py-2 focus:border-blue-400 focus:outline-none'
              type='text'
              name='name'
              placeholder='What are you counting down to?'
            >
          </label>
          <label class='grid gap-1'>
            <span class='text-sm font-medium'>Date</span>
            <input
              class='w-full rounded border bg-slate-50 px-3 py-2 focus:border-blue-400 focus:outline-none'
              type='date'
              name='target'
              ${renderDataAttributes(date)}
            >
          </label>
          <button class='border px-3 py-2 hover:bg-slate-50' type='submit'>Submit</button>
        </form>
      </div>
      <div class='hidden grid gap-3' ${renderDataAttributes(display)}>
        <ul class='grid grid-cols-4 gap-2'>
          ${['days', 'hours', 'minutes', 'seconds'].map(
      (i) => `
            <li class='grid gap-1 place-items-center'>
              <p class='text-5xl font-bold' data-countdown-${i}>00</p>
              <p class='font-bold'>${this.utils.capitalizeFirstLetter(i)}</p>
            </li>
          `,
    )
      .join('')}
        </ul>
        <button class='border px-3 py-2 hover:bg-slate-50' ${renderDataAttributes(reset)}>Reset</button>
      </div>
      <div class='hidden grid gap-3' ${renderDataAttributes(finish)}>
        <p class='text-center' ${renderDataAttributes(finishText)}></p>
        <button class='border px-3 py-2 hover:bg-slate-50' ${renderDataAttributes(finishBtn)}>New Countdown</button>
      </div>
    </div>
  `;
  }

  /**
   * Инициализирует элементы DOM в this.state.elements.
   * Использует селекторы из конфигурации для поиска элементов на странице.
   */
  initDOMElements() {
    this.state.elements = Object.entries(this.config.selectors).reduce<Record<string, HTMLElement>>((acc, [key, selector]) => {
      const element = document.querySelector(selector);
      if (element instanceof HTMLElement) {
        acc[key] = element;
      }
      return acc;
    }, {});
  }


  /**
   * Отображает данные из localStorage, если они существуют.
   * Устанавливает детали обратного отсчета и обновляет UI, если найдены сохраненные данные.
   */
  displayLocalStorageData(): void {
    const { name, date } = JSON.parse(localStorage.getItem('countdown') ?? '{}');
    if (name && date) {
      this.setCountdownDetails(name, date);
      this.updateCountdownUI();
      this.updateCountdown();
    }
  }

  /**
   * Обновляет обратный отсчет.
   * Создает интервал для регулярного обновления таймера и проверки завершения отсчета.
   */
  updateCountdown(): void {
    const updateTimer = () => {
      const now = Date.now();
      if (!this.state.countdownValue) return;
      const diff = this.state.countdownValue - now;

      if (diff < 0) {
        clearInterval(this.state.interval);
        this.finishCountdown();
      } else {
        this.updateCountdownDisplay(diff);
      }
    };

    this.updateCountdownUI();
    updateTimer();
    this.state.interval = setInterval(updateTimer, 1000);
  }

  /**
   * Завершает обратный отсчет.
   * Очищает интервал, обновляет UI для отображения завершения отсчета.
   */
  finishCountdown(): void {
    clearInterval(this.state.interval);

    const { elements } = this.state;
    elements.display.classList.add('hidden');
    elements.finish.classList.remove('hidden');
    elements.title.textContent = 'Countdown Complete ';
    elements.finishText.textContent = `${this.state.countdownName} finished on ${this.state.countdownDate}`;
    if (elements.form instanceof HTMLFormElement) elements.form.reset();
  }

  /**
   * Обновляет отображение обратного отсчета.
   * @param {number} diff - Разница в миллисекундах между текущим временем и целевой датой.
   */
  updateCountdownDisplay(diff: number): void {
    const MS_PER_SECOND = 1000;
    const MS_PER_MINUTE = MS_PER_SECOND * 60;
    const MS_PER_HOUR = MS_PER_MINUTE * 60;
    const MS_PER_DAY = MS_PER_HOUR * 24;

    const timeUnits = {
      days: Math.floor(diff / MS_PER_DAY),
      hours: Math.floor((diff % MS_PER_DAY) / MS_PER_HOUR),
      minutes: Math.floor((diff % MS_PER_HOUR) / MS_PER_MINUTE),
      seconds: Math.floor((diff % MS_PER_MINUTE) / MS_PER_SECOND),
    };

    Object.entries(timeUnits).forEach(([unit, value]) => {
      this.state.elements[unit].textContent = this.utils.addLeadingZero(value);
    });
  }

  /**
   * Обрабатывает отправку формы.
   * @param {Event} event - Событие отправки формы.
   */
  handleFormSubmit(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const name = formData.get('name') as string;
    const target = formData.get('target') as string;

    if (!name || !target) {
      this.utils.showToast('Please fill the fields');
      return;
    }

    this.setCountdownDetails(name, target);
    localStorage.setItem('countdown', JSON.stringify({ name: this.state.countdownName, date: this.state.countdownDate }));
    this.updateCountdown();
  }

  /**
   * Устанавливает детали обратного отсчета.
   * @param {string} name - Название события.
   * @param {string} date - Дата события.
   */
  setCountdownDetails(name: string, date: string): void {
    this.state.countdownName = name;
    this.state.countdownDate = date;
    this.state.countdownValue = new Date(this.state.countdownDate).getTime();
  }

  /**
   * Обновляет UI обратного отсчета.
   */
  updateCountdownUI(): void {
    if (typeof this.state.countdownName === 'string') {
      this.state.elements.title.innerHTML = this.state.countdownName;
    }
    this.state.elements.display.classList.remove('hidden');
    this.state.elements.config.classList.add('hidden');
  }

  /**
   * Обрабатывает клик по кнопке сброса.
   */
  handleResetClick(): void {
    clearInterval(this.state.interval);
    this.resetUI();
    localStorage.clear();
  }

  /**
   * Сбрасывает UI приложения в исходное состояние.
   */
  resetUI(): void {
    const { elements } = this.state;
    const { display, finish, config, title, form } = elements;

    [display, finish].forEach(el => el.classList.add('hidden'));
    config.classList.remove('hidden');
    title.textContent = 'Countdown';
    if (form instanceof HTMLFormElement) form.reset();
  }
}

new Countdown();
