/**
 * Этот код представляет собой генератор QR-кодов. Он позволяет пользователям
 * вводить текст или URL, выбирать цвет и размер QR-кода, а затем генерировать
 * и сохранять его. Код использует классовый подход для организации логики
 * и взаимодействует с DOM для создания пользовательского интерфейса.
 */

import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

/**
 * Интерфейс конфигурации генератора QR-кодов
 */
interface Config {
  /** Селектор корневого элемента */
  root: string;
  /** Объект с селекторами для различных элементов */
  selectors: {
    qrContainer: string;
    qrForm: string;
    qrCode: string;
    qrGenerate: string;
    qrSave: string;
  };
  /** Массив доступных размеров QR-кода */
  sizes: number[];
  /** Размер QR-кода по умолчанию */
  defaultSize: number;
}

/**
 * Интерфейс состояния генератора QR-кодов
 */
interface State {
  /** Объект с элементами DOM */
  elements: {
    qrContainer: HTMLElement | null;
    qrForm: HTMLFormElement | null;
    qrCode: HTMLCanvasElement | null;
    qrGenerate: HTMLButtonElement | null;
    qrSave: HTMLAnchorElement | null;
  };
}

/**
 * Интерфейс утилит генератора QR-кодов
 */
interface Utils {
  /** Функция для рендеринга data-атрибутов */
  renderDataAttributes: (element: string) => string;
  /** Функция для отображения уведомлений */
  showToast: (message: string) => void;
}

/**
 * Класс генератора QR-кодов
 */
class QRCodeGenerator {
  /** Конфигурация генератора */
  private readonly config: Config;
  /** Состояние генератора */
  private state: State;
  /** Утилиты генератора */
  private readonly utils: Utils;

  /**
   * Конструктор класса QRCodeGenerator
   */
  constructor() {
    this.config = {
      root: '#app',
      selectors: {
        qrContainer: '[data-qr-container]',
        qrForm: '[data-qr-form]',
        qrCode: '#qrcode',
        qrGenerate: '[data-qr-generate]',
        qrSave: '[data-qr-save]',
      },
      sizes: [100, 200, 300, 400, 500, 600, 700],
      defaultSize: 300,
    };

    this.state = {
      elements: {
        qrContainer: null,
        qrForm: null,
        qrCode: null,
        qrGenerate: null,
        qrSave: null,
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
   * Создает HTML-разметку приложения
   */
  private createAppHTML(): void {
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
   * Инициализирует DOM-элементы
   */
  private initDOMElements(): void {
    this.state.elements = {
      qrContainer: document.querySelector(this.config.selectors.qrContainer),
      qrForm: document.querySelector(this.config.selectors.qrForm) as HTMLFormElement,
      qrCode: document.querySelector(this.config.selectors.qrCode) as HTMLCanvasElement,
      qrGenerate: document.querySelector(this.config.selectors.qrGenerate) as HTMLButtonElement,
      qrSave: document.querySelector(this.config.selectors.qrSave) as HTMLAnchorElement,
    };
  }

  /**
   * Инициализирует приложение
   */
  private init(): void {
    this.createAppHTML();
    this.initDOMElements();
    this.state.elements.qrForm?.addEventListener('submit', this.handleQrFormSubmit.bind(this));
  }

  /**
   * Обрабатывает отправку формы генерации QR-кода
   * @param event - Событие отправки формы
   */
  private handleQrFormSubmit(event: Event): void {
    event.preventDefault();
    if (this.state.elements.qrCode) this.state.elements.qrCode.innerHTML = '';
    this.state.elements.qrContainer?.classList.remove('max-h-[730px]', 'overflow-auto');
    const formData = new FormData(event.target as HTMLFormElement);
    const { text, size, color } = Object.fromEntries(formData) as { text: string; size: string; color: string };
    if (text.trim().length === 0) {
      this.utils.showToast('Please enter a text or URL');
      return;
    }
    this.updateUIButtonText('Generating QR Code...');
    const qrData = this.generateQRCode({ text, size: parseInt(size), color });
    this.updateQRCodeUI(qrData);
  }

  /**
   * Обновляет текст кнопки генерации QR-кода
   * @param text - Новый текст кнопки
   */
  private updateUIButtonText(text: string): void {
    if (this.state.elements.qrGenerate) this.state.elements.qrGenerate.textContent = text;
  }

  /**
   * Генерирует QR-код
   * @param params - Параметры для генерации QR-кода
   * @returns Объект QRious с сгенерированным QR-кодом
   */
  private generateQRCode({ text, size, color }: { text: string; size: number; color: string }): QRious {
    return new QRious({
      element: this.state.elements.qrCode || undefined,
      backgroundAlpha: 1,
      foreground: color,
      foregroundAlpha: 0.8,
      level: 'H',
      size: size,
      value: text,
    });
  }

  /**
   * Обновляет UI после генерации QR-кода
   * @param qrCode - Объект QRious с сгенерированным QR-кодом
   */
  private updateQRCodeUI(qrCode: QRious): void {
    setTimeout(() => {
      if (this.state.elements.qrSave) this.state.elements.qrSave.href = qrCode.toDataURL();
      this.state.elements.qrContainer?.classList.add('max-h-[730px]', 'overflow-auto');
      this.updateUIButtonText('Generate QR Code');
    }, 1000);
  }
}

new QRCodeGenerator();