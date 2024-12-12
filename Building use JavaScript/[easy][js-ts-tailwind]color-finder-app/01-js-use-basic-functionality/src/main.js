import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';
import 'vanilla-colorful';

/**
 * Приложение Color Finder
 *
 * Это приложение позволяет пользователю выбрать цвет с помощью цветового пикера
 * и получить подробную информацию о выбранном цвете, включая его название,
 * значения RGB, HSL, LAB и показатели яркости.
 */

/**
 * Конфигурация приложения
 * @type {Object}
 */
const APP_CONFIG = {
  root: '#app',
  selectors: {
    colorInput: '[data-color-input]',
    submitButton: '[data-submit-color]',
    resultContainer: '[data-result-container]',
    colorPicker: 'hex-color-picker',
  },
  API_ENDPOINT: 'https://api.color.pizza/v1/',
};

/**
 * Состояние приложения
 * @type {Object}
 */
const APP_STATE = {
  elements: {
    colorInput: null,
    submitButton: null,
    resultContainer: null,
    colorPicker: null,
  },
};

/**
 * Утилиты приложения
 * @type {Object}
 */
const APP_UTILS = {
  renderDataAttributes: (element) => element.slice(1, -1),
  toastConfig: {
    className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
    duration: 3000,
    gravity: 'bottom',
    position: 'center',
  },
  /**
   * Показывает уведомление
   * @param {string} message - Текст уведомления
   */
  showToast: (message) => {
    Toastify({
      text: message,
      ...APP_UTILS.toastConfig,
    }).showToast();
  },
  /**
   * Обрабатывает ошибку
   * @param {string} message - Сообщение об ошибке
   * @param {Error} [error] - Объект ошибки
   */
  handleError: (message, error = null) => {
    APP_UTILS.showToast(message);
    if (error) console.error(message, error);
  },
};

/**
 * Создает HTML структуру приложения
 */
function createAppHTML() {
  const {
    root,
    selectors: {
      colorInput, submitButton, resultContainer,
    },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='grid gap-4 rounded border bg-white p-3 shadow max-w-xl w-full'>
      <h1 class='text-center font-bold text-2xl md:text-4xl'>Color Finder</h1>
      <div class='grid gap-3'>
        <div class='grid gap-3'>
          <hex-color-picker color='#1e88e5'></hex-color-picker>
          <input class='w-full rounded border bg-slate-50 px-3 py-2 text-center font-bold focus:border-blue-400 focus:outline-none' type='text' disabled value='#1e88e5' ${renderDataAttributes(colorInput)}>
          <button class='border px-3 py-2 hover:bg-slate-50' ${renderDataAttributes(submitButton)}>Submit</button>
        </div>
        <div class='grid gap-3' ${renderDataAttributes(resultContainer)}></div>
      </div>
    </div>
  `;
}

/**
 * Инициализирует DOM элементы
 */
function initDOMElements() {
  APP_STATE.elements = {
    colorInput: document.querySelector(APP_CONFIG.selectors.colorInput),
    submitButton: document.querySelector(APP_CONFIG.selectors.submitButton),
    resultContainer: document.querySelector(APP_CONFIG.selectors.resultContainer),
    colorPicker: document.querySelector(APP_CONFIG.selectors.colorPicker),
  };
}

/**
 * Инициализирует приложение
 */
function initApp() {
  createAppHTML();
  initDOMElements();

  APP_STATE.elements.colorPicker.addEventListener(
    'color-changed',
    ({ detail: { value } }) => (APP_STATE.elements.colorInput.value = value),
  );
  APP_STATE.elements.submitButton.addEventListener('click', handleSubmitButtonClick);
}

/**
 * Обрабатывает клик по кнопке отправки
 */
async function handleSubmitButtonClick() {
  updateUIRequest(true);

  try {
    const color = await fetchColorData();
    APP_STATE.elements.resultContainer.innerHTML = createColorInfoHTML(color);
    setTimeout(updateUIRequest, 1200);
  } catch (error) {
    handleRequestError(error);
  } finally {
    APP_STATE.elements.submitButton.textContent = 'Submit';
  }
}

/**
 * Обновляет UI во время запроса
 * @param {boolean} isLoading - Флаг загрузки
 */
function updateUIRequest(isLoading = false) {
  APP_STATE.elements.resultContainer.classList.toggle('open', !isLoading);
  APP_STATE.elements.submitButton.textContent = isLoading ? 'Loading...' : 'Submit';
}

/**
 * Получает данные о цвете с API
 * @returns {Promise<Object>} Данные о цвете
 */
async function fetchColorData() {
  const colorValue = APP_STATE.elements.colorInput.value.split('#')[1];
  const {
    data: {
      colors: [color],
    },
  } = await axios.get(`${APP_CONFIG.API_ENDPOINT}?values=${colorValue}`);
  return color;
}

/**
 * Создает HTML для информации о цвете
 * @param {Object} color - Объект с информацией о цвете
 * @returns {string} HTML строка
 */
function createColorInfoHTML(color) {
  return `
    <h3 class='text-center font-bold text-lg'>About <span>${color.hex}</span></h3>
    <img class='w-[200px] border mx-auto' src='${createSwatchURL(color)}' alt='${color.name}'>
    <div class='table'>
      ${createColorInfoRows(color)}
    </div>
  `;
}

/**
 * Создает URL для образца цвета
 * @param {Object} color - Объект с информацией о цвете
 * @returns {string} URL образца цвета
 */
function createSwatchURL(color) {
  const colorValue = APP_STATE.elements.colorInput.value.split('#')[1];
  return `${APP_CONFIG.API_ENDPOINT}swatch/?color=${colorValue}&name=${color.name}`;
}

/**
 * Создает строки с информацией о цвете
 * @param {Object} color - Объект с информацией о цвете
 * @returns {string} HTML строка с информацией о цвете
 */
function createColorInfoRows(color) {
  const rows = [
    { label: 'Color Name', value: color.name },
    {
      label: 'RGB Values',
      value: `(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`,
    },
    {
      label: 'HSL Values',
      value: `(${color.hsl.h.toFixed(0)}, ${color.hsl.s.toFixed(0)}%, ${color.hsl.l.toFixed(0)}%)`,
    },
    {
      label: 'LAB Values',
      value: `(${color.lab.l}, ${color.lab.a}, ${color.lab.b})`,
    },
    { label: 'Luminances', value: `(${color.luminance})` },
    { label: 'Luminance WCAG', value: `(${color.luminanceWCAG})` },
  ];

  return rows
    .map(
      (row) => `
    <p class='grid grid-cols-2'>
      <span class='p-3 border font-medium'>${row.label}</span>
      <span class='p-3 border'>${row.value}</span>
    </p>
  `,
    )
    .join('');
}

/**
 * Обрабатывает ошибку запроса
 * @param {Error} error - Объект ошибки
 */
function handleRequestError(error) {
  APP_UTILS.handleError('Error fetching color data', error);
  APP_STATE.elements.resultContainer.classList.remove('open');
  APP_STATE.elements.resultContainer.innerHTML = '';
}

initApp();
