/**
 * Модуль Color Finder
 *
 * Этот модуль представляет собой приложение для поиска информации о цветах.
 * Он позволяет пользователю выбрать цвет с помощью цветового пикера,
 * отправить запрос на API для получения информации о выбранном цвете,
 * и отобразить полученную информацию на странице.
 *
 * @module ColorFinder
 */

import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';
import 'vanilla-colorful';
import { HexColorPicker } from 'vanilla-colorful';

/**
 * @interface AppConfig
 * @description Конфигурация приложения
 */
interface AppConfig {
  /** Корневой элемент приложения */
  root: string;
  /** Селекторы для элементов DOM */
  selectors: {
    [key: string]: string;
  };
  /** Конечная точка API для получения данных о цветах */
  API_ENDPOINT: string;
}

/**
 * @interface AppState
 * @description Состояние приложения
 */
interface AppState {
  /** Элементы DOM, используемые в приложении */
  elements: {
    colorInput: HTMLInputElement;
    submitButton: HTMLButtonElement;
    resultContainer: HTMLDivElement;
    colorPicker: HexColorPicker;
  };
}

/**
 * @interface AppUtils
 * @description Утилиты приложения
 */
interface AppUtils {
  /**
   * Преобразует строку атрибута в формат для data-атрибутов
   * @param {string} element - Строка с атрибутом
   * @returns {string} Преобразованная строка
   */
  renderDataAttributes: (element: string) => string;
  /** Конфигурация для уведомлений */
  toastConfig: {
    className: string;
    duration?: number;
    gravity?: 'top' | 'bottom';
    position?: 'left' | 'center' | 'right';
  };
  /**
   * Показывает уведомление
   * @param {string} message - Текст уведомления
   */
  showToast: (message: string) => void;
  /**
   * Обрабатывает ошибки
   * @param {string} message - Сообщение об ошибке
   * @param {any} [error] - Объект ошибки
   */
  handleError: (message: string, error?: any) => void;
}

/**
 * @interface Color
 * @description Представление цвета и его характеристик
 */
interface Color {
  /** Шестнадцатеричное представление цвета */
  hex: string;
  /** Название цвета */
  name: string;
  /** RGB значения */
  rgb: {
    r: number;
    g: number;
    b: number;
  };
  /** HSL значения */
  hsl: {
    h: number;
    s: number;
    l: number;
  };
  /** LAB значения */
  lab: {
    l: number;
    a: number;
    b: number;
  };
  /** Яркость */
  luminance: number;
  /** Яркость по WCAG */
  luminanceWCAG: number;
}

/**
 * @interface ColorResponse
 * @description Ответ API с информацией о цветах
 */
interface ColorResponse {
  /** Массив цветов */
  colors: Color[];
}

/**
 * @constant APP_CONFIG
 * @description Конфигурация приложения
 */
const APP_CONFIG: AppConfig = {
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
 * @constant APP_STATE
 * @description Состояние приложения
 */
const APP_STATE: AppState = {
  elements: {
    colorInput: document.createElement('input'),
    submitButton: document.createElement('button'),
    resultContainer: document.createElement('div'),
    colorPicker: document.createElement('hex-color-picker'),
  },
};

/**
 * @constant APP_UTILS
 * @description Утилиты приложения
 */
const APP_UTILS: AppUtils = {
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

  handleError: (message, error = null) => {
    APP_UTILS.showToast(message);
    if (error) console.error(message, error);
  },
};

/**
 * Создает HTML-структуру приложения
 */
function createAppHTML(): void {
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
 * Инициализирует элементы DOM в состоянии приложения
 */
function initDOMElements(): void {
  APP_STATE.elements = {
    colorInput: document.querySelector(APP_CONFIG.selectors.colorInput) as HTMLInputElement,
    submitButton: document.querySelector(APP_CONFIG.selectors.submitButton) as HTMLButtonElement,
    resultContainer: document.querySelector(APP_CONFIG.selectors.resultContainer) as HTMLDivElement,
    colorPicker: document.querySelector(APP_CONFIG.selectors.colorPicker) as HexColorPicker,
  };
}

/**
 * Инициализирует приложение
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();

  APP_STATE.elements.colorPicker.addEventListener(
    'color-changed',
    ({ detail: { value } }) => (APP_STATE.elements.colorInput.value = value),
  );
  APP_STATE.elements.submitButton.addEventListener('click', handleSubmitButtonClick);
}

/**
 * Обрабатывает нажатие кнопки отправки.
 * Запускает процесс получения данных о цвете, обновляет UI и обрабатывает возможные ошибки.
 * @returns {Promise<void>}
 * @throws {Error} Если произошла ошибка при получении данных о цвете
 */
async function handleSubmitButtonClick(): Promise<void> {
  try {
    updateUIRequest(true);
    const color = await fetchColorData();
    APP_STATE.elements.resultContainer.innerHTML = createColorInfoHTML(color);
    setTimeout(() => updateUIRequest(false), 1200);
  } catch (error: unknown) {
    handleRequestError(error instanceof Error ? error : new Error('An unknown error occurred'));
  } finally {
    APP_STATE.elements.submitButton.textContent = 'Submit';
  }
}

/**
 * Обновляет UI в зависимости от состояния загрузки.
 * @param {boolean} isLoading - Флаг, указывающий на состояние загрузки
 */
function updateUIRequest(isLoading: boolean): void {
  APP_STATE.elements.resultContainer.classList.toggle('open', !isLoading);
  APP_STATE.elements.submitButton.textContent = isLoading ? 'Loading...' : 'Submit';
}

/**
 * Получает данные о цвете от API.
 * @returns {Promise<Color>} Объект с данными о цвете
 * @throws {Error} Если произошла ошибка при запросе к API
 */
async function fetchColorData(): Promise<Color> {
  const colorValue = APP_STATE.elements.colorInput.value.replace('#', '');
  const response = await axios.get<ColorResponse>(`${APP_CONFIG.API_ENDPOINT}?values=${colorValue}`);
  return response.data.colors[0];
}

/**
 * Создает HTML-разметку для отображения информации о цвете.
 * @param {Color} color - Объект с данными о цвете
 * @returns {string} HTML-разметка с информацией о цвете
 */
function createColorInfoHTML(color: Color): string {
  return `
    <h3 class='text-center font-bold text-lg'>About <span>${color.hex}</span></h3>
    <img class='w-[200px] border mx-auto' src='${createSwatchURL(color)}' alt='${color.name}'>
    <div class='table'>
      ${createColorInfoRows(color)}
    </div>
  `;
}

/**
 * Создает URL для изображения цветового образца.
 * @param {Color} color - Объект с данными о цвете
 * @returns {string} URL изображения цветового образца
 */
function createSwatchURL(color: Color): string {
  const colorValue = APP_STATE.elements.colorInput.value.slice(1);
  return `${APP_CONFIG.API_ENDPOINT}swatch/?color=${colorValue}&name=${encodeURIComponent(color.name)}`;
}

/**
 * Создает HTML-разметку для отображения информации о цвете в виде таблицы.
 * @param {Color} color - Объект с данными о цвете
 * @returns {string} HTML-разметка с информацией о цвете в виде таблицы
 */
function createColorInfoRows(color: Color): string {
  const rows = [
    { label: 'Color Name', value: color.name },
    { label: 'RGB Values', value: `(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})` },
    {
      label: 'HSL Values',
      value: `(${color.hsl.h.toFixed(0)}, ${color.hsl.s.toFixed(0)}%, ${color.hsl.l.toFixed(0)}%)`,
    },
    { label: 'LAB Values', value: `(${color.lab.l.toFixed(2)}, ${color.lab.a.toFixed(2)}, ${color.lab.b.toFixed(2)})` },
    { label: 'Luminance', value: color.luminance.toFixed(4) },
    { label: 'Luminance WCAG', value: color.luminanceWCAG.toFixed(4) },
  ];

  return rows
    .map(({ label, value }) => `
      <p class='grid grid-cols-2'>
        <span class='p-3 border font-medium'>${label}</span>
        <span class='p-3 border'>${value}</span>
      </p>
    `)
    .join('');
}

/**
 * Обрабатывает ошибки, возникшие при запросе данных о цвете.
 * @param {Error} error - Объект ошибки
 */
function handleRequestError(error: Error): void {
  APP_UTILS.handleError('Error fetching color data', error);
  APP_STATE.elements.resultContainer.classList.remove('open');
  APP_STATE.elements.resultContainer.innerHTML = '';
}

// Инициализация приложения
initApp();
