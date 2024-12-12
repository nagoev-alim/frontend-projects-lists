/**
 * @fileoverview Этот файл содержит код для создания интерактивного слайдера цен.
 * Пользователь может управлять диапазоном цен с помощью ползунков или путем ввода
 * значений в поля ввода. Слайдер визуально отображает выбранный диапазон цен.
 */

import './style.css';

/**
 * Конфигурация приложения.
 * @interface
 */
interface AppConfig {
  /** Селектор корневого элемента */
  root: string;
  /** Селекторы элементов управления */
  selectors: {
    /** Селектор поля ввода минимальной цены */
    inputMin: string;
    /** Селектор поля ввода максимальной цены */
    inputMax: string;
    /** Селектор элемента прогресса слайдера */
    sliderProgress: string;
    /** Селектор ползунка минимальной цены */
    rangeMin: string;
    /** Селектор ползунка максимальной цены */
    rangeMax: string;
  };
}

/**
 * Состояние приложения.
 * @interface
 */
interface AppState {
  /** Элементы управления */
  elements: {
    /** Поле ввода минимальной цены */
    inputMin: HTMLInputElement;
    /** Поле ввода максимальной цены */
    inputMax: HTMLInputElement;
    /** Элемент прогресса слайдера */
    sliderProgress: HTMLDivElement;
    /** Ползунок минимальной цены */
    rangeMin: HTMLInputElement;
    /** Ползунок максимальной цены */
    rangeMax: HTMLInputElement;
  };
  /** Минимальный разрыв между значениями */
  gap: number;
}

/**
 * Утилиты приложения.
 * @interface
 */
interface AppUtils {
  /**
   * Преобразует строку селектора в строку атрибута данных.
   * @param {string} element - Строка селектора.
   * @returns {string} Строка атрибута данных.
   */
  renderDataAttributes: (element: string) => string;
}

/**
 * Конфигурация приложения.
 * @type {AppConfig}
 */
const APP_CONFIG: AppConfig = {
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
 * Состояние приложения.
 * @type {AppState}
 */
const APP_STATE: AppState = {
  elements: {
    inputMin: document.createElement('input'),
    inputMax: document.createElement('input'),
    sliderProgress: document.createElement('div'),
    rangeMin: document.createElement('input'),
    rangeMax: document.createElement('input'),
  },
  gap: 1000,
};

/**
 * Утилиты приложения.
 * @type {AppUtils}
 */
const APP_UTILS: AppUtils = {
  renderDataAttributes: (element: string) => element.slice(1, -1),
};

/**
 * Создает HTML-разметку приложения.
 * @function
 */
function createAppHTML(): void {
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
 * Инициализирует DOM-элементы приложения.
 * @function
 */
function initDOMElements(): void {
  APP_STATE.elements = {
    inputMin: document.querySelector(APP_CONFIG.selectors.inputMin) as HTMLInputElement,
    inputMax: document.querySelector(APP_CONFIG.selectors.inputMax) as HTMLInputElement,
    sliderProgress: document.querySelector(APP_CONFIG.selectors.sliderProgress) as HTMLDivElement,
    rangeMin: document.querySelector(APP_CONFIG.selectors.rangeMin) as HTMLInputElement,
    rangeMax: document.querySelector(APP_CONFIG.selectors.rangeMax) as HTMLInputElement,
  };
}

/**
 * Инициализирует приложение.
 * @function
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();
  [APP_STATE.elements.inputMin, APP_STATE.elements.inputMax].forEach(input => {
    input.addEventListener('input', handleInputChange as EventListener);
  });

  [APP_STATE.elements.rangeMin, APP_STATE.elements.rangeMax].forEach(input => {
    input.addEventListener('input', handleRangeChange as EventListener);
  });
}

/**
 * Обрабатывает изменение значения в полях ввода.
 * @function
 * @param {InputEvent} event - Событие ввода.
 */
function handleInputChange(event: InputEvent): void {
  const target = event.target as HTMLInputElement;
  const isMin = target.dataset.input === 'min';
  let value = Number(target.value);
  const otherValue = Number(isMin ? APP_STATE.elements.inputMax.value : APP_STATE.elements.inputMin.value);

  value = Math.max(0, Math.min(10000, value));
  value = isMin ? Math.min(value, otherValue - APP_STATE.gap) : Math.max(value, otherValue + APP_STATE.gap);

  target.value = value.toString();
  updateRangeInputs();
  updateSliderProgress();
}

/**
 * Обрабатывает изменение значения ползунков.
 * @function
 * @param {InputEvent} event - Событие ввода.
 */
function handleRangeChange(event: InputEvent): void {
  const target = event.target as HTMLInputElement;
  const isMin = target.dataset.range === 'min';
  let value = Number(target.value);

  value = Math.max(0, Math.min(10000, value));

  if (isMin) {
    APP_STATE.elements.inputMin.value = value.toString();
    if (value > Number(APP_STATE.elements.inputMax.value) - APP_STATE.gap) {
      APP_STATE.elements.inputMax.value = Math.min(10000, value + APP_STATE.gap).toString();
      APP_STATE.elements.rangeMax.value = APP_STATE.elements.inputMax.value;
    }
  } else {
    APP_STATE.elements.inputMax.value = value.toString();
    if (value < Number(APP_STATE.elements.inputMin.value) + APP_STATE.gap) {
      APP_STATE.elements.inputMin.value = Math.max(0, value - APP_STATE.gap).toString();
      APP_STATE.elements.rangeMin.value = APP_STATE.elements.inputMin.value;
    }
  }

  updateSliderProgress();
}

/**
 * Обновляет значения ползунков в соответствии с полями ввода.
 * @function
 */
function updateRangeInputs(): void {
  APP_STATE.elements.rangeMin.value = APP_STATE.elements.inputMin.value;
  APP_STATE.elements.rangeMax.value = APP_STATE.elements.inputMax.value;
}

/**
 * Обновляет визуальное отображение прогресса слайдера.
 * @function
 */
function updateSliderProgress(): void {
  const minValue = Number(APP_STATE.elements.inputMin.value);
  const maxValue = Number(APP_STATE.elements.inputMax.value);
  const minPercent = (minValue / Number(APP_STATE.elements.rangeMin.max)) * 100;
  const maxPercent = 100 - (maxValue / Number(APP_STATE.elements.rangeMax.max)) * 100;

  APP_STATE.elements.sliderProgress.style.left = `${minPercent}%`;
  APP_STATE.elements.sliderProgress.style.right = `${maxPercent}%`;
}

// Запуск приложения
initApp();
