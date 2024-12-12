/**
 * Этот код представляет собой реализацию будильника с веб-интерфейсом.
 * Он позволяет пользователю установить время будильника, отображает текущее время
 * и воспроизводит звук, когда наступает установленное время будильника.
 */

import './style.css';
import sound from '/sound.mp3';
import { icons } from 'feather-icons';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

/**
 * Объект с конфигурацией приложения
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента
 * @property {Object} selectors - Объект с селекторами элементов
 * @property {string} icon - SVG иконка будильника
 * @property {string[]} alarmTime - Массив с возможными периодами дня (AM/PM)
 */
const APP_CONFIG = {
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
 * Объект с состоянием приложения
 * @typedef {Object} AppState
 * @property {HTMLAudioElement} audio - Аудио элемент для воспроизведения звука будильника
 * @property {boolean} alarmState - Состояние будильника (включен/выключен)
 * @property {string} alarmTimeString - Строка с установленным временем будильника
 * @property {Object} elements - Объект с DOM элементами
 */
const APP_STATE = {
  audio: new Audio(sound),
  alarmState: false,
  alarmTimeString: '',
  elements: {},
};

/**
 * Объект с утилитарными функциями
 * @typedef {Object} AppUtils
 * @property {Function} addLeadingZero - Добавляет ведущий ноль к числу
 * @property {Function} renderDataAttributes - Преобразует строку для использования в data-атрибутах
 * @property {Function} generateFormattedTime - Генерирует массив отформатированных чисел
 * @property {Function} showError - Показывает сообщение об ошибке
 */
const APP_UTILS = {
  /**
   * Добавляет ведущий ноль к числу
   * @param {number} num - Число для форматирования
   * @returns {string} Отформатированное число
   */
  addLeadingZero: (num) => num.toString().padStart(2, '0'),

  /**
   * Преобразует строку для использования в data-атрибутах
   * @param {string} element - Строка для преобразования
   * @returns {string} Преобразованная строка
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
      className:
        'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
      duration: 3000,
      gravity: 'bottom',
      position: 'center',
    }).showToast();
  },
};

/**
 * Создает HTML разметку приложения
 */
function createAppHTML() {
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
function initDOMElements() {
  APP_STATE.elements = {
    hour: document.querySelector(APP_CONFIG.selectors.hour),
    minute: document.querySelector(APP_CONFIG.selectors.minute),
    period: document.querySelector(APP_CONFIG.selectors.period),
    clock: document.querySelector(APP_CONFIG.selectors.clock),
    set: document.querySelector(APP_CONFIG.selectors.set),
    root: document.querySelector(APP_CONFIG.selectors.root),
    icon: document.querySelector(APP_CONFIG.selectors.icon),
  };
}

/**
 * Инициализирует приложение
 */
function initApp() {
  createAppHTML();
  initDOMElements();
  APP_STATE.elements.set.addEventListener('click', handleSetAlarmClick);
  updateTime();
}

/**
 * Обработчик нажатия на кнопку установки/сброса будильника
 */
function handleSetAlarmClick() {
  return APP_STATE.alarmState ? toggleAlarm(false) : setAlarm();
}

/**
 * Переключает состояние будильника
 * @param {boolean} state - Новое состояние будильника
 */
function toggleAlarm(state) {
  Object.assign(APP_STATE, {
    alarmTimeString: state ? formatAlarmTime() : '',
    alarmState: state,
  });

  APP_STATE.elements.root.classList.toggle('disabled', state);
  APP_STATE.elements.set.innerText = state ? 'Clear Alarm' : 'Set Alarm';

  if (APP_STATE.elements.icon) {
    APP_STATE.elements.icon.classList.toggle('animate-bounce', !state);
  }

  if (!state) {
    APP_STATE.audio.pause();
    [APP_STATE.elements.hour, APP_STATE.elements.minute, APP_STATE.elements.period].forEach(
      (el) => (el.selectedIndex = 0),
    );
    APP_STATE.elements.icon.classList.remove('animate-bounce');
  }
}

/**
 * Форматирует время будильника
 * @returns {string} Отформатированное время будильника
 */
function formatAlarmTime() {
  const { hour, minute, period } = {
    hour: Number(APP_STATE.elements.hour.value),
    minute: Number(APP_STATE.elements.minute.value),
    period: APP_STATE.elements.period.value,
  };
  return `${APP_UTILS.addLeadingZero(hour)}:${APP_UTILS.addLeadingZero(minute)} ${period}`;
}

/**
 * Устанавливает будильник
 */
function setAlarm() {
  if (
    !(
      Number(APP_STATE.elements.hour.value) &&
      Number(APP_STATE.elements.minute.value) &&
      APP_STATE.elements.period.value !== 'AM/PM'
    )
  ) {
    APP_UTILS.showError('Please, select a valid time to set alarm!');
    return;
  }

  toggleAlarm(true);
}

/**
 * Форматирует время
 * @param {Date} date - Объект даты
 * @returns {string[]} Массив с отформатированными значениями времени
 */
function formatTime(date) {
  let h = date.getHours();
  const m = date.getMinutes();
  const s = date.getSeconds();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return [h, m, s, ampm].map(APP_UTILS.addLeadingZero);
}

/**
 * Проверяет, наступило ли время будильника
 * @param {string} h - Часы
 * @param {string} m - Минуты
 * @param {string} ampm - Период дня (AM/PM)
 */
function checkAlarm(h, m, ampm) {
  if (APP_STATE.alarmTimeString === `${h}:${m} ${ampm}`) {
    APP_STATE.audio.play();
    APP_STATE.audio.loop = true;
    if (APP_STATE.elements.icon) {
      APP_STATE.elements.icon.classList.add('animate-bounce');
    }
  }
}

/**
 * Обновляет время на часах
 * @returns {number} ID интервала
 */
function updateTime() {
  return setInterval(() => {
    const date = new Date();
    const [h, m, s, ampm] = formatTime(date);
    APP_STATE.elements.clock.innerText = `${h}:${m}:${s} ${ampm}`;
    checkAlarm(h, m, ampm);
  }, 1000);
}

initApp();