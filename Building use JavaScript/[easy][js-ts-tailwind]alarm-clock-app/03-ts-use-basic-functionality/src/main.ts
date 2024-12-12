/**
 * Этот код реализует функционал будильника с веб-интерфейсом.
 * Он позволяет пользователю установить время будильника, отображает текущее время
 * и воспроизводит звук при наступлении установленного времени.
 */

import './style.css';
import sound from '/sound.mp3';
import { icons } from 'feather-icons';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

/**
 * Интерфейс для конфигурации приложения
 */
interface AppConfig {
  /** Селектор корневого элемента */
  root: string;
  /** Объект с селекторами элементов */
  selectors: {
    [key: string]: string;
  };
  /** SVG иконка будильника */
  icon: string;
  /** Массив значений для выбора AM/PM */
  alarmTime: string[];
}

/**
 * Интерфейс для состояния приложения
 */
interface AppState {
  /** Аудио элемент для воспроизведения звука будильника */
  audio: HTMLAudioElement;
  /** Состояние будильника (включен/выключен) */
  alarmState: boolean;
  /** Строка с установленным временем будильника */
  alarmTimeString: string;
  /** Объект с DOM элементами */
  elements: {
    [key: string]: HTMLElement | null;
  };
}

/**
 * Интерфейс для утилитарных функций приложения
 */
interface AppUtils {
  /** Функция для добавления ведущего нуля к числу */
  addLeadingZero: (num: number | string) => string;
  /** Функция для форматирования атрибутов данных */
  renderDataAttributes: (element: string) => string;
  /** Функция для генерации форматированного времени */
  generateFormattedTime: (num: number) => string[];
  /** Функция для отображения уведомлений */
  showToast: (message: string) => void;
}

/**
 * Объект конфигурации приложения
 */
const APP_CONFIG: AppConfig = {
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
 * Объект состояния приложения
 */
const APP_STATE: AppState = {
  audio: new Audio(sound),
  alarmState: false,
  alarmTimeString: '',
  elements: {},
};

/**
 * Объект с утилитарными функциями
 */
const APP_UTILS: AppUtils = {
  /**
   * Добавляет ведущий ноль к числу, если оно меньше 10
   * @param num - Число для форматирования
   * @returns Отформатированная строка
   */
  addLeadingZero: (num: number | string): string => num.toString().padStart(2, '0'),

  /**
   * Форматирует строку атрибута данных
   * @param element - Строка атрибута
   * @returns Отформатированная строка атрибута
   */
  renderDataAttributes: (element: string): string => element.slice(1, -1),

  /**
   * Генерирует массив форматированных строк времени
   * @param num - Количество элементов для генерации
   * @returns Массив форматированных строк времени
   */
  generateFormattedTime: (num: number): string[] =>
    Array.from({ length: num }, (_, i) => (i + 1).toString().padStart(2, '0')),

  /**
   * Отображает уведомление
   * @param message - Текст уведомления
   */
  showToast: (message: string): void => {
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
function createAppHTML(): void {
  const {
    root,
    icon: iconElement,
    alarmTime,
    selectors: {
      hour,
      minute,
      period,
      clock,
      set,
      root: rootSelector,
      icon,
    },
  } = APP_CONFIG;
  const { renderDataAttributes, generateFormattedTime } = APP_UTILS;
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
 * Инициализирует DOM элементы
 */
function initDOMElements(): void {
  APP_STATE.elements = {
    hour: document.querySelector<HTMLSelectElement>(APP_CONFIG.selectors.hour),
    minute: document.querySelector<HTMLSelectElement>(APP_CONFIG.selectors.minute),
    period: document.querySelector<HTMLSelectElement>(APP_CONFIG.selectors.period),
    clock: document.querySelector<HTMLParagraphElement>(APP_CONFIG.selectors.clock),
    set: document.querySelector<HTMLButtonElement>(APP_CONFIG.selectors.set),
    root: document.querySelector<HTMLDivElement>(APP_CONFIG.selectors.root),
    icon: document.querySelector<HTMLDivElement>(APP_CONFIG.selectors.icon),
  };
}

/**
 * Инициализирует приложение
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();
  APP_STATE.elements.set?.addEventListener('click', handleSetAlarmClick);
  updateTime();
}

/**
 * Обработчик клика по кнопке установки/сброса будильника
 */
function handleSetAlarmClick(): void {
  APP_STATE.alarmState ? toggleAlarm(false) : setAlarm();
}

/**
 * Переключает состояние будильника
 * @param state - Новое состояние будильника
 */
function toggleAlarm(state: boolean): void {
  Object.assign(APP_STATE, {
    alarmTimeString: state ? formatAlarmTime() : '',
    alarmState: state,
  });

  APP_STATE.elements.root?.classList.toggle('disabled', state);
  if (APP_STATE.elements.set) {
    APP_STATE.elements.set.innerText = state ? 'Clear Alarm' : 'Set Alarm';
  }

  APP_STATE.elements.icon?.classList.toggle('animate-bounce', !state);

  if (!state) {
    APP_STATE.audio.pause();
    [APP_STATE.elements.hour, APP_STATE.elements.minute, APP_STATE.elements.period].forEach(
      (el) => {
        if (el instanceof HTMLSelectElement) {
          el.selectedIndex = 0;
        }
      },
    );
    APP_STATE.elements.icon?.classList.remove('animate-bounce');
  }
}

/**
 * Форматирует время будильника
 * @returns Отформатированная строка времени будильника
 */
function formatAlarmTime(): string {
  const hour = Number(APP_STATE.elements.hour?.value);
  const minute = Number(APP_STATE.elements.minute?.value);
  const period = APP_STATE.elements.period?.value;
  return `${APP_UTILS.addLeadingZero(hour)}:${APP_UTILS.addLeadingZero(minute)} ${period}`;
}

/**
 * Устанавливает будильник
 */
function setAlarm(): void {
  if (
    !(
      Number(APP_STATE.elements.hour?.value) &&
      Number(APP_STATE.elements.minute?.value) &&
      APP_STATE.elements.period?.value !== 'AM/PM'
    )
  ) {
    APP_UTILS.showToast('Please, select a valid time to set alarm!');
    return;
  }

  toggleAlarm(true);
}

/**
 * Форматирует текущее время
 * @param date - Объект Date
 * @returns Массив отформатированных значений времени
 */
function formatTime(date: Date): string[] {
  let h = date.getHours();
  const m = date.getMinutes();
  const s = date.getSeconds();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return [h, m, s, ampm].map((n) => APP_UTILS.addLeadingZero(n));
}

/**
 * Проверяет, не наступило ли время будильника
 * @param h - Часы
 * @param m - Минуты
 * @param ampm - AM/PM
 */
function checkAlarm(h: string, m: string, ampm: string): void {
  if (APP_STATE.alarmTimeString === `${h}:${m} ${ampm}`) {
    APP_STATE.audio.play();
    APP_STATE.audio.loop = true;
    APP_STATE.elements.icon?.classList.add('animate-bounce');
  }
}

/**
 * Обновляет отображение времени
 * @returns Идентификатор интервала
 */
function updateTime(): number {
  return setInterval(() => {
    const date = new Date();
    const [h, m, s, ampm] = formatTime(date);
    if (APP_STATE.elements.clock) {
      APP_STATE.elements.clock.textContent = `${h}:${m}:${s} ${ampm}`;
    }
    checkAlarm(h, m, ampm);
  }, 1000);
}

// Инициализация приложения
initApp();