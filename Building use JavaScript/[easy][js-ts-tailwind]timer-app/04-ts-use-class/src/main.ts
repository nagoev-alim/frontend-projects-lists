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
 * Интерфейс для конфигурации таймера
 */
interface Config {
  /** Селектор корневого элемента */
  root: string;
  /** Объект с селекторами для различных элементов DOM */
  selectors: {
    minutes: string;
    seconds: string;
    controlButton: string;
    resetButton: string;
    form: string;
    hiddenElement: string;
  };
  /** Объект с иконками для кнопок управления */
  icons: {
    play: string;
    pause: string;
  };
  /** Класс для скрытия элементов */
  hiddenClassname: string;
  /** Максимальное количество минут */
  maxMinutes: number;
  /** Количество секунд в минуте */
  secondsInMinute: number;
}

/**
 * Интерфейс для состояния таймера
 */
interface State {
  /** Оставшееся количество секунд */
  secondsRemaining: number;
  /** Идентификатор интервала */
  interval: number | null;
  /** Объект с элементами DOM */
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
 * Интерфейс для вспомогательных функций
 */
interface Utils {
  /** Функция для добавления ведущего нуля к числу */
  addLeadingZero: (num: number) => string;
  /** Функция для рендеринга атрибутов данных */
  renderDataAttributes: (element: string) => string;
  /** Функция для отображения ошибки */
  showError: (message: string) => void;
}

/**
 * Класс, представляющий таймер
 */
class Timer {
  /** Конфигурация таймера */
  private config: Config;
  /** Состояние таймера */
  private state: State;
  /** Вспомогательные функции */
  private utils: Utils;

  /**
   * Создает экземпляр таймера
   */
  constructor() {
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

    this.state = {
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

    this.utils = {
      addLeadingZero: (num: number): string => num.toString().padStart(2, '0'),
      renderDataAttributes: (element: string): string => element.slice(1, -1),
      showError: (message: string): void => {
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
   * Создает HTML-разметку приложения
   */
  private createAppHTML(): void {
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
   * Инициализирует элементы DOM
   */
  private initDOMElements(): void {
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
   * @param element - Элемент DOM
   * @param isVisible - Флаг видимости
   */
  private toggleVisibility(element: HTMLElement, isVisible: boolean): void {
    element.dataset.visible = isVisible.toString();
    element.classList.toggle(this.config.hiddenClassname, !isVisible);
  }

  /**
   * Обработчик отправки формы
   * @param event - Событие отправки формы
   */
  private handleFormSubmit = (event: Event): void => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const time = Number(formData.get('time')?.toString().trim());
    if (time > 0 && time < this.config.maxMinutes) {
      this.timerStop();
      this.state.secondsRemaining = time * this.config.secondsInMinute;
      this.timerUpdate();
      this.state.elements.hiddenElement?.classList.add('grid');
      if (this.state.elements.hiddenElement) {
        this.toggleVisibility(this.state.elements.hiddenElement, true);
      }
      if (this.state.elements.form) {
        this.toggleVisibility(this.state.elements.form, false);
        this.state.elements.form.reset();
      }
    } else {
      this.utils.showError('Please enter a number from 1 to 59');
    }
  };

  /**
   * Обработчик нажатия на кнопку управления
   */
  private handleControlButton = (): void => {
    this.state.interval === null ? this.timerStart() : this.timerStop();
  };

  /**
   * Обработчик нажатия на кнопку сброса
   */
  private handleResetButton = (): void => {
    this.timerStop();
    this.state.secondsRemaining = 0;
    this.timerUpdate();
    if (this.state.elements.hiddenElement) {
      this.toggleVisibility(this.state.elements.hiddenElement, false);
    }
    if (this.state.elements.form) {
      this.toggleVisibility(this.state.elements.form, true);
    }
  };

  /**
   * Останавливает таймер
   */
  private timerStop(): void {
    if (!this.state.interval) return;
    clearInterval(this.state.interval);
    this.state.interval = null;
    this.updateControl();
  }

  /**
   * Запускает таймер
   */
  private timerStart(): void {
    if (this.state.secondsRemaining === 0) return;
    this.state.interval = window.setInterval(() => {
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
  private timerUpdate(): void {
    if (this.state.elements.minutes) {
      this.state.elements.minutes.textContent = this.utils.addLeadingZero(Math.floor(this.state.secondsRemaining / this.config.secondsInMinute));
    }
    if (this.state.elements.seconds) {
      this.state.elements.seconds.textContent = this.utils.addLeadingZero((this.state.secondsRemaining % this.config.secondsInMinute));
    }
  }

  /**
   * Обновляет кнопку управления
   */
  private updateControl(): void {
    if (this.state.elements.controlButton) {
      this.state.elements.controlButton.innerHTML = `${this.state.interval === null ? this.config.icons.play : this.config.icons.pause}`;
    }
  }

  /**
   * Инициализирует таймер
   */
  private init(): void {
    this.createAppHTML();
    this.initDOMElements();
    this.state.elements.form?.addEventListener('submit', this.handleFormSubmit);
    this.state.elements.controlButton?.addEventListener('click', this.handleControlButton);
    this.state.elements.resetButton?.addEventListener('click', this.handleResetButton);
  }
}

new Timer();