/**
 * Этот код реализует генератор QR-кодов.
 * Он позволяет пользователю ввести текст или URL, выбрать размер QR-кода,
 * сгенерировать его и сохранить полученное изображение.
 * Код использует внешний API для генерации QR-кодов и библиотеку Toastify для уведомлений.
 */

import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

/**
 * Интерфейс для конфигурации приложения
 */
interface AppConfig {
  /** Корневой элемент приложения */
  root: string;
  /** Селекторы для различных элементов DOM */
  selectors: {
    [key: string]: string;
  };
  /** Доступные размеры QR-кода */
  sizes: number[];
}

/**
 * Интерфейс для состояния приложения
 */
interface AppState {
  /** Элементы DOM */
  elements: {
    [key: string]: HTMLElement | null;
  };
}

/**
 * Интерфейс для утилит приложения
 */
interface AppUtils {
  /** Конфигурация для Toast-уведомлений */
  toastConfig: {
    className: string;
    duration: number;
    gravity: string;
    position: string;
  };
  /** Функция для рендеринга data-атрибутов */
  renderDataAttributes: (element: string) => string;
  /** Функция для отображения Toast-уведомления */
  showToast: (message: string) => void;
  /** Функция для обработки ошибок */
  handleError: (message: string, error?: any) => void;
}

/**
 * Конфигурация приложения
 */
const APP_CONFIG: AppConfig = {
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
 * Состояние приложения
 */
const APP_STATE: AppState = {
  elements: {
    qrForm: null,
    qrGenerate: null,
    qrResult: null,
    qrImage: null,
    qrSave: null,
  },
};

/**
 * Утилиты приложения
 */
const APP_UTILS: AppUtils = {
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
      ...APP_UTILS.toastConfig,
    }).showToast();
  },

  handleError: (message: string, error: any = null): void => {
    APP_UTILS.showToast(message);
    if (error) console.error(message, error);
  },
};

/**
 * Создает HTML-разметку приложения
 */
function createAppHTML(): void {
  const {
    root,
    selectors: {
      qrForm,
      qrGenerate,
      qrResult,
      qrImage,
      qrSave,
    },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement: HTMLElement | null = document.querySelector(root);

  if (!rootElement) return;

  const optionsHTML: string = APP_CONFIG.sizes.map((size) => `<option ${size === 300 ? 'selected' : ''} value='${size}'>${size}x${size}</option>`).join('');

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
 * Инициализирует элементы DOM
 */
function initDOMElements(): void {
  APP_STATE.elements = {
    qrForm: document.querySelector(APP_CONFIG.selectors.qrForm),
    qrGenerate: document.querySelector(APP_CONFIG.selectors.qrGenerate),
    qrResult: document.querySelector(APP_CONFIG.selectors.qrResult),
    qrImage: document.querySelector(APP_CONFIG.selectors.qrImage) as HTMLImageElement,
    qrSave: document.querySelector(APP_CONFIG.selectors.qrSave),
  };
}

/**
 * Инициализирует приложение
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();
  APP_STATE.elements.qrForm?.addEventListener('submit', handleQrFormSubmit);
  APP_STATE.elements.qrSave?.addEventListener('click', handleQrSaveClick);
}

/**
 * Обрабатывает отправку формы для генерации QR-кода
 * @param event - Событие отправки формы
 */
function handleQrFormSubmit(event: Event): void {
  event.preventDefault();
  const formData = new FormData(event.target as HTMLFormElement);
  const text = formData.get('text') as string;
  const size = formData.get('size') as string;

  if (text.trim().length === 0) {
    APP_UTILS.showToast('Please enter text or URL');
    return;
  }
  updateUIForGeneration('Generating QR Code');
  generateQRCode(text, size);
}

/**
 * Обновляет UI во время генерации QR-кода
 * @param text - Текст для отображения на кнопке генерации
 */
function updateUIForGeneration(text: string): void {
  if (APP_STATE.elements.qrGenerate instanceof HTMLElement) {
    APP_STATE.elements.qrGenerate.textContent = text;
  }
}

/**
 * Генерирует QR-код
 * @param text - Текст для кодирования
 * @param size - Размер QR-кода
 */
function generateQRCode(text: string, size: string): void {
  if (APP_STATE.elements.qrImage instanceof HTMLImageElement) {
    APP_STATE.elements.qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`;
    APP_STATE.elements.qrImage.addEventListener('load', handleQRCodeLoad);
  }
}

/**
 * Обрабатывает загрузку QR-кода
 */
function handleQRCodeLoad(): void {
  APP_STATE.elements.qrResult?.classList.remove('hidden');
  updateUIForGeneration('Generate QR Code');
}

/**
 * Обрабатывает клик по кнопке сохранения QR-кода
 */
async function handleQrSaveClick(): Promise<void> {
  if (!(APP_STATE.elements.qrImage instanceof HTMLImageElement) || !APP_STATE.elements.qrImage.src) return;
  try {
    const imageBlob = await fetchImageAsBlob(APP_STATE.elements.qrImage.src);
    const imageURL = URL.createObjectURL(imageBlob);
    downloadImage(imageURL, 'QRCode');
  } catch (error) {
    APP_UTILS.handleError('Failed to save QR code. Please try again.', error);
  }
}

/**
 * Получает изображение как Blob
 * @param url - URL изображения
 * @returns Promise с Blob изображения
 */
async function fetchImageAsBlob(url: string): Promise<Blob> {
  const response = await fetch(url);
  return response.blob();
}

/**
 * Скачивает изображение
 * @param url - URL изображения
 * @param filename - Имя файла для сохранения
 */
function downloadImage(url: string, filename: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

initApp();