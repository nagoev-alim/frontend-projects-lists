/**
 * Этот код представляет собой приложение для генерации QR-кодов.
 * Он позволяет пользователю ввести текст или URL, выбрать размер QR-кода,
 * сгенерировать его и сохранить полученное изображение.
 * Приложение реализовано в виде класса QRCodeGenerator, который инкапсулирует
 * всю логику работы с QR-кодами, управление состоянием и взаимодействие с DOM.
 */

import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

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
     * @type {Object}
     */
    this.state = {
      elements: {
        qrContainer: null,
        qrForm: null,
        qrGenerateButton: null,
        qrSaveButton: null,
        qrImage: null,
      },
    };

    /**
     * Утилитарные функции
     * @type {Object}
     */
    this.utils = {
      renderDataAttributes: (element) => element.slice(1, -1),
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
   * Создает HTML структуру приложения
   */
  createAppHTML() {
    const { root, selectors, sizes, defaultSize } = this.config;
    const { renderDataAttributes } = this.utils;
    const rootElement = document.querySelector(root);

    if (!rootElement) return;

    rootElement.innerHTML = `
      <div class='grid max-h-[288px] max-w-md w-full gap-4 overflow-hidden rounded border p-3 shadow transition-all' ${renderDataAttributes(selectors.qrContainer)}>
        <h1 class='text-center text-2xl font-bold md:text-4xl'>QR Code Generator</h1>
        <p class='text-center'>Paste a url or enter text to create QR code</p>
        <form class='grid gap-3' ${renderDataAttributes(selectors.qrForm)}>
          <input class='cursor-pointer border-2 px-3 py-2.5' type='text' name='text' placeholder='Enter text or url'/>
          <select class='cursor-pointer border-2 px-3 py-2.5' name='size'>
            ${sizes.map((index) => `<option ${index === defaultSize ? 'selected' : ''} value='${index}'>${index}x${index}</option>`).join('')}
          </select>
          <button class='border px-3 py-2.5 hover:bg-neutral-100' type='submit' ${renderDataAttributes(selectors.qrGenerateButton)}>Generate QR Code</button>
        </form>
        <div class='grid gap-3'>
          <div class='mx-auto' id='qrcode'></div>
          <a class='flex items-center justify-center border px-3 py-2.5 hover:bg-neutral-100' href='#' download='qrcode' ${renderDataAttributes(selectors.qrSaveButton)}>Save Image</a>
        </div>
      </div>`;
  }

  /**
   * Инициализирует DOM элементы
   */
  initDOMElements() {
    const { selectors } = this.config;
    this.state.elements = {
      qrContainer: document.querySelector(selectors.qrContainer),
      qrForm: document.querySelector(selectors.qrForm),
      qrGenerateButton: document.querySelector(selectors.qrGenerateButton),
      qrSaveButton: document.querySelector(selectors.qrSaveButton),
      qrImage: document.querySelector(selectors.qrImage),
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
    this.state.elements.qrImage.innerHTML = '';
    this.state.elements.qrContainer.classList.remove('max-h-[688px]', 'overflow-auto');
    const { text, size } = Object.fromEntries(new FormData(event.target));
    if (text.trim().length === 0) {
      this.utils.showToast('Please enter a text or URL');
      return false;
    }
    this.updateUIButtonText('Generating QR Code...');
    this.generateQRCode({ text, size });
    this.updateQRCodeUI();
  }

  /**
   * Обновляет текст кнопки генерации QR-кода
   * @param {string} text - Новый текст кнопки
   */
  updateUIButtonText(text) {
    this.state.elements.qrGenerateButton.textContent = text;
  }

  /**
   * Обновляет UI после генерации QR-кода
   */
  updateQRCodeUI() {
    setTimeout(() => {
      const imgSrc = this.state.elements.qrImage.querySelector('img')?.src;
      if (imgSrc !== undefined) {
        this.state.elements.qrSaveButton.href = imgSrc;
        this.state.elements.qrContainer.classList.add('max-h-[688px]', 'overflow-auto');
        this.updateUIButtonText('Generate QR Code');
      }
    }, 1000);
  }

  /**
   * Генерирует QR-код
   * @param {Object} params - Параметры для генерации QR-кода
   * @param {string} params.text - Текст для кодирования
   * @param {number} params.size - Размер QR-кода
   */
  generateQRCode({ text, size }) {
    new QRCode('qrcode', {
      text: text,
      width: size,
      height: size,
    });
  }
}

new QRCodeGenerator();