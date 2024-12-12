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

interface Config {
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
}

interface State {
  elements: {
    qrContainer: HTMLElement | null;
    qrForm: HTMLFormElement | null;
    qrGenerateButton: HTMLButtonElement | null;
    qrSaveButton: HTMLAnchorElement | null;
    qrImage: HTMLElement | null;
  };
}

interface Utils {
  renderDataAttributes: (element: string) => string;
  showToast: (message: string) => void;
}

/**
 * Класс, представляющий генератор QR-кодов
 */
class QRCodeGenerator {
  private config: Config;
  private state: State;
  private utils: Utils;

  /**
   * Создает экземпляр генератора QR-кодов
   */
  constructor() {
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

    this.state = {
      elements: {
        qrContainer: null,
        qrForm: null,
        qrGenerateButton: null,
        qrSaveButton: null,
        qrImage: null,
      },
    };

    this.utils = {
      renderDataAttributes: (element: string): string => element.slice(1, -1),
      showToast: (message: string): void => {
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
  private createAppHTML(): void {
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
  private initDOMElements(): void {
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
  private init(): void {
    this.createAppHTML();
    this.initDOMElements();
    if (this.state.elements.qrForm) {
      this.state.elements.qrForm.addEventListener('submit', this.handleQrFormSubmit.bind(this));
    }
  }

  /**
   * Обрабатывает отправку формы для генерации QR-кода
   * @param {Event} event - Событие отправки формы
   */
  private handleQrFormSubmit(event: Event): void {
    event.preventDefault();
    if (this.state.elements.qrImage) {
      this.state.elements.qrImage.innerHTML = '';
    }
    if (this.state.elements.qrContainer) {
      this.state.elements.qrContainer.classList.remove('max-h-[688px]', 'overflow-auto');
    }
    const formData = new FormData(event.target as HTMLFormElement);
    const text = formData.get('text') as string;
    const size = formData.get('size') as string;
    if (text.trim().length === 0) {
      this.utils.showToast('Please enter a text or URL');
      return;
    }
    this.updateUIButtonText('Generating QR Code...');
    this.generateQRCode({ text, size: parseInt(size) });
    this.updateQRCodeUI();
  }

  /**
   * Обновляет текст кнопки генерации QR-кода
   * @param {string} text - Новый текст кнопки
   */
  private updateUIButtonText(text: string): void {
    if (this.state.elements.qrGenerateButton) {
      this.state.elements.qrGenerateButton.textContent = text;
    }
  }

  /**
   * Обновляет UI после генерации QR-кода
   */
  private updateQRCodeUI(): void {
    setTimeout(() => {
      const imgElement = this.state.elements.qrImage?.querySelector('img');
      if (imgElement && this.state.elements.qrSaveButton && this.state.elements.qrContainer) {
        this.state.elements.qrSaveButton.href = imgElement.src;
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
  private generateQRCode({ text, size }: { text: string; size: number }): void {
    // @ts-ignore
    new QRCode('qrcode', {
      text: text,
      width: size,
      height: size,
    });
  }
}

new QRCodeGenerator();