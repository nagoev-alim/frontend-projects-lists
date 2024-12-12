/**
 * Этот код представляет собой приложение для генерации QR-кодов.
 * Он позволяет пользователям вводить текст или URL, выбирать цвет и размер,
 * а затем генерировать и сохранять QR-код на основе этих данных.
 * Приложение использует классовый подход для организации кода и
 * библиотеки Toastify для уведомлений и QRious для генерации QR-кодов.
 */

import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import QRious from 'qrious';

/**
 * Класс, представляющий генератор QR-кодов
 */
class QRCodeGenerator {
  /**
   * Создает экземпляр генератора QR-кодов
   */
  constructor() {
    /**
     * Конфигурация приложения
     * @type {Object}
     */
    this.config = {
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
     * Состояние приложения
     * @type {Object}
     */
    this.state = {
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
     * Утилитарные функции
     * @type {Object}
     */
    this.utils = {
      /**
       * Добавляет ведущий ноль к числу
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
       * Показывает уведомление
       * @param {string} message - Текст уведомления
       */
      showToast: (message) => {
        Toastify({
          text: message,
          className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
          duration: 3000,
          gravity: 'bottom',
          position: 'center',
        }).showToast();
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
      selectors: { qrContainer, qrForm, qrGenerate, qrSave },
      sizes,
      defaultSize,
    } = this.config;
    const { renderDataAttributes } = this.utils;
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
   * Инициализирует элементы DOM
   */
  initDOMElements() {
    this.state.elements = {
      qrContainer: document.querySelector(this.config.selectors.qrContainer),
      qrForm: document.querySelector(this.config.selectors.qrForm),
      qrCode: document.querySelector(this.config.selectors.qrCode),
      qrGenerate: document.querySelector(this.config.selectors.qrGenerate),
      qrSave: document.querySelector(this.config.selectors.qrSave),
    };
  }

  /**
   * Инициализирует приложение
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();
    this.state.elements.qrForm.addEventListener('submit', this.handleQrFormSubmit.bind(this));
  }

  /**
   * Обрабатывает отправку формы для генерации QR-кода
   * @param {Event} event - Событие отправки формы
   */
  handleQrFormSubmit(event) {
    event.preventDefault();
    this.state.elements.qrCode.innerHTML = '';
    this.state.elements.qrContainer.classList.remove('max-h-[730px]', 'overflow-auto');
    const { text, size, color } = Object.fromEntries(new FormData(event.target));
    if (text.trim().length === 0) {
      this.utils.showToast('Please enter a text or URL');
      return false;
    }
    this.updateUIButtonText('Generating QR Code...');
    const qrData = this.generateQRCode({ text, size, color });
    this.updateQRCodeUI(qrData);
  }

  /**
   * Обновляет текст кнопки генерации
   * @param {string} text - Новый текст кнопки
   */
  updateUIButtonText(text) {
    this.state.elements.qrGenerate.textContent = text;
  }

  /**
   * Генерирует QR-код
   * @param {Object} params - Параметры для генерации QR-кода
   * @param {string} params.text - Текст для кодирования
   * @param {number} params.size - Размер QR-кода
   * @param {string} params.color - Цвет QR-кода
   * @returns {QRious} Объект QRious с сгенерированным QR-кодом
   */
  generateQRCode({ text, size, color }) {
    return new QRious({
      element: this.state.elements.qrCode,
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
  updateQRCodeUI(qrCode) {
    setTimeout(() => {
      this.state.elements.qrSave.href = qrCode.toDataURL();
      this.state.elements.qrContainer.classList.add('max-h-[730px]', 'overflow-auto');
      this.updateUIButtonText('Generate QR Code');
    }, 1000);
  }
}

new QRCodeGenerator();