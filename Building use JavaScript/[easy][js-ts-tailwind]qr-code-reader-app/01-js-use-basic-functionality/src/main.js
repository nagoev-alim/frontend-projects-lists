/**
 * @fileoverview Приложение для чтения QR-кодов с использованием API QR Code Reader.
 * Позволяет загружать изображение QR-кода, сканировать его и отображать результат.
 * Использует Axios для HTTP-запросов, Toastify для уведомлений и Feather Icons для иконок.
 */

import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';
import { icons } from 'feather-icons';

/**
 * Конфигурация приложения
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента
 * @property {Object.<string, string>} selectors - Селекторы элементов DOM
 * @property {string} url - URL API для чтения QR-кодов
 */
const APP_CONFIG = {
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
 * Состояние приложения
 * @typedef {Object} AppState
 * @property {Object.<string, HTMLElement>} elements - Ссылки на элементы DOM
 */
const APP_STATE = {
  elements: {},
};

/**
 * Утилиты приложения
 * @typedef {Object} AppUtils
 * @property {Function} renderDataAttributes - Функция для рендеринга data-атрибутов
 * @property {Object} toastConfig - Конфигурация для Toastify
 * @property {Function} showToast - Функция для отображения уведомлений
 * @property {Function} handleError - Функция для обработки ошибок
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
   * Отображает уведомление
   * @param {string} message - Текст уведомления
   */
  showToast: (message) => {
    Toastify({
      text: message,
      ...APP_UTILS.toastConfig,
    }).showToast();
  },
  /**
   * Обрабатывает ошибку и отображает уведомление
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
 * Инициализирует элементы DOM в состоянии приложения
 */
function initDOMElements() {
  Object.entries(APP_CONFIG.selectors).forEach(([key, selector]) => {
    APP_STATE.elements[key] = document.querySelector(selector);
  });
}

/**
 * Инициализирует приложение
 */
function initApp() {
  createAppHTML();
  initDOMElements();
  APP_STATE.elements.qrForm.addEventListener('click', () => APP_STATE.elements.qrFileInput.click());
  APP_STATE.elements.qrFileInput.addEventListener('change', handleFileInputChange);
  APP_STATE.elements.qrCopy.addEventListener('click', handleCopyClick);
  APP_STATE.elements.qrClose.addEventListener('click', updateQrFormUI);
}

/**
 * Обновляет текст параграфа
 * @param {string} text - Новый текст
 */
function updateParagraphText(text) {
  APP_STATE.elements.qrUploadText && (APP_STATE.elements.qrUploadText.textContent = text);
}

/**
 * Обновляет UI формы QR-кода
 * @param {File} [file] - Файл изображения QR-кода
 * @param {string} [url] - URL, полученный из QR-кода
 */
function updateQrFormUI(file = null, url = null) {
  const { elements } = APP_STATE;
  const isQrCodeScanned = file && url;

  elements.qrResult.value = isQrCodeScanned ? url : '';
  elements.qrImage.src = isQrCodeScanned ? URL.createObjectURL(file) : '#';
  elements.qrImage.classList.toggle('hidden', !isQrCodeScanned);

  const formDiv = elements.qrForm.querySelector('div');
  formDiv?.classList.toggle('hidden', isQrCodeScanned);

  if (!isQrCodeScanned) {
    elements.qrForm.reset();
  }

  elements.qrReader.classList.toggle('max-h-[420px]', isQrCodeScanned);
  elements.qrReader.classList.toggle('max-h-[200px]', !isQrCodeScanned);
}

/**
 * Получает данные QR-кода
 * @param {File} file - Файл изображения QR-кода
 * @param {FormData} formData - Данные формы для отправки на сервер
 */
async function getQrData(file, formData) {
  try {
    updateParagraphText('Scanning QR Code...');
    const response = await axios.post(APP_CONFIG.url, formData);
    const url = response.data[0]?.symbol[0]?.data;

    if (!url) {
      throw new Error('Couldn\'t scan QR Code');
    }

    updateQrFormUI(file, url);
  } catch (error) {
    APP_UTILS.handleError('Failed to scan QR Code', error);
    updateQrFormUI();
  } finally {
    updateParagraphText('Upload QR Code to Scan');
  }
}

/**
 * Обработчик изменения файла ввода
 * @param {Event} event - Событие изменения файла
 */
async function handleFileInputChange({ target: { files } }) {
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
 * Обработчик нажатия кнопки копирования
 */
async function handleCopyClick() {
  const clipboard = APP_STATE.elements.qrResult.value.trim();
  if (!clipboard) return;

  try {
    await navigator.clipboard.writeText(clipboard);
    APP_UTILS.showToast('Text copied to clipboard');
  } catch (error) {
    APP_UTILS.handleError('Failed to copy text', error);
  }
}

initApp();
