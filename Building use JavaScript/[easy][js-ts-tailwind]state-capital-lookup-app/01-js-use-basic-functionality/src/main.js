/**
 * Этот код реализует приложение для поиска информации о штатах США.
 * Он позволяет пользователю вводить название или аббревиатуру штата
 * и отображает соответствующую информацию, включая столицу и координаты.
 */

import './style.css';
import mockData from './mock'

/**
 * Конфигурация приложения
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента
 * @property {Object} selectors - Селекторы для элементов ввода и списка результатов
 */
const APP_CONFIG = {
  root: '#app',
  selectors: {
    stateInput: '[data-state-input]',
    resultsList: '[data-results-list]',
  },
};

/**
 * Состояние приложения
 * @typedef {Object} AppState
 * @property {Object} elements - DOM элементы
 * @property {Array} matches - Массив совпадений при поиске
 */
const APP_STATE = {
  elements: {
    stateInput: null,
    resultsList: null,
  },
  matches: [],
};

/**
 * Утилиты приложения
 * @typedef {Object} AppUtils
 * @property {Function} renderDataAttributes - Функция для рендеринга data-атрибутов
 * @property {Function} debounce - Функция для debounce
 */
const APP_UTILS = {
  /**
   * Рендерит data-атрибуты
   * @param {string} element - Строка с data-атрибутом
   * @returns {string} Отрендеренный data-атрибут
   */
  renderDataAttributes: (element) => element.slice(1, -1),

  /**
   * Реализует debounce для функции
   * @param {Function} func - Функция для debounce
   * @param {number} delay - Задержка в миллисекундах
   * @returns {Function} Функция с debounce
   */
  debounce: (func, delay) => {
    let timeoutId;
    return function(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  },
};

/**
 * Создает HTML структуру приложения
 */
function createAppHTML() {
  const { root, selectors: { stateInput, resultsList } } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='w-full max-w-md grid gap-4 rounded border bg-white p-3 shadow'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>State Capital Lookup</h1>
      <input
        class='rounded border-2 bg-slate-50 px-3 py-2.5 focus:border-blue-400 focus:outline-none'
        type='text'
        placeholder='Enter state name or abbreviation...'
        ${renderDataAttributes(stateInput)}
      >
      <ul class='grid gap-3' ${renderDataAttributes(resultsList)}></ul>
    </div>
  `;
}

/**
 * Инициализирует DOM элементы
 */
function initDOMElements() {
  APP_STATE.elements = {
    stateInput: document.querySelector(APP_CONFIG.selectors.stateInput),
    resultsList: document.querySelector(APP_CONFIG.selectors.resultsList),
  };
}

/**
 * Инициализирует приложение
 */
function initApp() {
  createAppHTML();
  initDOMElements();

  APP_STATE.elements.stateInput.addEventListener("input", APP_UTILS.debounce(handleStateInputChange, 300));
}

/**
 * Обрабатывает изменение ввода в поле поиска
 * @param {Event} event - Событие ввода
 */
function handleStateInputChange({ target: { value } }) {
  const searchValue = value.toLowerCase();
  APP_STATE.matches = searchValue
    ? mockData.filter(({ name, abbr }) => {
      const regex = new RegExp(`^${searchValue}`, "i");
      return regex.test(name.toLowerCase()) || regex.test(abbr.toLowerCase());
    })
    : [];

  updateResultsList(searchValue);
}

/**
 * Обновляет список результатов
 * @param {string} searchValue - Введенное значение поиска
 */
function updateResultsList(searchValue) {
  if (APP_STATE.matches.length > 0) {
    APP_STATE.elements.resultsList.innerHTML = APP_STATE.matches.map(createListItem).join("");
  } else {
    APP_STATE.elements.resultsList.innerHTML = searchValue
      ? `<li class='text-center font-bold'>No matches</li>`
      : "";
  }
}

/**
 * Создает элемент списка для отображения информации о штате
 * @param {Object} state - Объект с информацией о штате
 * @returns {string} HTML строка для элемента списка
 */
function createListItem({ name, abbr, capital, lat, long }) {
  return `
    <li class='border-2 bg-gray-50 rounded grid place-items-center p-3 text-center gap-1.5'>
      <h5 class='font-bold'>${name} (${abbr}):</h5>
      <div class='grid gap-1.5'>
        <p>${capital}</p>
        <p>Lat: ${lat} / Long: ${long}</p>
      </div>
    </li>`;
}

initApp();