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
 * Класс QrCodeReader - основной класс приложения для чтения QR-кодов
 */
class QrCodeReader {
  /**
   * Создает экземпляр QrCodeReader
   */
  constructor() {
    /**
     * Конфигурация приложения
     * @type {Object}
     */
    this.config = {
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
     * @type {Object}
     */
    this.state = {
      elements: {
        qrReader: null,
        qrForm: null,
        qrFileInput: null,
        qrImage: null,
        qrUploadText: null,
        qrResult: null,
        qrClose: null,
        qrCopy: null,
      },
    };

    /**
     * Утилиты приложения
     * @type {Object}
     */
    this.utils = {
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
          ...this.utils.toastConfig,
        }).showToast();
      },
      /**
       * Обрабатывает ошибку и отображает уведомление
       * @param {string} message - Сообщение об ошибке
       * @param {Error} [error] - Объект ошибки
       */
      handleError: (message, error = null) => {
        this.utils.showToast(message);
        if (error) console.error(message, error);
      },
    };

    this.init();
  }

  /**
   * Создает HTML-разметку приложения
   */
  createAppHTML() {
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
    } = this.config;
    const { renderDataAttributes } = this.utils;
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
   * Инициализирует DOM-элементы
   */
  initDOMElements() {
    this.state.elements = {
      qrReader: document.querySelector(this.config.selectors.qrReader),
      qrForm: document.querySelector(this.config.selectors.qrForm),
      qrFileInput: document.querySelector(this.config.selectors.qrFileInput),
      qrImage: document.querySelector(this.config.selectors.qrImage),
      qrUploadText: document.querySelector(this.config.selectors.qrUploadText),
      qrResult: document.querySelector(this.config.selectors.qrResult),
      qrClose: document.querySelector(this.config.selectors.qrClose),
      qrCopy: document.querySelector(this.config.selectors.qrCopy),
    };
  }

  /**
   * Инициализирует приложение
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();
    this.state.elements.qrForm.addEventListener('click', () => this.state.elements.qrFileInput.click());
    this.state.elements.qrFileInput.addEventListener('change', this.handleFileInputChange.bind(this));
    this.state.elements.qrCopy.addEventListener('click', this.handleCopyClick.bind(this));
    this.state.elements.qrClose.addEventListener('click', this.updateQrFormUI.bind(this));
  }

  /**
   * Обновляет текст параграфа
   * @param {string} text - Новый текст
   */
  updateParagraphText(text) {
    this.state.elements.qrUploadText && (this.state.elements.qrUploadText.textContent = text);
  }

  /**
   * Обновляет UI формы QR-кода
   * @param {File} [file] - Файл изображения QR-кода
   * @param {string} [url] - URL, полученный из QR-кода
   */
  updateQrFormUI(file = null, url = null) {
    const { elements } = this.state;
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
  async getQrData(file, formData) {
    try {
      this.updateParagraphText('Scanning QR Code...');
      const response = await axios.post(this.config.url, formData);
      const url = response.data[0]?.symbol[0]?.data;

      if (!url) {
        throw new Error('Couldn\'t scan QR Code');
      }

      this.updateQrFormUI(file, url);
    } catch (error) {
      this.utils.handleError('Failed to scan QR Code', error);
      this.updateQrFormUI();
    } finally {
      this.updateParagraphText('Upload QR Code to Scan');
    }
  }

  /**
   * Обрабатывает изменение файла в input
   * @param {Event} event - Событие изменения файла
   */
  async handleFileInputChange({ target: { files } }) {
    const file = files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      await this.getQrData(file, formData);
    } catch (error) {
      this.utils.handleError('Failed to read QR code from file', error);
    }
  }

  /**
   * Обрабатывает клик по кнопке копирования
   */
  async handleCopyClick() {
    const clipboard = this.state.elements.qrResult.value.trim();
    if (!clipboard) return;

    try {
      await navigator.clipboard.writeText(clipboard);
      this.utils.showToast('Text copied to clipboard');
    } catch (error) {
      this.utils.handleError('Failed to copy text', error);
    }
  }
}

new QrCodeReader();
