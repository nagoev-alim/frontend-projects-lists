/**
 * Этот код представляет собой приложение для генерации QR-кодов.
 * Он позволяет пользователю ввести текст или URL, выбрать размер QR-кода,
 * сгенерировать его и сохранить полученное изображение.
 */

import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

/**
 * Конфигурация приложения
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента приложения
 * @property {Object} selectors - Объект с селекторами элементов
 * @property {number[]} sizes - Массив доступных размеров QR-кода
 */
const APP_CONFIG = {
  root: '#app',
  selectors: {
    qrForm: '[data-qr-form]',
    qrGenerate: '[data-qr-generate]',
    qrResult: '[data-qr-result]',
    qrImage: '[data-qr-image]',
    qrSave: '[data-qr-save]',
  },
  sizes: [100, 200, 300, 400, 500, 600, 700],
};

/**
 * Состояние приложения
 * @typedef {Object} AppState
 * @property {Object} elements - Объект с DOM элементами
 */
const APP_STATE = {
  elements: {
    qrForm: null,
    qrGenerate: null,
    qrResult: null,
    qrImage: null,
    qrSave: null,
  },
};

/**
 * Утилиты приложения
 * @typedef {Object} AppUtils
 */
const APP_UTILS = {
  /**
   * Конфигурация для toast-уведомлений
   */
  toastConfig: {
    className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
    duration: 3000,
    gravity: 'bottom',
    position: 'center',
  },

  /**
   * Обрабатывает data-атрибуты для HTML
   * @param {string} element - Строка с data-атрибутом
   * @returns {string} Обработанная строка
   */
  renderDataAttributes: (element) => element.slice(1, -1),

  /**
   * Показывает toast-уведомление
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
 * Создает HTML структуру приложения
 */
function createAppHTML() {
  const {
    root,
    selectors: {
      qrForm,
      qrGenerate,
      qrResult,
      qrImage,
      qrSave,
    },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector(root);

  if (!rootElement) return;

  const optionsHTML = APP_CONFIG.sizes.map((size) => `<option ${size === 300 ? 'selected' : ''} value='${size}'>${size}x${size}</option>`).join('');

  rootElement.innerHTML = `
    <div class='grid gap-4 max-w-md w-full rounded border p-3 shadow'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>QR Code Generator</h1>
      <p>Paste a url or enter text to create QR code</p>
      <form class='grid gap-3' ${renderDataAttributes(qrForm)}>
        <input class='cursor-pointer border-2 px-3 py-2.5' type='text' name='text' placeholder='Enter text or url' />
        <select class='cursor-pointer border-2 px-3 py-2.5' name='size'>${optionsHTML}</select>
        <button class='border px-3 py-2.5 hover:bg-neutral-100' type='submit' ${renderDataAttributes(qrGenerate)}>Generate QR Code</button>
      </form>
      <div class='hidden grid gap-3' ${renderDataAttributes(qrResult)}>
        <img class='mx-auto' src='' alt='QR Code' ${renderDataAttributes(qrImage)}>
        <button class='border px-3 py-2.5 hover:bg-neutral-100' ${renderDataAttributes(qrSave)}>Save</button>
      </div>
    </div>`;
}

/**
 * Инициализирует DOM элементы
 */
function initDOMElements() {
  APP_STATE.elements = {
    qrForm: document.querySelector(APP_CONFIG.selectors.qrForm),
    qrGenerate: document.querySelector(APP_CONFIG.selectors.qrGenerate),
    qrResult: document.querySelector(APP_CONFIG.selectors.qrResult),
    qrImage: document.querySelector(APP_CONFIG.selectors.qrImage),
    qrSave: document.querySelector(APP_CONFIG.selectors.qrSave),
  };
}

/**
 * Инициализирует приложение
 */
function initApp() {
  createAppHTML();
  initDOMElements();
  APP_STATE.elements.qrForm.addEventListener('submit', handleQrFormSubmit);
  APP_STATE.elements.qrSave.addEventListener('click', handleQrSaveClick);
}

/**
 * Обрабатывает отправку формы
 * @param {Event} event - Событие отправки формы
 */
function handleQrFormSubmit(event) {
  event.preventDefault();
  const { text, size } = Object.fromEntries(new FormData(event.target));
  if (text.trim().length === 0) {
    APP_UTILS.showToast('Please enter text or URL');
    return false;
  }
  updateUIForGeneration('Generating QR Code');
  generateQRCode(text, size);
}

/**
 * Обновляет UI во время генерации QR-кода
 * @param {string} text - Текст для отображения
 */
function updateUIForGeneration(text) {
  APP_STATE.elements.qrGenerate.textContent = text;
}

/**
 * Генерирует QR-код
 * @param {string} text - Текст для QR-кода
 * @param {number} size - Размер QR-кода
 */
function generateQRCode(text, size) {
  APP_STATE.elements.qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`;
  APP_STATE.elements.qrImage.addEventListener('load', handleQRCodeLoad);
}

/**
 * Обрабатывает загрузку QR-кода
 */
function handleQRCodeLoad() {
  APP_STATE.elements.qrResult.classList.remove('hidden');
  updateUIForGeneration('Generate QR Code');
}

/**
 * Обрабатывает клик по кнопке сохранения
 */
async function handleQrSaveClick() {
  if (!APP_STATE.elements.qrImage.src) return;
  try {
    const imageBlob = await fetchImageAsBlob(APP_STATE.elements.qrImage.src);
    const imageURL = URL.createObjectURL(imageBlob);
    downloadImage(imageURL, 'QRCode');
  } catch (error) {
    APP_UTILS.handleError('Failed to save QR code. Please try again.', error);
  }
}

/**
 * Получает изображение как Blob
 * @param {string} url - URL изображения
 * @returns {Promise<Blob>} Blob изображения
 */
async function fetchImageAsBlob(url) {
  const response = await fetch(url);
  return response.blob();
}

/**
 * Скачивает изображение
 * @param {string} url - URL изображения
 * @param {string} filename - Имя файла
 */
function downloadImage(url, filename) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

initApp();