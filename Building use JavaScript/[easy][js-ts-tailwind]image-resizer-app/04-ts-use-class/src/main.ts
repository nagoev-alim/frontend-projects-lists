/**
 * Этот код представляет собой приложение для изменения размера изображений.
 * Он позволяет пользователям загружать изображения, изменять их размеры,
 * сохранять пропорции, уменьшать качество и скачивать измененные изображения.
 */

import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import feather from 'feather-icons';

/**
 * Интерфейс для конфигурации приложения
 * @typedef {Object} AppConfig
 * @property {string} root - Корневой элемент приложения
 * @property {Object.<string, string>} selectors - Селекторы для элементов DOM
 */
interface AppConfig {
  root: string;
  selectors: {
    [key: string]: string;
  };
}

/**
 * Интерфейс для состояния приложения
 * @typedef {Object} AppState
 * @property {Object} elements - Объект, содержащий ссылки на элементы DOM
 * @property {HTMLDivElement | null} elements.imageUploadArea - Область для загрузки изображения
 * @property {HTMLInputElement | null} elements.imageInput - Поле ввода для выбора изображения
 * @property {HTMLImageElement | null} elements.previewImage - Элемент для предварительного просмотра изображения
 * @property {HTMLInputElement | null} elements.imageWidth - Поле ввода для ширины изображения
 * @property {HTMLInputElement | null} elements.imageHeight - Поле ввода для высоты изображения
 * @property {HTMLInputElement | null} elements.aspectRatio - Чекбокс для сохранения пропорций
 * @property {HTMLInputElement | null} elements.reduceQuality - Чекбокс для уменьшения качества
 * @property {HTMLButtonElement | null} elements.downloadButton - Кнопка для скачивания изображения
 * @property {number | null} ratio - Соотношение сторон изображения
 */
interface AppState {
  elements: {
    imageUploadArea: HTMLDivElement | null,
    imageInput: HTMLInputElement | null,
    previewImage: HTMLImageElement | null,
    imageWidth: HTMLInputElement | null,
    imageHeight: HTMLInputElement | null,
    aspectRatio: HTMLInputElement | null,
    reduceQuality: HTMLInputElement | null,
    downloadButton: HTMLButtonElement | null,
  };
  ratio: number | null;
}

/**
 * Интерфейс для утилит приложения
 * @typedef {Object} AppUtils
 * @property {function(string): string} renderDataAttributes - Функция для рендеринга data-атрибутов
 * @property {Object} toastConfig - Конфигурация для уведомлений
 * @property {function(string): void} showToast - Функция для показа уведомлений
 */
interface AppUtils {
  renderDataAttributes: (element: string) => string;
  toastConfig: {
    className: string;
    duration: number;
    gravity: string;
    position: string;
  };
  showToast: (message: string) => void;
}

/**
 * Конфигурация приложения
 * @type {AppConfig}
 */
const APP_CONFIG: AppConfig = {
  root: '#app',
  selectors: {
    imageUploadArea: '[data-image-upload-area]',
    imageInput: '[data-image-input]',
    previewImage: '[data-preview-image]',
    imageWidth: '[data-image-width]',
    imageHeight: '[data-image-height]',
    aspectRatio: '[data-aspect-ratio]',
    reduceQuality: '[data-reduce-quality]',
    downloadButton: '[data-download-button]',
  },
};

/**
 * Состояние приложения
 * @type {AppState}
 */
const APP_STATE: AppState = {
  elements: {
    imageUploadArea: null,
    imageInput: null,
    previewImage: null,
    imageWidth: null,
    imageHeight: null,
    aspectRatio: null,
    reduceQuality: null,
    downloadButton: null,
  },
  ratio: null,
};

/**
 * Утилиты приложения
 * @type {AppUtils}
 */
const APP_UTILS: AppUtils = {
  /**
   * Рендерит data-атрибуты для элемента
   * @param {string} element - Строка с селектором элемента
   * @returns {string} Строка с data-атрибутом
   */
  renderDataAttributes: (element: string): string => element.slice(1, -1),

  /**
   * Конфигурация для уведомлений
   * @type {Object}
   */
  toastConfig: {
    /** Класс для стилизации уведомления */
    className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
    /** Продолжительность отображения уведомления в миллисекундах */
    duration: 3000,
    /** Гравитация (расположение) уведомления */
    gravity: 'bottom',
    /** Позиция уведомления */
    position: 'center',
  },

  /**
   * Показывает уведомление
   * @param {string} message - Текст уведомления
   */
  showToast: (message: string): void => {
    // @ts-ignore
    Toastify({
      text: message,
      ...APP_UTILS.toastConfig,
    }).showToast();
  },
};

/**
 * Создает HTML-разметку приложения
 */
function createAppHTML(): void {
  const {
    root,
    selectors: {
      imageUploadArea,
      imageInput,
      previewImage,
      imageWidth,
      imageHeight,
      aspectRatio,
      reduceQuality,
      downloadButton,
    },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector<HTMLElement>(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='grid max-w-md gap-4 rounded border bg-white p-3 shadow w-full'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>Image Resizer</h1>
      <div class='grid h-[250px] gap-4 overflow-hidden transition-all'>
        <div class='grid h-[250px] cursor-pointer place-items-center rounded-md border-2 border-dashed' ${renderDataAttributes(imageUploadArea)}>
          <div class='relative grid w-full place-items-center gap-2 overflow-hidden'>
            <input type='file' accept='image/*' class='visually-hidden' ${renderDataAttributes(imageInput)}>
            <div>${feather.icons.image.toSvg({ width: 48, height: 48 })}</div>
            <img class='absolute inset-0 h-full w-full visually-hidden' src='#' alt='image' ${renderDataAttributes(previewImage)}>
            <p class='font-medium'>Browse File to Upload</p>
          </div>
        </div>
        <div class='grid grid-cols-2 gap-4'>
          <label class='grid gap-1'>
            <span class='text-sm font-medium'>Width</span>
            <input class='w-full rounded border bg-slate-50 px-3 py-2 focus:border-blue-400 focus:outline-none' type='number' ${renderDataAttributes(imageWidth)}>
          </label>
          <label class='grid gap-1'>
            <span class='text-sm font-medium'>Height</span>
            <input class='w-full rounded border bg-slate-50 px-3 py-2 focus:border-blue-400 focus:outline-none' type='number' ${renderDataAttributes(imageHeight)}>
          </label>
          <label class='flex flex-wrap items-center gap-1'>
            <input class='visually-hidden' type='checkbox' ${renderDataAttributes(aspectRatio)} checked>
            <span class='checkbox'></span>
            <span class='text-sm font-medium'>Lock aspect ratio</span>
          </label>
          <label class='flex flex-wrap items-center gap-1'>
            <input class='visually-hidden' type='checkbox' ${renderDataAttributes(reduceQuality)}>
            <span class='checkbox'></span>
            <span class='text-sm font-medium'>Reduce quality</span>
          </label>
          <button class='col-span-2 border px-3 py-2 hover:bg-slate-50' ${renderDataAttributes(downloadButton)}>Download Image</button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Инициализирует DOM-элементы приложения
 */
function initDOMElements(): void {
  APP_STATE.elements = {
    imageUploadArea: document.querySelector(APP_CONFIG.selectors.imageUploadArea),
    imageInput: document.querySelector(APP_CONFIG.selectors.imageInput),
    previewImage: document.querySelector(APP_CONFIG.selectors.previewImage),
    imageWidth: document.querySelector(APP_CONFIG.selectors.imageWidth),
    imageHeight: document.querySelector(APP_CONFIG.selectors.imageHeight),
    aspectRatio: document.querySelector(APP_CONFIG.selectors.aspectRatio),
    reduceQuality: document.querySelector(APP_CONFIG.selectors.reduceQuality),
    downloadButton: document.querySelector(APP_CONFIG.selectors.downloadButton),
  };
}

/**
 * Инициализирует приложение
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();
  APP_STATE.elements.imageUploadArea?.addEventListener('click', () => (APP_STATE.elements.imageInput as HTMLInputElement).click());
  APP_STATE.elements.imageInput?.addEventListener('change', handleImageImageInput);
  APP_STATE.elements.downloadButton?.addEventListener('click', handleDownloadButtonClick);
  APP_STATE.elements.imageWidth?.addEventListener('keyup', handleImageKeyup);
  APP_STATE.elements.imageHeight?.addEventListener('keyup', handleImageKeyup);
}

/**
 * Обрабатывает загрузку изображения
 * @param {Event} event - Событие изменения input файла
 */
function handleImageImageInput(event: Event): void {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const { previewImage, imageWidth, imageHeight, imageUploadArea, imageInput } = APP_STATE.elements;

  if (previewImage instanceof HTMLImageElement) {
    previewImage.classList.remove('visually-hidden');
    previewImage.src = URL.createObjectURL(file);

    previewImage.addEventListener('load', () => {
      const { naturalWidth, naturalHeight } = previewImage;
      if (imageWidth instanceof HTMLInputElement) imageWidth.value = String(naturalWidth);
      if (imageHeight instanceof HTMLInputElement) imageHeight.value = String(naturalHeight);
      APP_STATE.ratio = naturalWidth / naturalHeight;

      imageUploadArea?.parentElement?.classList.add('h-[435px]');
      previewImage.nextElementSibling?.classList.add('hidden');
      imageInput?.nextElementSibling?.classList.add('hidden');
      imageInput?.parentElement?.classList.add('h-full');
    });
  }
}

/**
 * Обрабатывает нажатие на кнопку скачивания
 */
function handleDownloadButtonClick(): void {
  const {
    downloadButton,
    reduceQuality,
    imageWidth,
    imageHeight,
    imageUploadArea,
  } = APP_STATE.elements;

  if (downloadButton instanceof HTMLButtonElement) {
    downloadButton.textContent = 'Downloading...';
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const imgQuality = reduceQuality instanceof HTMLInputElement && reduceQuality.checked ? 0.6 : 1.0;

  if (imageWidth instanceof HTMLInputElement) canvas.width = Number(imageWidth.value);
  if (imageHeight instanceof HTMLInputElement) canvas.height = Number(imageHeight.value);

  setTimeout(() => {
    const img = imageUploadArea?.querySelector('img');
    if (ctx && img) {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }

    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/jpeg', imgQuality);
    a.download = `resized_image_${Date.now()}.jpg`;
    a.click();

    if (downloadButton instanceof HTMLButtonElement) {
      downloadButton.textContent = 'Download Image';
    }
    APP_UTILS.showToast('Image downloaded successfully');
  }, 1000);
}

/**
 * Обрабатывает изменение размеров изображения
 * @param {KeyboardEvent} event - Событие нажатия клавиши
 */
function handleImageKeyup(event: KeyboardEvent): void {
  const { imageWidth, imageHeight, aspectRatio } = APP_STATE.elements;
  const width = imageWidth instanceof HTMLInputElement ? Number(imageWidth.value) : 0;
  const height = imageHeight instanceof HTMLInputElement ? Number(imageHeight.value) : 0;
  const isAspectRatioChecked = aspectRatio instanceof HTMLInputElement && aspectRatio.checked;

  if (event.target instanceof HTMLElement) {
    if (event.target.matches(APP_CONFIG.selectors.imageWidth) && imageHeight instanceof HTMLInputElement) {
      imageHeight.value = String(
        Math.floor(isAspectRatioChecked && APP_STATE.ratio ? width / APP_STATE.ratio : height),
      );
    } else if (event.target.matches(APP_CONFIG.selectors.imageHeight) && imageWidth instanceof HTMLInputElement) {
      imageWidth.value = String(
        Math.floor(isAspectRatioChecked && APP_STATE.ratio ? height * APP_STATE.ratio : width),
      );
    }
  }
}

initApp();
