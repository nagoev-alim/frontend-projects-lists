import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

/**
 * Этот код представляет собой приложение для генерации случайных цветов.
 * Пользователь может генерировать новые цвета, нажимая на кнопку или клавишу пробел.
 * Сгенерированный цвет отображается визуально и в виде HEX-кода.
 * Пользователь также может скопировать HEX-код цвета в буфер обмена.
 */

/**
 * Конфигурация приложения
 * @type {Object}
 */
const APP_CONFIG = {
  /** Корневой элемент приложения */
  root: '#app',
  /** Селекторы для DOM-элементов */
  selectors: {
    colorDisplay: '[data-color-display]',
    colorValue: '[data-color-value]',
    generateColor: '[data-generate-color]',
    copyColor: '[data-copy-color]',
  },
  /** Варианты для генерации HEX-кода */
  variants: [1, 2, 3, 4, 5, 6, 7, 8, 9, 'a', 'b', 'c', 'd', 'e', 'f'],
};

/**
 * Состояние приложения
 * @type {Object}
 */
const APP_STATE = {
  /** DOM-элементы */
  elements: {
    colorDisplay: null,
    colorValue: null,
    generateColor: null,
    copyColor: null,
  },
};

/**
 * Утилиты приложения
 * @type {Object}
 */
const APP_UTILS = {
  /**
   * Преобразует селектор в атрибут данных
   * @param {string} element - Селектор элемента
   * @returns {string} Атрибут данных
   */
  renderDataAttributes: (element) => element.slice(1, -1),

  /** Конфигурация для уведомлений */
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
   * Обрабатывает ошибки
   * @param {string} message - Сообщение об ошибке
   * @param {Error} [error] - Объект ошибки
   */
  handleError: (message, error = null) => {
    APP_UTILS.showToast(message);
    if (error) console.error(message, error);
  },
};

/**
 * Создает HTML-разметку приложения
 */
function createAppHTML() {
  const {
    root,
    selectors: {
      colorDisplay,
      colorValue,
      generateColor,
      copyColor,
    },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='color-generator grid w-full max-w-md gap-4 p-3'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>Color Generator</h1>
      <div class='mx-auto grid max-w-max place-content-center gap-2 rounded border bg-white p-2 text-center shadow'>
        <div class='h-[170px] w-[170px] border bg-[#A1B5C1]' ${renderDataAttributes(colorDisplay)}></div>
        <p class='font-bold' ${renderDataAttributes(colorValue)}>#A1B5C1</p>
      </div>
      <div class='grid place-items-center gap-3'>
        <button class='rounded bg-purple-500 px-3 py-2 font-medium text-white hover:bg-purple-400' ${renderDataAttributes(generateColor)}>Generate color</button>
        <button class='rounded bg-green-500 px-3 py-2 font-medium text-white hover:bg-green-400' ${renderDataAttributes(copyColor)}>Click to copy</button>
      </div>
      <p class='text-center'>Or just press the <span class='font-bold'>"Spacebar"</span> to generate new palettes.</p>
    </div>
  `;
}

/**
 * Инициализирует DOM-элементы
 */
function initDOMElements() {
  APP_STATE.elements = {
    colorDisplay: document.querySelector(APP_CONFIG.selectors.colorDisplay),
    colorValue: document.querySelector(APP_CONFIG.selectors.colorValue),
    copyColor: document.querySelector(APP_CONFIG.selectors.copyColor),
    generateColor: document.querySelector(APP_CONFIG.selectors.generateColor),
  };
}

/**
 * Инициализирует приложение
 */
function initApp() {
  createAppHTML();
  initDOMElements();
  APP_STATE.elements.generateColor.addEventListener('click', handleGenerateColorClick);
  APP_STATE.elements.copyColor.addEventListener('click', handleCopyColorClick);
  document.addEventListener('keydown', ({ code }) => {
    if (code === 'Space') {
      handleGenerateColorClick();
    }
  });
}

/**
 * Обрабатывает клик по кнопке генерации цвета
 */
function handleGenerateColorClick() {
  const newColor = handleGenerateColor();
  const { colorValue, colorDisplay } = APP_STATE.elements;
  colorValue.textContent = newColor;
  colorDisplay.style.backgroundColor = newColor;
}

/**
 * Генерирует случайный цвет
 * @returns {string} HEX-код цвета
 */
function handleGenerateColor() {
  const { variants } = APP_CONFIG;
  const randomHex = () => variants[Math.floor(Math.random() * variants.length)];
  return '#' + Array(6).fill().map(randomHex).join('');
}

/**
 * Обрабатывает клик по кнопке копирования цвета
 */
async function handleCopyColorClick() {
  const { colorValue } = APP_STATE.elements;
  const color = colorValue.textContent;
  if (!color) return;

  try {
    await navigator.clipboard.writeText(color);
    APP_UTILS.showToast('Color copied to clipboard');
  } catch (error) {
    APP_UTILS.handleError('Failed to copy color', error);
  }
}

initApp();
