import './style.css';

/**
 * Приложение для создания слайдера цен.
 * Позволяет пользователю выбирать минимальную и максимальную цену
 * с помощью ввода или перетаскивания ползунков.
 */

/**
 * Конфигурация приложения
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента
 * @property {Object} selectors - Селекторы для различных элементов DOM
 */
const APP_CONFIG = {
  root: '#app',
  selectors: {
    inputMin: '[data-input="min"]',
    inputMax: '[data-input="max"]',
    sliderProgress: '[data-slider-progress]',
    rangeMin: '[data-range="min"]',
    rangeMax: '[data-range="max"]',
  },
};

/**
 * Состояние приложения
 * @typedef {Object} AppState
 * @property {Object} elements - Объект, содержащий ссылки на DOM элементы
 * @property {number} gap - Минимальная разница между минимальной и максимальной ценой
 */
const APP_STATE = {
  elements: {},
  gap: 1000,
};

/**
 * Утилиты приложения
 * @typedef {Object} AppUtils
 */
const APP_UTILS = {
  /**
   * Преобразует данные атрибуты в строку
   * @param {string} element - Строка с данными атрибутами
   * @returns {string} Строка без квадратных скобок
   */
  renderDataAttributes: (element) => element.slice(1, -1),
};

/**
 * Создает HTML структуру приложения
 */
function createAppHTML() {
  const {
    root,
    selectors: {
      inputMin,
      inputMax,
      sliderProgress,
      rangeMin,
      rangeMax,
    },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='price-slider bg-white border gap-4 grid max-w-md p-3 rounded shadow w-full'>
      <h1 class='font-bold md:text-4xl text-2xl text-center'>Price Slider</h1>
      <p>Use slider or enter min and max price</p>
      <div>
        <label class='gap-2 grid'>
          <span>Min</span>
          <input class='bg-slate-50 border focus:border-blue-400 focus:outline-none px-3 py-2 rounded w-full' 
                 type='number' ${renderDataAttributes(inputMin)} value='1800'>
        </label>
        <span class='separator'></span>
        <label class='gap-2 grid'>
          <span>Max</span>
          <input class='bg-slate-50 border focus:border-blue-400 focus:outline-none px-3 py-2 rounded w-full' 
                 type='number' ${renderDataAttributes(inputMax)} value='7800'>
        </label>
      </div>
      <div class='slider'>
        <div class='slider__progress' ${renderDataAttributes(sliderProgress)}></div>
      </div>
      <div class='ranges'>
        <input class='ranges__input' type='range' ${renderDataAttributes(rangeMin)} min='0' max='10000' value='1800' step='100'>
        <input class='ranges__input' type='range' ${renderDataAttributes(rangeMax)} min='0' max='10000' value='7800' step='100'>
      </div>
    </div>
  `;
}

/**
 * Инициализирует DOM элементы и сохраняет их в состоянии приложения
 */
function initDOMElements() {
  APP_STATE.elements = {
    inputMin: document.querySelector(APP_CONFIG.selectors.inputMin),
    inputMax: document.querySelector(APP_CONFIG.selectors.inputMax),
    sliderProgress: document.querySelector(APP_CONFIG.selectors.sliderProgress),
    rangeMin: document.querySelector(APP_CONFIG.selectors.rangeMin),
    rangeMax: document.querySelector(APP_CONFIG.selectors.rangeMax),
  };
}

/**
 * Инициализирует приложение
 */
function initApp() {
  createAppHTML();
  initDOMElements();
  [APP_STATE.elements.inputMin, APP_STATE.elements.inputMax].forEach(input => {
    input.addEventListener('input', handleInputChange);
  });

  [APP_STATE.elements.rangeMin, APP_STATE.elements.rangeMax].forEach(input => {
    input.addEventListener('input', handleRangeChange);
  });
}

/**
 * Обрабатывает изменение значения в текстовых полях ввода
 * @param {Event} event - Событие изменения
 */
function handleInputChange({ target }) {
  const isMin = target.dataset.input === 'min';
  let value = Number(target.value);
  const otherValue = Number(isMin ? APP_STATE.elements.inputMax.value : APP_STATE.elements.inputMin.value);

  value = Math.max(0, Math.min(10000, value));
  value = isMin ? Math.min(value, otherValue - APP_STATE.gap) : Math.max(value, otherValue + APP_STATE.gap);

  target.value = value;
  updateRangeInputs();
  updateSliderProgress();
}

/**
 * Обрабатывает изменение положения ползунков
 * @param {Event} event - Событие изменения
 */
function handleRangeChange({ target }) {
  const isMin = target.dataset.range === 'min';
  let value = Number(target.value);

  value = Math.max(0, Math.min(10000, value));

  if (isMin) {
    APP_STATE.elements.inputMin.value = value;
    if (value > Number(APP_STATE.elements.inputMax.value) - APP_STATE.gap) {
      APP_STATE.elements.inputMax.value = Math.min(10000, value + APP_STATE.gap);
      APP_STATE.elements.rangeMax.value = APP_STATE.elements.inputMax.value;
    }
  } else {
    APP_STATE.elements.inputMax.value = value;
    if (value < Number(APP_STATE.elements.inputMin.value) + APP_STATE.gap) {
      APP_STATE.elements.inputMin.value = Math.max(0, value - APP_STATE.gap);
      APP_STATE.elements.rangeMin.value = APP_STATE.elements.inputMin.value;
    }
  }

  updateSliderProgress();
}

/**
 * Обновляет значения ползунков в соответствии с текстовыми полями
 */
function updateRangeInputs() {
  APP_STATE.elements.rangeMin.value = APP_STATE.elements.inputMin.value;
  APP_STATE.elements.rangeMax.value = APP_STATE.elements.inputMax.value;
}

/**
 * Обновляет визуальное отображение прогресса слайдера
 */
function updateSliderProgress() {
  const minValue = Number(APP_STATE.elements.inputMin.value);
  const maxValue = Number(APP_STATE.elements.inputMax.value);
  const minPercent = (minValue / Number(APP_STATE.elements.rangeMin.max)) * 100;
  const maxPercent = 100 - (maxValue / Number(APP_STATE.elements.rangeMax.max)) * 100;

  APP_STATE.elements.sliderProgress.style.left = `${minPercent}%`;
  APP_STATE.elements.sliderProgress.style.right = `${maxPercent}%`;
}

// Запуск приложения
initApp();
