/**
 * Этот код реализует функциональность будильника с графическим интерфейсом.
 * Он позволяет пользователю устанавливать время будильника, отображает текущее время
 * и воспроизводит звук при срабатывании будильника.
 */

import './style.css';
import sound from '/sound.mp3';
import { icons } from 'feather-icons';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

/**
 * Интерфейс для конфигурации будильника
 */
interface Config {
  /** Корневой элемент для вставки HTML */
  root: string;
  /** Селекторы для различных элементов интерфейса */
  selectors: {
    [key: string]: string;
  };
  /** SVG иконка будильника */
  icon: string;
  /** Варианты времени суток (AM/PM) */
  alarmTime: string[];
}

/**
 * Интерфейс для хранения состояния будильника
 */
interface State {
  /** Аудио элемент для воспроизведения звука будильника */
  audio: HTMLAudioElement;
  /** Состояние будильника (включен/выключен) */
  alarmState: boolean;
  /** Строка с установленным временем будильника */
  alarmTimeString: string;
  /** Объект с ссылками на DOM элементы */
  elements: {
    [key: string]: HTMLElement | null;
  };
}

/**
 * Интерфейс для вспомогательных функций
 */
interface Utils {
  /** Добавляет ведущий ноль к числу */
  addLeadingZero: (num: number) => string;
  /** Форматирует строку для data-атрибутов */
  renderDataAttributes: (element: string) => string;
  /** Генерирует форматированный массив времени */
  generateFormattedTime: (num: number) => string[];
  /** Отображает сообщение об ошибке */
  showError: (message: string) => void;
}

/**
 * Класс, реализующий функциональность будильника
 */
class AlarmClock {
  private config: Config;
  private state: State;
  private utils: Utils;

  /**
   * Конструктор класса AlarmClock
   * Инициализирует конфигурацию, состояние и вспомогательные функции
   */
  constructor() {
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

    this.state = {
      audio: new Audio(sound),
      alarmState: false,
      alarmTimeString: '',
      elements: {},
    };

    this.utils = {
      addLeadingZero: (num: number): string => num.toString().padStart(2, '0'),
      renderDataAttributes: (element: string): string => element.slice(1, -1),
      generateFormattedTime: (num: number): string[] =>
        Array.from({ length: num }, (_, i) => (i + 1).toString().padStart(2, '0')),
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
   * Создает HTML разметку для будильника
   */
  private createAppHTML(): void {
    const {
      root,
      icon: iconElement,
      alarmTime,
      selectors: { hour, minute, period, clock, set, root: rootSelector, icon },
    } = this.config;
    const { renderDataAttributes, generateFormattedTime } = this.utils;
    const rootElement = document.querySelector(root);

    if (!rootElement) return;

    const generateOptions = (value: string[]): string => value.map((option) => `<option value='${option}'>${option}</option>`).join('');

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
   * Инициализирует DOM элементы и сохраняет их в состоянии
   */
  private initDOMElements(): void {
    this.state.elements = {
      hour: document.querySelector<HTMLSelectElement>(this.config.selectors.hour),
      minute: document.querySelector<HTMLSelectElement>(this.config.selectors.minute),
      period: document.querySelector<HTMLSelectElement>(this.config.selectors.period),
      clock: document.querySelector<HTMLParagraphElement>(this.config.selectors.clock),
      set: document.querySelector<HTMLButtonElement>(this.config.selectors.set),
      root: document.querySelector<HTMLDivElement>(this.config.selectors.root),
      icon: document.querySelector<HTMLDivElement>(this.config.selectors.icon),
    };
  }

  /**
   * Обработчик клика по кнопке установки/сброса будильника
   */
  private handleSetAlarmClick = (): void => {
    this.state.alarmState ? this.toggleAlarm(false) : this.setAlarm();
  };

  /**
   * Переключает состояние будильника
   * @param state - новое состояние будильника
   */
  private toggleAlarm(state: boolean): void {
    Object.assign(this.state, {
      alarmTimeString: state ? this.formatAlarmTime() : '',
      alarmState: state,
    });

    if (this.state.elements.root) {
      this.state.elements.root.classList.toggle('disabled', state);
    }
    if (this.state.elements.set) {
      this.state.elements.set.innerText = state ? 'Clear Alarm' : 'Set Alarm';
    }

    if (this.state.elements.icon) {
      this.state.elements.icon.classList.toggle('animate-bounce', !state);
    }

    if (!state) {
      this.state.audio.pause();
      [this.state.elements.hour, this.state.elements.minute, this.state.elements.period].forEach(
        (el) => {
          if (el instanceof HTMLSelectElement) {
            el.selectedIndex = 0;
          }
        }
      );
      if (this.state.elements.icon) {
        this.state.elements.icon.classList.remove('animate-bounce');
      }
    }
  }

  /**
   * Форматирует время будильника в строку
   * @returns отформатированная строка времени будильника
   */
  private formatAlarmTime(): string {
    const hour = this.state.elements.hour instanceof HTMLSelectElement ? Number(this.state.elements.hour.value) : 0;
    const minute = this.state.elements.minute instanceof HTMLSelectElement ? Number(this.state.elements.minute.value) : 0;
    const period = this.state.elements.period instanceof HTMLSelectElement ? this.state.elements.period.value : '';

    return `${this.utils.addLeadingZero(hour)}:${this.utils.addLeadingZero(minute)} ${period}`;
  }

  /**
   * Устанавливает будильник
   */
  private setAlarm(): void {
    if (
      !(
        this.state.elements.hour instanceof HTMLSelectElement && Number(this.state.elements.hour.value) &&
        this.state.elements.minute instanceof HTMLSelectElement && Number(this.state.elements.minute.value) &&
        this.state.elements.period instanceof HTMLSelectElement && this.state.elements.period.value !== 'AM/PM'
      )
    ) {
      this.utils.showError('Please, select a valid time to set alarm!');
      return;
    }

    this.toggleAlarm(true);
  }

  /**
   * Форматирует текущее время
   * @param date - объект Date для форматирования
   * @returns массив строк с отформатированным временем
   */
  private formatTime(date: Date): string[] {
    let h = date.getHours();
    const m = date.getMinutes();
    const s = date.getSeconds();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return [h, m, s].map(this.utils.addLeadingZero).concat(ampm);
  }

  /**
   * Проверяет, совпадает ли текущее время с установленным будильником
   * @param h - часы
   * @param m - минуты
   * @param ampm - AM/PM
   */
  private checkAlarm(h: string, m: string, ampm: string): void {
    if (this.state.alarmTimeString === `${h}:${m} ${ampm}`) {
      this.state.audio.play();
      this.state.audio.loop = true;
      if (this.state.elements.icon) {
        this.state.elements.icon.classList.add('animate-bounce');
      }
    }
  }

  /**
   * Обновляет отображение текущего времени
   * @returns идентификатор интервала
   */
  private updateTime(): number {
    return setInterval(() => {
      const date = new Date();
      const [h, m, s, ampm] = this.formatTime(date);
      if (this.state.elements.clock) {
        this.state.elements.clock.innerText = `${h}:${m}:${s} ${ampm}`;
      }
      this.checkAlarm(h, m, ampm);
    }, 1000);
  }

  /**
   * Инициализирует будильник
   */
  private init(): void {
    this.createAppHTML();
    this.initDOMElements();
    if (this.state.elements.set) {
      this.state.elements.set.addEventListener('click', this.handleSetAlarmClick);
    }
    this.updateTime();
  }
}

new AlarmClock();