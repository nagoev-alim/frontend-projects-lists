import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

/**
 * Countdown App
 * 
 * Это приложение представляет собой интерактивный обратный отсчет.
 * Пользователи могут ввести название события и дату, до которой нужно вести отсчет.
 * Приложение отображает оставшееся время в днях, часах, минутах и секундах.
 * Данные сохраняются в localStorage для persistance между сессиями.
 */

/**
 * Конфигурация приложения
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента приложения
 * @property {Object} selectors - Объект с селекторами для различных элементов DOM
 */
const APP_CONFIG = {
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

/**
 * Состояние приложения
 * @typedef {Object} AppState
 * @property {Object} elements - Объект с ссылками на элементы DOM
 * @property {string} today - Текущая дата в формате YYYY-MM-DD
 * @property {number} countdownValue - Значение времени для обратного отсчета в миллисекундах
 * @property {number} interval - ID интервала для обновления таймера
 * @property {string} countdownName - Название события обратного отсчета
 * @property {string} countdownDate - Дата окончания обратного отсчета
 */
const APP_STATE = {
  elements: {},
  today: new Date().toISOString().split('T')[0],
  countdownValue: null,
  interval: null,
  countdownName: null,
  countdownDate: null,
};

/**
 * Утилиты приложения
 * @typedef {Object} AppUtils
 * @property {Function} addLeadingZero - Добавляет ведущий ноль к числу, если оно меньше 10
 * @property {Function} capitalizeFirstLetter - Делает первую букву строки заглавной
 * @property {Function} renderDataAttributes - Удаляет квадратные скобки из строки с data-атрибутом
 * @property {Object} toastConfig - Конфигурация для Toastify
 * @property {Function} showToast - Отображает уведомление с помощью Toastify
 */
const APP_UTILS = {
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
      ...APP_UTILS.toastConfig,
    }).showToast();
  },
};

/**
 * Создает HTML-разметку приложения
 */
function createAppHTML() {
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
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
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
              <p class='font-bold'>${APP_UTILS.capitalizeFirstLetter(i)}</p>
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
 * Инициализирует элементы DOM в APP_STATE
 */
function initDOMElements() {
  APP_STATE.elements = Object.entries(APP_CONFIG.selectors).reduce((acc, [key, selector]) => {
    acc[key] = document.querySelector(selector);
    return acc;
  }, {});
}

/**
 * Инициализирует приложение
 */
function initApp() {
  createAppHTML();
  initDOMElements();
  displayLocalStorageData();
  APP_STATE.elements.date.setAttribute('min', APP_STATE.today);
  APP_STATE.elements.form.addEventListener('submit', handleFormSubmit);
  [APP_STATE.elements.reset, APP_STATE.elements.finishBtn].forEach((btn) =>
    btn.addEventListener('click', handleResetClick),
  );
}

/**
 * Отображает данные из локального хранилища
 */
function displayLocalStorageData() {
  const { name, date } = JSON.parse(localStorage.getItem('countdown')) || {};
  if (name && date) {
    setCountdownDetails(name, date);
    updateCountdownUI();
    updateCountdown();
  }
}

/**
 * Обновляет таймер обратного отсчета
 */
function updateCountdown() {
  const updateTimer = () => {
    const now = Date.now();
    const diff = APP_STATE.countdownValue - now;

    if (diff < 0) {
      clearInterval(APP_STATE.interval);
      finishCountdown();
    } else {
      updateCountdownDisplay(diff);
    }
  };

  updateCountdownUI();
  updateTimer();
  APP_STATE.interval = setInterval(updateTimer, 1000);
}

/**
 * Завершает обратный отсчет
 */
function finishCountdown() {
  clearInterval(APP_STATE.interval);
  
  const { elements } = APP_STATE;
  elements.display.classList.add('hidden');
  elements.finish.classList.remove('hidden');
  elements.title.textContent = 'Countdown Complete 🎊';
  elements.finishText.textContent = `${APP_STATE.countdownName} finished on ${APP_STATE.countdownDate}`;
  elements.form.reset();
}

/**
 * Обновляет отображение времени обратного отсчета
 * @param {number} diff - Разница в миллисекундах
 */
function updateCountdownDisplay(diff) {
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
    APP_STATE.elements[unit].textContent = APP_UTILS.addLeadingZero(value);
  });
}

/**
 * Обрабатывает отправку формы
 * @param {Event} event - Событие отправки формы
 */
function handleFormSubmit(event) {
  event.preventDefault();
  const { name, target } = Object.fromEntries(new FormData(event.target));

  if (!name || !target) {
    APP_UTILS.showToast('Please fill the fields');
    return;
  }

  setCountdownDetails(name, target);
  localStorage.setItem('countdown', JSON.stringify({ name: APP_STATE.countdownName, date: APP_STATE.countdownDate }));
  updateCountdown();
}

/**
 * Устанавливает детали обратного отсчета
 * @param {string} name - Название обратного отсчета
 * @param {string} date - Дата окончания обратного отсчета
 */
function setCountdownDetails(name, date) {
  APP_STATE.countdownName = name;
  APP_STATE.countdownDate = date;
  APP_STATE.countdownValue = new Date(APP_STATE.countdownDate).getTime();
}

/**
 * Обновляет пользовательский интерфейс обратного отсчета
 */
function updateCountdownUI() {
  APP_STATE.elements.title.innerHTML = APP_STATE.countdownName;
  APP_STATE.elements.display.classList.remove('hidden');
  APP_STATE.elements.config.classList.add('hidden');
}

/**
 * Обрабатывает нажатие кнопки сброса
 */
function handleResetClick() {
  clearInterval(APP_STATE.interval);
  resetUI();
  localStorage.clear();
}

/**
 * Сбрасывает пользовательский интерфейс
 */
function resetUI() {
  const { elements } = APP_STATE;
  const { display, finish, config, title, form } = elements;

  [display, finish].forEach(el => el.classList.add('hidden'));
  config.classList.remove('hidden');
  title.textContent = 'Countdown';
  form.reset();
}

initApp();
