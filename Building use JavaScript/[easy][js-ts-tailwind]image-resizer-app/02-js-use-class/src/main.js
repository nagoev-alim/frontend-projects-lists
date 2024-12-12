/**
 * Этот модуль реализует функциональность изменения размера изображения.
 * Он позволяет пользователям загружать изображение, изменять его размеры,
 * сохранять пропорции, уменьшать качество и скачивать измененное изображение.
 */

import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import feather from 'feather-icons';

/**
 * Конфигурация приложения
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента
 * @property {Object} selectors - Объект с селекторами элементов
 */
const APP_CONFIG = {
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
 * @typedef {Object} AppState
 * @property {Object} elements - Объект с DOM элементами
 * @property {number|null} ratio - Соотношение сторон изображения
 */
const APP_STATE = {
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
 * @typedef {Object} AppUtils
 * @property {Function} renderDataAttributes - Функция для рендеринга data-атрибутов
 * @property {Object} toastConfig - Конфигурация для toast-уведомлений
 * @property {Function} showToast - Функция для отображения toast-уведомлений
 */
const APP_UTILS = {
  renderDataAttributes: (element) => element.slice(1, -1),
  toastConfig: {
    className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
    duration: 3000,
    gravity: 'bottom',
    position: 'center',
  },
  showToast: (message) => {
    Toastify({
      text: message,
      ...APP_UTILS.toastConfig,
    }).showToast();
  },
};

/**
 * Создает HTML-разметку приложения
 */
function createAppHTML() {
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
  const rootElement = document.querySelector(root);

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
 * Инициализирует DOM-элементы
 */
function initDOMElements() {
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
function initApp() {
  createAppHTML();
  initDOMElements();
  APP_STATE.elements.imageUploadArea.addEventListener('click', () => APP_STATE.elements.imageInput.click());
  APP_STATE.elements.imageInput.addEventListener('change', handleImageImageInput);
  APP_STATE.elements.downloadButton.addEventListener('click', handleDownloadButtonClick);
  APP_STATE.elements.imageWidth.addEventListener('keyup', handleImageKeyup);
  APP_STATE.elements.imageHeight.addEventListener('keyup', handleImageKeyup);
}

/**
 * Обрабатывает загрузку изображения
 * @param {Event} event - Событие изменения input файла
 */
function handleImageImageInput({ target: { files: [image] } }) {
  if (!image) return;

  const { previewImage, imageWidth, imageHeight, imageUploadArea, imageInput } = APP_STATE.elements;

  previewImage.classList.remove('visually-hidden');
  previewImage.src = URL.createObjectURL(image);

  previewImage.addEventListener('load', () => {
    const { naturalWidth, naturalHeight } = previewImage;
    imageWidth.value = String(naturalWidth);
    imageHeight.value = String(naturalHeight);
    APP_STATE.ratio = naturalWidth / naturalHeight;

    imageUploadArea.parentElement.classList.add('h-[435px]');
    previewImage.nextElementSibling.classList.add('hidden');
    imageInput.nextElementSibling.classList.add('hidden');
    imageInput.parentElement.classList.add('h-full');
  });
}

/**
 * Обрабатывает нажатие на кнопку скачивания
 */
function handleDownloadButtonClick() {
  const { downloadButton, reduceQuality, imageWidth, imageHeight, imageUploadArea } = APP_STATE.elements;

  downloadButton.textContent = 'Downloading...';

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const imgQuality = reduceQuality.checked ? 0.6 : 1.0;

  canvas.width = Number(imageWidth.value);
  canvas.height = Number(imageHeight.value);

  setTimeout(() => {
    const img = imageUploadArea.querySelector('img');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/jpeg', imgQuality);
    a.download = `resized_image_${Date.now()}.jpg`;
    a.click();

    downloadButton.textContent = 'Download Image';
    APP_UTILS.showToast('Image downloaded successfully');
  }, 1000);
}

/**
 * Обрабатывает изменение ширины или высоты изображения
 * @param {Event} event - Событие keyup на input'ах ширины или высоты
 */
function handleImageKeyup({ target }) {
  const { imageWidth, imageHeight, aspectRatio } = APP_STATE.elements;
  const width = Number(imageWidth.value);
  const height = Number(imageHeight.value);
  const isAspectRatioChecked = aspectRatio.checked;

  if (target.matches(APP_CONFIG.selectors.imageWidth)) {
    imageHeight.value = String(
      Math.floor(isAspectRatioChecked ? width / APP_STATE.ratio : height),
    );
  } else if (target.matches(APP_CONFIG.selectors.imageHeight)) {
    imageWidth.value = String(
      Math.floor(isAspectRatioChecked ? height * APP_STATE.ratio : width),
    );
  }
}

initApp();
