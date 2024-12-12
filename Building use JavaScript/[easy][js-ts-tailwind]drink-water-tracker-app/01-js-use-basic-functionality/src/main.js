/**
 * Этот код реализует приложение для отслеживания потребления воды.
 * Он позволяет пользователям устанавливать цель потребления воды,
 * отмечать выпитые стаканы и визуально отображает прогресс.
 * Приложение сохраняет данные в локальном хранилище для персистентности.
 */

import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

/**
 * Конфигурация приложения
 * @type {Object}
 */
const APP_CONFIG = {
  /** Корневой элемент приложения */
  root: '#app',
  /** Селекторы для различных элементов DOM */
  selectors: {
    form: '[data-water-form]',
    tracker: '[data-water-tracker]',
    goal: '[data-water-goal]',
    remained: '[data-water-remained]',
    liters: '[data-water-liters]',
    percentage: '[data-water-percentage]',
    cups: '[data-water-cups]',
    reset: '[data-water-reset]',
  },
  /** Доступные размеры стаканов в мл */
  sizes: [100, 200, 300, 400, 500, 1000],
};

/**
 * Состояние приложения
 * @type {Object}
 */
const APP_STATE = {
  /** Ссылки на элементы DOM */
  elements: {
    form: null,
    tracker: null,
    goal: null,
    remained: null,
    liters: null,
    percentage: null,
    cups: null,
    reset: null,
  },
  /** Данные трекера */
  trackerData: null,
};

/**
 * Утилиты приложения
 * @type {Object}
 */
const APP_UTILS = {
  /**
   * Форматирует строку атрибута данных
   * @param {string} element - Строка атрибута данных
   * @returns {string} Отформатированная строка
   */
  renderDataAttributes: (element) => element.slice(1, -1),

  /** Конфигурация для toast-уведомлений */
  toastConfig: {
    className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
    duration: 3000,
    gravity: 'bottom',
    position: 'center',
  },

  /**
   * Показывает toast-уведомление
   * @param {string} message - Сообщение для отображения
   */
  showToast: (message) => {
    Toastify({
      text: message,
      ...APP_UTILS.toastConfig,
    }).showToast();
  },
};

/**
 * Создает HTML-структуру приложения
 */
function createAppHTML() {
  const {
    root,
    selectors: {
      form,
      tracker,
      goal,
      remained,
      liters,
      percentage,
      cups,
      reset,
    },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='grid max-w-xl w-full gap-4 rounded border bg-white p-3 shadow drink-water'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>Drink Water Tracker</h1>
      <form class='grid gap-3' ${renderDataAttributes(form)}>
        <input class='w-full rounded border bg-slate-50 px-3 py-2 focus:border-blue-400 focus:outline-none' 
               type='number' name='goal' min='1' max='4' step='1' placeholder='Goal Liters'>
        <select class='w-full rounded border bg-slate-50 px-3 py-2 focus:border-blue-400 focus:outline-none' 
                name='size'>
          <option value>Select cup size</option>
          ${APP_CONFIG.sizes.map((i) => `<option value='${i}'>${i}ml</option>`).join('')}
        </select>
        <button class='border px-3 py-2 hover:bg-slate-50' type='submit'>Submit</button>
      </form>
    
      <div class='hidden gap-3' ${renderDataAttributes(tracker)}>
        <h2 class='text-lg'>Goal: <span class='font-bold' ${renderDataAttributes(goal)}>0</span> Liters</h2>
        <div class='drink-water__cup drink-water__cup--big'>
          <div class='drink-water__remained' ${renderDataAttributes(remained)}>
            <span ${renderDataAttributes(liters)}>1.5L</span>
            <small>Remained</small>
          </div>
          <div class='drink-water__percentage' ${renderDataAttributes(percentage)}></div>
        </div>
        <p class='drink-water__text'>Select how many glasses of water that you have drank</p>
        <ul class='grid grid-cols-6 gap-3' ${renderDataAttributes(cups)}></ul>
        <button class='border px-3 py-2 hover:bg-slate-50' ${renderDataAttributes(reset)}>Reset</button>
      </div>
    </div>
  `;
}

/**
 * Инициализирует ссылки на элементы DOM
 */
function initDOMElements() {
  APP_STATE.elements = {
    form: document.querySelector(APP_CONFIG.selectors.form),
    tracker: document.querySelector(APP_CONFIG.selectors.tracker),
    goal: document.querySelector(APP_CONFIG.selectors.goal),
    remained: document.querySelector(APP_CONFIG.selectors.remained),
    liters: document.querySelector(APP_CONFIG.selectors.liters),
    percentage: document.querySelector(APP_CONFIG.selectors.percentage),
    cups: document.querySelector(APP_CONFIG.selectors.cups),
    reset: document.querySelector(APP_CONFIG.selectors.reset),
  };
}

/**
 * Инициализирует приложение
 */
function initApp() {
  createAppHTML();
  initDOMElements();
  APP_STATE.trackerData = getStoredWaterConfig();
  displayStoredWaterConfig();
  APP_STATE.elements.form.addEventListener('submit', handleFormSubmit);
  APP_STATE.elements.reset.addEventListener('click', handleResetClick);
}

/**
 * Получает сохраненную конфигурацию воды из localStorage
 * @returns {Object} Конфигурация воды
 */
const getStoredWaterConfig = () =>
  JSON.parse(localStorage.getItem('waterConfig')) ?? {};

/**
 * Сохраняет текущую конфигурацию воды в localStorage
 */
const setStoredWaterConfig = () =>
  localStorage.setItem('waterConfig', JSON.stringify(APP_STATE.trackerData));

/**
 * Отображает сохраненную конфигурацию воды
 */
function displayStoredWaterConfig() {
  const { goal, size, count, fulledCups } = getStoredWaterConfig();
  if (!goal) return;

  Object.assign(APP_STATE.trackerData, { goal, size, count });
  renderCups(size);
  toggleUIElements();
  updateBigCup();
  markFilledSmallCups(fulledCups);
}

/**
 * Переключает отображение элементов UI
 */
const toggleUIElements = () => {
  APP_STATE.elements.form.classList.add('hidden');
  APP_STATE.elements.tracker.classList.replace('hidden', 'grid');
};

/**
 * Отмечает заполненные маленькие стаканы
 * @param {number} filledCount - Количество заполненных стаканов
 */
const markFilledSmallCups = (filledCount) => {
  document
    .querySelectorAll('[data-cups-item]')
    .forEach((cup, index) => cup.classList.toggle('full', index < filledCount));
};

/**
 * Отрисовывает стаканы
 * @param {number} size - Размер стакана
 */
function renderCups(size) {
  APP_STATE.elements.goal.textContent = APP_STATE.trackerData.goal;
  APP_STATE.elements.liters.textContent = `${APP_STATE.trackerData.goal}L`;

  APP_STATE.elements.cups.innerHTML = Array(APP_STATE.trackerData.count)
    .fill(`<li class="drink-water__cup" data-cups-item>${size} ml</li>`)
    .join('');

  document
    .querySelectorAll('[data-cups-item]')
    .forEach((cup, index) =>
      cup.addEventListener('click', () => fillCups(index)),
    );
}

/**
 * Заполняет стаканы
 * @param {number} index - Индекс кликнутого стакана
 */
function fillCups(index) {
  const cupsItems = document.querySelectorAll('[data-cups-item]');
  index = adjustIndex(index, cupsItems);
  updateCupStates(index, cupsItems);
  updateConfigs(cupsItems);
  setStoredWaterConfig();
  updateBigCup();
}

/**
 * Корректирует индекс в зависимости от состояния стаканов
 * @param {number} index - Исходный индекс
 * @param {NodeList} cupsItems - Список элементов стаканов
 * @returns {number} Скорректированный индекс
 */
const adjustIndex = (index, cupsItems) =>
  isLastCupFull(index, cupsItems) ||
  isCurrentCupFullAndNextEmpty(index, cupsItems)
    ? index - 1
    : index;

/**
 * Проверяет, является ли последний стакан заполненным
 * @param {number} index - Индекс стакана
 * @param {NodeList} cupsItems - Список элементов стаканов
 * @returns {boolean} Результат проверки
 */
const isLastCupFull = (index, cupsItems) =>
  index === APP_STATE.trackerData.count - 1 &&
  cupsItems[index].classList.contains('full');

/**
 * Проверяет, является ли текущий стакан заполненным, а следующий пустым
 * @param {number} index - Индекс стакана
 * @param {NodeList} cupsItems - Список элементов стаканов
 * @returns {boolean} Результат проверки
 */
const isCurrentCupFullAndNextEmpty = (index, cupsItems) =>
  cupsItems[index].classList.contains('full') &&
  cupsItems[index].nextElementSibling &&
  !cupsItems[index].nextElementSibling.classList.contains('full');

/**
 * Обновляет состояния стаканов
 * @param {number} index - Индекс последнего заполненного стакана
 * @param {NodeList} cupsItems - Список элементов стаканов
 */
const updateCupStates = (index, cupsItems) =>
  cupsItems.forEach((cup, idx) => cup.classList.toggle('full', idx <= index));

/**
 * Обновляет конфигурацию трекера
 * @param {NodeList} cupsItems - Список элементов стаканов
 */
function updateConfigs(cupsItems) {
  Object.assign(APP_STATE.trackerData, {
    cupDisplayHeight: document.querySelector('.drink-water__cup--big')
      .offsetHeight,
    fulledCups: document.querySelectorAll('.drink-water__cup.full').length,
    totalCups: cupsItems.length,
  });
}

/**
 * Обновляет отображение большого стакана
 */
const updateBigCup = () => {
  updatePercentageDisplay();
  updateRemainedDisplay();
};

/**
 * Обновляет отображение процента заполнения
 */
function updatePercentageDisplay() {
  const { fulledCups, totalCups, cupDisplayHeight } = APP_STATE.trackerData;
  const percentageFilled = fulledCups / totalCups;

  APP_STATE.elements.percentage.style.visibility =
    fulledCups === 0 ? 'hidden' : 'visible';
  APP_STATE.elements.percentage.style.height = `${percentageFilled * cupDisplayHeight}px`;
  APP_STATE.elements.percentage.innerText =
    fulledCups === 0 ? '' : `${(percentageFilled * 100).toFixed(1)}%`;
}

/**
 * Обновляет отображение оставшегося количества воды
 */
function updateRemainedDisplay() {
  const { fulledCups, totalCups, goal, size } = APP_STATE.trackerData;
  const isFullyFilled = fulledCups === totalCups && fulledCups !== 0;

  APP_STATE.elements.remained.style.visibility = isFullyFilled ? 'hidden' : 'visible';
  APP_STATE.elements.remained.style.height = isFullyFilled ? '0' : 'auto';

  if (!isFullyFilled) {
    const remainedLiters = goal - (size * fulledCups) / 1000;
    APP_STATE.elements.liters.innerText = `${remainedLiters.toFixed(1)}L`;
  }
}

/**
 * Обрабатывает отправку формы
 * @param {Event} event - Событие отправки формы
 */
function handleFormSubmit(event) {
  event.preventDefault();
  const { goal, size } = Object.fromEntries(new FormData(event.target));

  if (!goal || isNaN(goal) || !size || isNaN(size)) {
    APP_UTILS.showToast('Please enter valid numbers');
    return;
  }

  APP_STATE.trackerData = {
    goal: Number(goal),
    size: Number(size),
    count: Math.round((goal / size) * 1000),
    cupDisplayHeight: document.querySelector('.drink-water__cup--big')
      .offsetHeight,
    fulledCups: 0,
    totalCups: 0,
  };
  renderCups(Number(size));
  event.target.reset();
  toggleUIElements();
  setStoredWaterConfig();
}

/**
 * Обрабатывает нажатие кнопки сброса
 */
const handleResetClick = () => {
  localStorage.clear();
  location.reload();
};

initApp();
