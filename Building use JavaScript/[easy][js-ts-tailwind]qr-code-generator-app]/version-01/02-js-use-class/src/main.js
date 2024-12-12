/**
 * Этот код представляет собой приложение для генерации QR-кодов.
 * Он позволяет пользователю ввести текст или URL, выбрать размер QR-кода,
 * сгенерировать его и сохранить полученное изображение.
 * Приложение использует внешний API для создания QR-кодов и предоставляет
 * простой пользовательский интерфейс для взаимодействия.
 */

import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

/**
 * Класс, представляющий генератор QR-кодов.
 */
class QRCodeGenerator {
  /**
   * Создает экземпляр генератора QR-кодов.
   */
  constructor() {
    /**
     * Конфигурация приложения.
     * @type {Object}
     */
    this.config = {
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
     * Состояние приложения.
     * @type {Object}
     */
    this.state = {
      elements: {
        qrForm: null,
        qrGenerate: null,
        qrResult: null,
        qrImage: null,
        qrSave: null,
      },
    };

    /**
     * Утилиты приложения.
     * @type {Object}
     */
    this.utils = {
      toastConfig: {
        className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
        duration: 3000,
        gravity: 'bottom',
        position: 'center',
      },
      /**
       * Форматирует атрибуты данных для HTML.
       * @param {string} element - Строка с атрибутом данных.
       * @returns {string} Отформатированная строка атрибута.
       */
      renderDataAttributes: (element) => element.slice(1, -1),
      /**
       * Отображает уведомление.
       * @param {string} message - Текст уведомления.
       */
      showToast: (message) => {
        Toastify({
          text: message,
          ...this.utils.toastConfig,
        }).showToast();
      },
      /**
       * Обрабатывает ошибки.
       * @param {string} message - Сообщение об ошибке.
       * @param {Error} [error] - Объект ошибки.
       */
      handleError: (message, error = null) => {
        this.utils.showToast(message);
        if (error) console.error(message, error);
      },
    };

    this.init();
  }

  /**
   * Создает HTML структуру приложения.
   */
  createAppHTML() {
    const {
      root, selectors: {
        qrForm,
        qrGenerate,
        qrResult,
        qrImage,
        qrSave,
      },
    } = this.config;
    const { renderDataAttributes } = this.utils;
    const rootElement = document.querySelector(root);

    if (!rootElement) return;
    const optionsHTML = this.config.sizes.map((size) => `<option ${size === 300 ? 'selected' : ''} value='${size}'>${size}x${size}</option>`).join('');

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
   * Инициализирует DOM элементы.
   */
  initDOMElements() {
    this.state.elements = {
      qrForm: document.querySelector(this.config.selectors.qrForm),
      qrGenerate: document.querySelector(this.config.selectors.qrGenerate),
      qrResult: document.querySelector(this.config.selectors.qrResult),
      qrImage: document.querySelector(this.config.selectors.qrImage),
      qrSave: document.querySelector(this.config.selectors.qrSave),
    };
  }

  /**
   * Инициализирует приложение.
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();

    this.state.elements.qrForm.addEventListener('submit', this.handleQrFormSubmit.bind(this));
    this.state.elements.qrSave.addEventListener('click', this.handleQrSaveClick.bind(this));
  }

  /**
   * Обрабатывает отправку формы.
   * @param {Event} event - Событие отправки формы.
   */
  handleQrFormSubmit(event) {
    event.preventDefault();
    const { text, size } = Object.fromEntries(new FormData(event.target));
    if (text.trim().length === 0) {
      this.utils.showToast('Please enter text or URL');
      return false;
    }
    this.updateUIForGeneration('Generating QR Code');
    this.generateQRCode(text, size);
  }

  /**
   * Обновляет UI во время генерации QR-кода.
   * @param {string} text - Текст для отображения.
   */
  updateUIForGeneration(text) {
    this.state.elements.qrGenerate.textContent = text;
  }

  /**
   * Генерирует QR-код.
   * @param {string} text - Текст для QR-кода.
   * @param {number} size - Размер QR-кода.
   */
  generateQRCode(text, size) {
    this.state.elements.qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`;
    this.state.elements.qrImage.addEventListener('load', this.handleQRCodeLoad.bind(this));
  }

  /**
   * Обрабатывает загрузку QR-кода.
   */
  handleQRCodeLoad() {
    this.state.elements.qrResult.classList.remove('hidden');
    this.updateUIForGeneration('Generate QR Code');
  }

  /**
   * Обрабатывает клик по кнопке сохранения.
   */
  async handleQrSaveClick() {
    if (!this.state.elements.qrImage.src) return;
    try {
      const imageBlob = await this.fetchImageAsBlob(this.state.elements.qrImage.src);
      const imageURL = URL.createObjectURL(imageBlob);
      this.downloadImage(imageURL, 'QRCode');
    } catch (error) {
      this.utils.handleError('Failed to save QR code. Please try again.', error);
    }
  }

  /**
   * Получает изображение как Blob.
   * @param {string} url - URL изображения.
   * @returns {Promise<Blob>} Blob изображения.
   */
  async fetchImageAsBlob(url) {
    const response = await fetch(url);
    return response.blob();
  }

  /**
   * Скачивает изображение.
   * @param {string} url - URL изображения.
   * @param {string} filename - Имя файла.
   */
  downloadImage(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

new QRCodeGenerator();