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
 * Класс QrCodeReader - основной класс приложения для чтения QR-кодов
 */
class QrCodeReader {
  private readonly config: AppConfig;
  private readonly state: AppState;
  private readonly utils: AppUtils;

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
  private createAppHTML(): void {
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
  private initDOMElements(): void {
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
  private init(): void {
    this.createAppHTML();
    this.initDOMElements();
    this.state.elements.qrForm?.addEventListener('click', () => this.state.elements.qrFileInput?.click());
    this.state.elements.qrFileInput?.addEventListener('change', this.handleFileInputChange.bind(this));
    this.state.elements.qrCopy?.addEventListener('click', this.handleCopyClick.bind(this));
    this.state.elements.qrClose?.addEventListener('click', () => this.updateQrFormUI());
  }

  /**
   * Обновляет текст параграфа
   * @param {string} text - Новый текст
   */
  /**
   * Обновляет текст параграфа с инструкцией для загрузки QR-кода.
   * @param {string} text - Новый текст для отображения.
   * @returns {void}
   */
  private updateParagraphText(text: string): void {
    const uploadText = this.state.elements.qrUploadText as HTMLElement | null;
    if (uploadText) {
      uploadText.textContent = text;
    }
  }

  /**
   * Обновляет пользовательский интерфейс формы QR-кода в зависимости от того, был ли отсканирован QR-код.
   * @param {File | null} file - Файл изображения QR-кода. Null, если QR-код не был отсканирован.
   * @param {string | null} url - URL, полученный из QR-кода. Null, если QR-код не был отсканирован.
   * @returns {void}
   */
  private updateQrFormUI(file: File | null = null, url: string | null = null): void {
    const { elements } = this.state;
    const isQrCodeScanned = !!file && !!url;

    const qrResult = elements.qrResult as HTMLTextAreaElement;
    const qrImage = elements.qrImage as HTMLImageElement;
    const qrForm = elements.qrForm as HTMLFormElement;
    const qrReader = elements.qrReader as HTMLElement;

    qrResult.value = isQrCodeScanned ? url : '';
    qrImage.src = isQrCodeScanned ? URL.createObjectURL(file) : '#';
    qrImage.classList.toggle('hidden', !isQrCodeScanned);

    const formDiv = qrForm.querySelector('div');
    formDiv?.classList.toggle('hidden', isQrCodeScanned);

    if (!isQrCodeScanned) {
      qrForm.reset();
    }

    qrReader.classList.toggle('max-h-[420px]', isQrCodeScanned);
    qrReader.classList.toggle('max-h-[200px]', !isQrCodeScanned);
  }

  /**
   * Получает данные QR-кода из файла изображения.
   * @param {File} file - Файл изображения QR-кода.
   * @param {FormData} formData - Данные формы для отправки на сервер.
   * @returns {Promise<void>}
   * @throws {Error} Если не удалось отсканировать QR-код.
   */
  private async getQrData(file: File, formData: FormData): Promise<void> {
    try {
      this.updateParagraphText('Scanning QR Code...');
      const response = await axios.post<[{ symbol: [{ data: string }] }]>(this.config.url, formData);
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
   * Обрабатывает изменение файла в input элементе.
   * @param {Event} event - Событие изменения файла.
   * @returns {Promise<void>}
   */
  private async handleFileInputChange(event: Event): Promise<void> {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
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
   * Обрабатывает клик по кнопке копирования.
   * Копирует результат сканирования QR-кода в буфер обмена.
   * @returns {Promise<void>}
   */
  private async handleCopyClick(): Promise<void> {
    const qrResult = this.state.elements.qrResult as HTMLTextAreaElement;
    const clipboard = qrResult.value.trim();
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
