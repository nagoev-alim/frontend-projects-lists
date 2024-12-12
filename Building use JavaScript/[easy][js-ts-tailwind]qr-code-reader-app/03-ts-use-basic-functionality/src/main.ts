/**
 * @fileoverview Приложение для чтения QR-кодов
 *
 * Это приложение позволяет пользователям загружать изображения QR-кодов,
 * сканировать их содержимое и отображать результаты. Оно также предоставляет
 * функциональность для копирования результатов в буфер обмена.
 *
 */
import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';
import { icons } from 'feather-icons';

/**
 * @interface AppConfig
 * @description Конфигурация приложения для чтения QR-кодов
 */
interface AppConfig {
  /** Корневой селектор для приложения */
  root: string;
  /** Объект с селекторами элементов DOM */
  selectors: {
    [key: string]: string;
  };
  /** URL API для сканирования QR-кодов */
  url: string;
}

/**
 * @constant APP_CONFIG
 * @type {AppConfig}
 * @description Объект конфигурации приложения
 */
const APP_CONFIG: AppConfig = {
  root: '#app',
  selectors: {
    qrReader: '[data-qr-reader]',
    qrForm: '[data-qr-form]',
    qrFileInput: '[data-qr-file-input]',
    qrImage: '[data-qr-image]',
    qrUploadText: '[data-qr-upload-text]',
    qrResult: '[data-qr-result]',
    qrClose: '[data-qr-close]',
    qrCopy: '[data-qr-copy]',
  },
  url: 'https://api.qrserver.com/v1/read-qr-code/',
};

/**
 * @interface AppState
 * @description Состояние приложения
 */
interface AppState {
  /** Объект с элементами DOM */
  elements: {
    [key: string]: HTMLElement | null;
  };
}

/**
 * @constant APP_STATE
 * @type {AppState}
 * @description Объект состояния приложения
 */
const APP_STATE: AppState = {
  elements: {},
};

/**
 * @interface AppUtils
 * @description Утилиты приложения
 */
interface AppUtils {
  /** Функция для рендеринга data-атрибутов */
  renderDataAttributes: (element: string) => string;
  /** Конфигурация для уведомлений */
  toastConfig: {
    [key: string]: string | number;
  };
  /** Функция для отображения уведомлений */
  showToast: (message: string) => void;
  /** Функция для обработки ошибок */
  handleError: (message: string, error?: any) => void;
}

/**
 * @constant APP_UTILS
 * @type {AppUtils}
 * @description Объект с утилитами приложения
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
      qrReader,
      qrForm,
      qrFileInput,
      qrImage,
      qrUploadText,
      qrResult,
      qrClose,
      qrCopy,
    },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='grid w-full max-w-md gap-4 rounded border bg-white p-3 shadow'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>QR Reader</h1>
      <div class='grid max-h-[200px] gap-3 overflow-hidden' ${renderDataAttributes(qrReader)}>
        <form class='min-h-[200px] cursor-pointer grid place-content-center rounded border-2 border-dashed border-black transition-all' ${renderDataAttributes(qrForm)}>
          <input type='file' class='visually-hidden' ${renderDataAttributes(qrFileInput)}>
          <img src='#' alt='qr-code' class='hidden h-[190px] object-cover' ${renderDataAttributes(qrImage)}>
          <div class='grid place-items-center gap-2'>
            ${icons['upload-cloud'].toSvg()}
            <p ${renderDataAttributes(qrUploadText)}>Upload QR Code to Read</p>
          </div>
        </form>
        <div class='flex grid grid-cols-2 gap-3'>
          <textarea class='col-span-2 min-h-[150px] w-full resize-none rounded border bg-slate-50 px-3 py-2 focus:border-blue-400 focus:outline-none' spellcheck='false' disabled ${renderDataAttributes(qrResult)}></textarea>
          <button class='border px-3 py-2 hover:bg-slate-50' ${renderDataAttributes(qrClose)}>Close</button>
          <button class='border px-3 py-2 hover:bg-slate-50' ${renderDataAttributes(qrCopy)}>Copy</button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Инициализирует элементы DOM и сохраняет их в APP_STATE
 */
function initDOMElements(): void {
  Object.entries(APP_CONFIG.selectors).forEach(([key, selector]) => {
    APP_STATE.elements[key] = document.querySelector(selector);
  });
}

/**
 * Инициализирует приложение
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();
  APP_STATE.elements.qrForm?.addEventListener('click', () => APP_STATE.elements.qrFileInput?.click());
  APP_STATE.elements.qrFileInput?.addEventListener('change', handleFileInputChange);
  APP_STATE.elements.qrCopy?.addEventListener('click', handleCopyClick);
  APP_STATE.elements.qrClose?.addEventListener('click', () => updateQrFormUI());
}

/**
 * Обновляет текст параграфа с информацией о состоянии загрузки QR-кода.
 * @param {string} text - Новый текст для отображения.
 * @returns {void}
 */
function updateParagraphText(text: string): void {
  if (APP_STATE.elements.qrUploadText) {
    APP_STATE.elements.qrUploadText.textContent = text;
  }
}

/**
 * Обновляет пользовательский интерфейс формы QR-кода после сканирования или сброса.
 * @param {File | null} file - Файл с изображением QR-кода или null при сбросе.
 * @param {string | null} url - URL, полученный из QR-кода, или null при сбросе.
 * @returns {void}
 */
function updateQrFormUI(file: File | null = null, url: string | null = null): void {
  const { elements } = APP_STATE;
  const isQrCodeScanned = Boolean(file && url);

  if (elements.qrResult instanceof HTMLTextAreaElement) {
    elements.qrResult.value = isQrCodeScanned ? url || '' : '';
  }

  if (elements.qrImage instanceof HTMLImageElement) {
    elements.qrImage.src = isQrCodeScanned && file ? URL.createObjectURL(file) : '#';
    elements.qrImage.classList.toggle('hidden', !isQrCodeScanned);
  }

  if (elements.qrForm instanceof HTMLFormElement) {
    const formDiv = elements.qrForm.querySelector('div');
    formDiv?.classList.toggle('hidden', isQrCodeScanned);

    if (!isQrCodeScanned) {
      elements.qrForm.reset();
    }
  }

  if (elements.qrReader instanceof HTMLElement) {
    elements.qrReader.classList.toggle('max-h-[420px]', isQrCodeScanned);
    elements.qrReader.classList.toggle('max-h-[200px]', !isQrCodeScanned);
  }
}

/**
 * Получает и обрабатывает данные QR-кода из загруженного файла.
 * @async
 * @param {File} file - Файл с изображением QR-кода.
 * @param {FormData} formData - Данные формы для отправки на сервер.
 * @throws {Error} Выбрасывает ошибку, если не удалось отсканировать QR-код.
 * @returns {Promise<void>}
 */
async function getQrData(file: File, formData: FormData): Promise<void> {
  try {
    updateParagraphText('Scanning QR Code...');
    const response = await axios.post<Array<{ symbol: Array<{ data: string }> }>>(APP_CONFIG.url, formData);
    const url = response.data[0]?.symbol[0]?.data;

    if (!url) {
      throw new Error('Couldn\'t scan QR Code');
    }

    updateQrFormUI(file, url);
  } catch (error: unknown) {
    APP_UTILS.handleError('Failed to scan QR Code', error);
    updateQrFormUI();
  } finally {
    updateParagraphText('Upload QR Code to Scan');
  }
}

/**
 * Обрабатывает изменение файлового ввода для QR-кода.
 * @async
 * @param {Event} event - Событие изменения файлового ввода.
 * @throws {Error} Выбрасывает ошибку, если не удалось прочитать QR-код из файла.
 * @returns {Promise<void>}
 */
async function handleFileInputChange(event: Event): Promise<void> {
  const { files } = event.target as HTMLInputElement;
  if (!files || files.length === 0) return;

  const file = files[0];
  if (!file) return;

  try {
    const formData = new FormData();
    formData.append('file', file);
    await getQrData(file, formData);
  } catch (error) {
    APP_UTILS.handleError('Failed to read QR code from file', error);
  }
}

/**
 * Обрабатывает нажатие на кнопку копирования текста QR-кода.
 * Копирует текст из результата сканирования QR-кода в буфер обмена.
 * @async
 * @returns {Promise<void>}
 * @throws {Error} Выбрасывает ошибку, если не удалось скопировать текст в буфер обмена.
 */
async function handleCopyClick(): Promise<void> {
  const clipboard = (APP_STATE.elements.qrResult as HTMLTextAreaElement).value.trim();
  if (!clipboard) return;

  try {
    await navigator.clipboard.writeText(clipboard);
    APP_UTILS.showToast('Text copied to clipboard');
  } catch (error: unknown) {
    APP_UTILS.handleError('Failed to copy text', error);
  }
}

// Инициализация приложения
initApp();
