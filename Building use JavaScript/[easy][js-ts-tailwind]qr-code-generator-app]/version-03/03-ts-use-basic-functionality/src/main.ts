/**
 * Этот код представляет собой приложение для генерации QR-кодов. Он позволяет пользователю
 * вводить текст или URL, выбирать размер QR-кода и генерировать его. Приложение также
 * предоставляет возможность сохранения сгенерированного QR-кода в виде изображения.
 */

import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

/**
 * Конфигурация приложения
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента
 * @property {Object} selectors - Объект с селекторами элементов
 * @property {number[]} sizes - Массив доступных размеров QR-кода
 * @property {number} defaultSize - Размер QR-кода по умолчанию
 */
type AppConfig = {
  root: string;
  selectors: {
    qrContainer: string;
    qrForm: string;
    qrGenerateButton: string;
    qrSaveButton: string;
    qrImage: string;
  };
  sizes: number[];
  defaultSize: number;
};

/**
 * Состояние приложения
 * @typedef {Object} AppState
 * @property {Object} elements - Объект с ссылками на DOM-элементы
 */
type AppState = {
  elements: {
    qrContainer: HTMLElement | null;
    qrForm: HTMLFormElement | null;
    qrGenerateButton: HTMLButtonElement | null;
    qrSaveButton: HTMLAnchorElement | null;
    qrImage: HTMLElement | null;
  };
};

/**
 * Утилиты приложения
 * @typedef {Object} AppUtils
 * @property {function} renderDataAttributes - Функция для рендеринга data-атрибутов
 * @property {function} showToast - Функция для отображения уведомлений
 */
type AppUtils = {
  renderDataAttributes: (element: string) => string;
  showToast: (message: string) => void;
};

/**
 * Конфигурация приложения
 * @type {AppConfig}
 */
const APP_CONFIG: AppConfig = {
  root: '#app',
  selectors: {
    qrContainer: '[data-qr-container]',
    qrForm: '[data-qr-form]',
    qrGenerateButton: '[data-qr-generate]',
    qrSaveButton: '[data-qr-save]',
    qrImage: '#qrcode',
  },
  sizes: [100, 200, 300, 400, 500, 600, 700],
  defaultSize: 300,
};

/**
 * Состояние приложения
 * @type {AppState}
 */
const APP_STATE: AppState = {
  elements: {
    qrContainer: null,
    qrForm: null,
    qrGenerateButton: null,
    qrSaveButton: null,
    qrImage: null,
  },
};

/**
 * Утилиты приложения
 * @type {AppUtils}
 */
const APP_UTILS: AppUtils = {
  renderDataAttributes: (element) => element.slice(1, -1),
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
function createAppHTML(): void {
  const {
    root,
    selectors: {
      qrContainer,
      qrForm,
      qrGenerateButton,
      qrSaveButton,
    },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div
      class='grid max-h-[288px] max-w-md w-full gap-4 overflow-hidden rounded border p-3 shadow transition-all' ${renderDataAttributes(qrContainer)}>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>QR Code Generator</h1>
      <p class='text-center'>Paste a url or enter text to create QR code</p>
      <form class='grid gap-3' ${renderDataAttributes(qrForm)}>
        <input class='cursor-pointer border-2 px-3 py-2.5' type='text' name='text' placeholder='Enter text or url'
        />
        <select class='cursor-pointer border-2 px-3 py-2.5' name='size'>
          ${APP_CONFIG.sizes.map((index) => `<option ${index === APP_CONFIG.defaultSize ? 'selected' : ''} value='${index}'>${index}x${index}</option>`).join('')}
        </select>
        <button class='border px-3 py-2.5 hover:bg-neutral-100' type='submit' ${renderDataAttributes(qrGenerateButton)}>Generate QR Code</button>
      </form>
      <div class='grid gap-3'>
        <div class='mx-auto' id='qrcode'></div>
        <a class='flex items-center justify-center border px-3 py-2.5 hover:bg-neutral-100' href='#' download='qrcode' ${renderDataAttributes(qrSaveButton)}>Save Image</a>
      </div>
    </div>
  `;
}

/**
 * Инициализирует DOM-элементы
 */
function initDOMElements(): void {
  APP_STATE.elements = {
    qrContainer: document.querySelector(APP_CONFIG.selectors.qrContainer),
    qrForm: document.querySelector(APP_CONFIG.selectors.qrForm),
    qrGenerateButton: document.querySelector(APP_CONFIG.selectors.qrGenerateButton),
    qrSaveButton: document.querySelector(APP_CONFIG.selectors.qrSaveButton),
    qrImage: document.querySelector(APP_CONFIG.selectors.qrImage),
  };
}

/**
 * Инициализирует приложение
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();

  if (APP_STATE.elements.qrForm) {
    APP_STATE.elements.qrForm.addEventListener('submit', handleQrFormSubmit);
  }
}

/**
 * Обрабатывает отправку формы для генерации QR-кода
 * @param {Event} event - Событие отправки формы
 */
function handleQrFormSubmit(event: Event): void {
  event.preventDefault();
  if (!APP_STATE.elements.qrImage) return;

  APP_STATE.elements.qrImage.innerHTML = '';
  if (APP_STATE.elements.qrContainer) {
    APP_STATE.elements.qrContainer.classList.remove('max-h-[688px]', 'overflow-auto');
  }

  const form = event.target as HTMLFormElement;
  const { text, size } = Object.fromEntries(new FormData(form));

  if (typeof text !== 'string' || text.trim().length === 0) {
    APP_UTILS.showToast('Please enter a text or URL');
    return;
  }

  updateUIButtonText('Generating QR Code...');
  if (typeof size === 'string') {
    generateQRCode({ text, size: parseInt(size) });
  }
  updateQRCodeUI();
}

/**
 * Обновляет текст кнопки генерации QR-кода
 * @param {string} text - Новый текст кнопки
 */
function updateUIButtonText(text: string): void {
  if (APP_STATE.elements.qrGenerateButton) {
    APP_STATE.elements.qrGenerateButton.textContent = text;
  }
}

/**
 * Обновляет UI после генерации QR-кода
 */
function updateQRCodeUI(): void {
  setTimeout(() => {
    const imgSrc = APP_STATE.elements.qrImage?.querySelector('img')?.src;
    if (imgSrc !== undefined && APP_STATE.elements.qrSaveButton && APP_STATE.elements.qrContainer) {
      APP_STATE.elements.qrSaveButton.href = imgSrc;
      APP_STATE.elements.qrContainer.classList.add('max-h-[688px]', 'overflow-auto');
      updateUIButtonText('Generate QR Code');
    }
  }, 1000);
}

/**
 * Генерирует QR-код
 * @param {Object} params - Параметры для генерации QR-кода
 * @param {string} params.text - Текст для кодирования
 * @param {number} params.size - Размер QR-кода
 */
function generateQRCode({ text, size }: { text: string; size: number }): void {
  // @ts-ignore
  new QRCode('qrcode', {
    text: text,
    width: size,
    height: size,
  });
}

initApp();