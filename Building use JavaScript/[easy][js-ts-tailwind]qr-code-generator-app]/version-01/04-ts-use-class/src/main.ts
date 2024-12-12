/**
 * Этот код реализует генератор QR-кодов с веб-интерфейсом.
 * Он позволяет пользователям вводить текст или URL, выбирать размер QR-кода,
 * генерировать QR-код и сохранять его как изображение.
 */

import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

/**
 * Интерфейс для конфигурации приложения
 */
interface Config {
  /** Селектор корневого элемента */
  root: string;
  /** Объект с селекторами элементов */
  selectors: {
    [key: string]: string;
  };
  /** Массив доступных размеров QR-кода */
  sizes: number[];
}

/**
 * Интерфейс для хранения состояния приложения
 */
interface State {
  /** Объект с элементами DOM */
  elements: {
    [key: string]: HTMLElement | null;
  };
}

/**
 * Интерфейс для утилит приложения
 */
interface Utils {
  /** Конфигурация для всплывающих уведомлений */
  toastConfig: {
    className: string;
    duration: number;
    gravity: string;
    position: string;
  };
  /** Функция для рендеринга data-атрибутов */
  renderDataAttributes: (element: string) => string;
  /** Функция для показа всплывающих уведомлений */
  showToast: (message: string) => void;
  /** Функция для обработки ошибок */
  handleError: (message: string, error?: any) => void;
}

/**
 * Класс генератора QR-кодов
 */
class QRCodeGenerator {
  private readonly config: Config;
  private state: State;
  private readonly utils: Utils;

  /**
   * Конструктор класса QRCodeGenerator
   */
  constructor() {
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

    this.state = {
      elements: {
        qrForm: null,
        qrGenerate: null,
        qrResult: null,
        qrImage: null,
        qrSave: null,
      },
    };

    this.utils = {
      toastConfig: {
        className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
        duration: 3000,
        gravity: 'bottom',
        position: 'center',
      },
      renderDataAttributes: (element: string): string => element.slice(1, -1),
      showToast: (message: string): void => {
        // @ts-ignore
        Toastify({
          text: message,
          ...this.utils.toastConfig,
        }).showToast();
      },
      handleError: (message: string, error: any = null): void => {
        this.utils.showToast(message);
        if (error) console.error(message, error);
      },
    };

    this.init();
  }

  /**
   * Создает HTML-разметку приложения
   */
  private createAppHTML(): void {
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
   * Инициализирует DOM-элементы
   */
  private initDOMElements(): void {
    this.state.elements = {
      qrForm: document.querySelector(this.config.selectors.qrForm),
      qrGenerate: document.querySelector(this.config.selectors.qrGenerate),
      qrResult: document.querySelector(this.config.selectors.qrResult),
      qrImage: document.querySelector(this.config.selectors.qrImage) as HTMLImageElement,
      qrSave: document.querySelector(this.config.selectors.qrSave),
    };
  }

  /**
   * Инициализирует приложение
   */
  private init(): void {
    this.createAppHTML();
    this.initDOMElements();

    this.state.elements.qrForm?.addEventListener('submit', this.handleQrFormSubmit.bind(this));
    this.state.elements.qrSave?.addEventListener('click', this.handleQrSaveClick.bind(this));
  }

  /**
   * Обрабатывает отправку формы для генерации QR-кода
   * @param event - Событие отправки формы
   */
  private handleQrFormSubmit(event: Event): void {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const text = formData.get('text') as string;
    const size = formData.get('size') as string;
    
    if (text.trim().length === 0) {
      this.utils.showToast('Please enter text or URL');
      return;
    }
    this.updateUIForGeneration('Generating QR Code');
    this.generateQRCode(text, size);
  }

  /**
   * Обновляет UI во время генерации QR-кода
   * @param text - Текст для отображения
   */
  private updateUIForGeneration(text: string): void {
    if (this.state.elements.qrGenerate instanceof HTMLElement) {
      this.state.elements.qrGenerate.textContent = text;
    }
  }

  /**
   * Генерирует QR-код
   * @param text - Текст для кодирования
   * @param size - Размер QR-кода
   */
  private generateQRCode(text: string, size: string): void {
    if (this.state.elements.qrImage instanceof HTMLImageElement) {
      this.state.elements.qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`;
      this.state.elements.qrImage.addEventListener('load', this.handleQRCodeLoad.bind(this));
    }
  }

  /**
   * Обрабатывает загрузку QR-кода
   */
  private handleQRCodeLoad(): void {
    this.state.elements.qrResult?.classList.remove('hidden');
    this.updateUIForGeneration('Generate QR Code');
  }

  /**
   * Обрабатывает клик по кнопке сохранения QR-кода
   */
  private async handleQrSaveClick(): Promise<void> {
    if (!(this.state.elements.qrImage instanceof HTMLImageElement) || !this.state.elements.qrImage.src) return;
    try {
      const imageBlob = await this.fetchImageAsBlob(this.state.elements.qrImage.src);
      const imageURL = URL.createObjectURL(imageBlob);
      this.downloadImage(imageURL, 'QRCode');
    } catch (error) {
      this.utils.handleError('Failed to save QR code. Please try again.', error);
    }
  }

  /**
   * Загружает изображение как Blob
   * @param url - URL изображения
   * @returns Promise с Blob изображения
   */
  private async fetchImageAsBlob(url: string): Promise<Blob> {
    const response = await fetch(url);
    return response.blob();
  }

  /**
   * Скачивает изображение
   * @param url - URL изображения
   * @param filename - Имя файла для сохранения
   */
  private downloadImage(url: string, filename: string): void {
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