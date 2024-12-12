/**
 * Этот код представляет собой приложение для генерации QR-кодов.
 * Он позволяет пользователям вводить текст или URL, выбирать цвет и размер,
 * а затем генерировать и сохранять QR-код на основе этих данных.
 */

import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import QRious from 'qrious';

/**
 * Объект конфигурации приложения
 * @type {Object}
 */
const APP_CONFIG = {
  /** Корневой элемент приложения */
  root: '#app',
  /** Селекторы для различных элементов DOM */
  selectors: {
    qrContainer: '[data-qr-container]',
    qrForm: '[data-qr-form]',
    qrCode: '#qrcode',
    qrGenerate: '[data-qr-generate]',
    qrSave: '[data-qr-save]',
  },
  /** Доступные размеры QR-кода */
  sizes: [100, 200, 300, 400, 500, 600, 700],
  /** Размер QR-кода по умолчанию */
  defaultSize: 300,
};

/**
 * Объект состояния приложения
 * @type {Object}
 */
const APP_STATE = {
  /** Элементы DOM */
  elements: {
    qrContainer: null,
    qrForm: null,
    qrCode: null,
    qrGenerate: null,
    qrSave: null,
  },
};

/**
 * Объект с утилитарными функциями
 * @type {Object}
 */
const APP_UTILS = {
  /**
   * Добавляет ведущий ноль к числу, если оно меньше 10
   * @param {number} num - Число для форматирования
   * @returns {string} Отформатированное число
   */
  addLeadingZero: (num) => num.toString().padStart(2, '0'),

  /**
   * Удаляет квадратные скобки из строки с data-атрибутом
   * @param {string} element - Строка с data-атрибутом
   * @returns {string} Строка без квадратных скобок
   */
  renderDataAttributes: (element) => element.slice(1, -1),

  /**
   * Показывает уведомление с заданным сообщением
   * @param {string} message - Текст уведомления
   */
  showToast: (message) => {
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
 * Создает HTML-разметку приложения
 */
function createAppHTML() {
  const {
    root,
    selectors: { qrContainer, qrForm, qrGenerate, qrSave },
    sizes,
    defaultSize,
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='max-h-[340px] max-w-md w-full overflow-hidden rounded border p-3 shadow transition-all grid gap-4' ${renderDataAttributes(qrContainer)}>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>QR Code Generator</h1>
      <p class='text-center'>Paste a url or enter text to create QR code</p>
      <form class='grid gap-3' ${renderDataAttributes(qrForm)}>
        <input class='cursor-pointer rounded border-2 px-3 py-2.5' type='text' name='text' placeholder='Enter text or url' />
        <input class='h-10 w-full cursor-pointer rounded' type='color' name='color' value='#000'>
        <select class='cursor-pointer border-2 px-3 py-2.5' name='size'>
          ${sizes.map((index) => `<option ${index === defaultSize ? 'selected' : ''} value='${index}'>${index}x${index}</option>`).join('')}
        </select>
        <button class='hover:bg-neutral-100 border px-3 py-2.5' type='submit' ${renderDataAttributes(qrGenerate)}>Generate QR Code</button>
      </form>
      <div class='grid gap-3'>
        <canvas class='mx-auto' id='qrcode'></canvas>
        <a class='flex items-center justify-center hover:bg-neutral-100 border px-3 py-2.5' href='#' download='qrcode' ${renderDataAttributes(qrSave)}>Save Image</a>
      </div>
    </div>
  `;
}

/**
 * Инициализирует элементы DOM в объекте состояния приложения
 */
function initDOMElements() {
  APP_STATE.elements = {
    qrContainer: document.querySelector(APP_CONFIG.selectors.qrContainer),
    qrForm: document.querySelector(APP_CONFIG.selectors.qrForm),
    qrCode: document.querySelector(APP_CONFIG.selectors.qrCode),
    qrGenerate: document.querySelector(APP_CONFIG.selectors.qrGenerate),
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
}

/**
 * Обрабатывает отправку формы для генерации QR-кода
 * @param {Event} event - Событие отправки формы
 */
function handleQrFormSubmit(event) {
  event.preventDefault();
  APP_STATE.elements.qrCode.innerHTML = '';
  APP_STATE.elements.qrContainer.classList.remove('max-h-[730px]', 'overflow-auto');
  const { text, size, color } = Object.fromEntries(new FormData(event.target));
  if (text.trim().length === 0) {
    APP_UTILS.showToast('Please enter a text or URL');
    return false;
  }
  updateUIButtonText('Generating QR Code...');
  const qrData = generateQRCode({ text, size, color });
  updateQRCodeUI(qrData);
}

/**
 * Обновляет текст кнопки генерации QR-кода
 * @param {string} text - Новый текст кнопки
 */
function updateUIButtonText(text) {
  APP_STATE.elements.qrGenerate.textContent = text;
}

/**
 * Генерирует QR-код на основе переданных параметров
 * @param {Object} params - Параметры для генерации QR-кода
 * @param {string} params.text - Текст или URL для кодирования
 * @param {number} params.size - Размер QR-кода
 * @param {string} params.color - Цвет QR-кода
 * @returns {QRious} Объект QRious с сгенерированным QR-кодом
 */
function generateQRCode({ text, size, color }) {
  return new QRious({
    element: APP_STATE.elements.qrCode,
    backgroundAlpha: 1,
    foreground: `${color}`,
    foregroundAlpha: 0.8,
    level: 'H',
    size: Number(size),
    value: text,
  });
}

/**
 * Обновляет UI после генерации QR-кода
 * @param {QRious} qrCode - Объект QRious с сгенерированным QR-кодом
 */
function updateQRCodeUI(qrCode) {
  setTimeout(() => {
    APP_STATE.elements.qrSave.href = qrCode.toDataURL();
    APP_STATE.elements.qrContainer.classList.add('max-h-[730px]', 'overflow-auto');
    updateUIButtonText('Generate QR Code');
  }, 1000);
}

initApp();