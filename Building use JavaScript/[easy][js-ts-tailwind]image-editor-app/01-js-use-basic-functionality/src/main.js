/**
 * Редактор изображений
 *
 * Этот модуль представляет собой веб-приложение для редактирования изображений.
 * Он позволяет пользователям загружать изображения, применять различные фильтры
 * (яркость, насыщенность, инверсия, оттенки серого), поворачивать и отражать изображения,
 * а также сохранять отредактированные изображения.
 *
 * Основные функции:
 * - Загрузка изображений
 * - Применение фильтров (яркость, насыщенность, инверсия, оттенки серого)
 * - Поворот и отражение изображений
 * - Сброс всех примененных фильтров
 * - Сохранение отредактированного изображения
 *
 * Приложение использует модульную структуру с разделением на конфигурацию,
 * состояние приложения и утилиты. Интерфейс создается динамически с использованием
 * JavaScript и стилизуется с помощью Tailwind CSS.
 */

import './style.css';
import { icons } from 'feather-icons';

/**
 * Конфигурация приложения
 * @type {Object}
 */
const APP_CONFIG = {
  /** Корневой селектор приложения */
  root: '#app',
  /** Селекторы элементов интерфейса */
  selectors: {
    filterOption: '[data-filter-option]',
    sliderName: '[data-slider-name]',
    sliderValue: '[data-slider-value]',
    sliderInput: '[data-slider-input]',
    rotateButton: '[data-rotate-direction]',
    previewImage: '[data-preview-image]',
    resetButton: '[data-reset-filters]',
    fileInput: '[data-file-input]',
    chooseButton: '[data-choose-image]',
    saveButton: '[data-save-image]',
  },
  /** Опции для редактирования изображения */
  OPTIONS: {
    brightness: '100',
    saturation: '100',
    inversion: '0',
    grayscale: '0',
    rotate: 0,
    flipHorizontal: 1,
    flipVertical: 1,
  },
};

/**
 * Состояние приложения
 * @type {Object}
 */
const APP_STATE = {
  /** DOM элементы */
  elements: {},
  /** Имя загруженного изображения */
  imgName: null,
  /** Флаг блокировки интерфейса */
  isDisable: true,
};

/**
 * Утилиты приложения
 * @type {Object}
 */
const APP_UTILS = {
  /**
   * Капитализация первой буквы строки
   * @param {string} str - Исходная строка
   * @returns {string} Строка с заглавной первой буквой
   */
  capitalizeFirstLetter: (str) => str.charAt(0).toUpperCase() + str.slice(1),

  /**
   * Рендеринг data-атрибутов
   * @param {string} element - Строка с data-атрибутом
   * @returns {string} Обработанная строка атрибута
   */
  renderDataAttributes: (element) => element.slice(1, -1),
};

/**
 * Создание HTML структуры приложения
 */
function createAppHTML() {
  const {
    root,
    selectors: {
      filterOption,
      sliderName,
      sliderValue,
      sliderInput,
      rotateButton,
      previewImage,
      resetButton,
      fileInput,
      chooseButton,
      saveButton,
    },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
  <div class='grid gap-4 w-full max-w-4xl rounded border bg-white p-3 shadow'>
    <h1 class='text-center text-2xl font-bold md:text-4xl'>Image Editor</h1>
    <div class='grid gap-3 md:grid-cols-[0.3fr_0.7fr]'>
      <div class='grid gap-2'>
        <div class='grid gap-2'>
          <p class='font-medium'>Filters</p>
          <div class='grid grid-cols-2 gap-2'>
            ${['brightness', 'saturation', 'inversion', 'grayscale']
    .map(
      (el, idx) => `
              <button ${renderDataAttributes(filterOption)}='${el}' class='border px-3 py-2 ${idx === 0 ? 'active bg-neutral-400 text-white hover:bg-neutral-500' : ''}'>${APP_UTILS.capitalizeFirstLetter(el)}</button>
            `,
    )
    .join('')}
          </div>
          <div class='grid gap-2'>
            <div class='flex items-center justify-between'>
              <p class='font-medium' ${renderDataAttributes(sliderName)}>Brighteness</p>
              <p class='font-bold' ${renderDataAttributes(sliderValue)}>100%</p>
            </div>
            <input type='range' value='100' min='0' max='200' ${renderDataAttributes(sliderInput)}>
          </div>
        </div>
        <div class='grid gap-2'>
          <p class='font-medium'>Rotate & Flip</p>
          <div class='grid grid-cols-4 gap-2'>
            <button class='border p-3 hover:bg-slate-50' ${renderDataAttributes(rotateButton)}='left'>${icons['rotate-ccw'].toSvg()}</button>
            <button class='border p-3 hover:bg-slate-50' ${renderDataAttributes(rotateButton)}='right'>${icons['rotate-cw'].toSvg()}</button>
            <button class='border p-3 hover:bg-slate-50' ${renderDataAttributes(rotateButton)}='horizontal'>${icons['minimize-2'].toSvg()}</button>
            <button class='border p-3 hover:bg-slate-50' ${renderDataAttributes(rotateButton)}='vertical'>${icons['minimize-2'].toSvg()}</button>
          </div>
        </div>
      </div>
      <div class='relative overflow-auto grid h-full min-h-[400px] max-h-[600px] place-content-center rounded-md bg-gray-200'>
        <img src='#' alt='preview-img' draggable='false' class='absolute hidden h-full w-full object-contain' ${renderDataAttributes(previewImage)}>
        <div class='grid place-items-center gap-2'>
          ${icons.image.toSvg()}
          <p>Choose Image Or Edit</p>
        </div>
      </div>
    </div>
    <div class='flex gap-3'>
      <button class='border px-3 py-2 hover:bg-slate-50' ${renderDataAttributes(resetButton)}>Reset Filters</button>
      <div class='ml-auto'><input type='file' accept='image/*' class='visually-hidden' ${renderDataAttributes(fileInput)}></div>
      <button class='border px-3 py-2 hover:bg-slate-50' ${renderDataAttributes(chooseButton)}>Choose Image</button>
      <button class='border px-3 py-2 hover:bg-slate-50' ${renderDataAttributes(saveButton)}>Save Image</button>
    </div>
  </div>
`;
}

/**
 * Инициализация DOM элементов
 */
function initDOMElements() {
  APP_STATE.elements = {
    filterOption: Array.from(document.querySelectorAll(APP_CONFIG.selectors.filterOption)),
    sliderName: document.querySelector(APP_CONFIG.selectors.sliderName),
    sliderValue: document.querySelector(APP_CONFIG.selectors.sliderValue),
    sliderInput: document.querySelector(APP_CONFIG.selectors.sliderInput),
    rotateButton: Array.from(document.querySelectorAll(APP_CONFIG.selectors.rotateButton)),
    previewImage: document.querySelector(APP_CONFIG.selectors.previewImage),
    resetButton: document.querySelector(APP_CONFIG.selectors.resetButton),
    fileInput: document.querySelector(APP_CONFIG.selectors.fileInput),
    chooseButton: document.querySelector(APP_CONFIG.selectors.chooseButton),
    saveButton: document.querySelector(APP_CONFIG.selectors.saveButton),
  };
}

/**
 * Инициализация приложения
 */
function initApp() {
  createAppHTML();
  initDOMElements();
  APP_STATE.elements.sliderInput.addEventListener('input', handleSliderInputChange);
  APP_STATE.elements.filterOption.forEach((option) => option.addEventListener('click', handleOptionClick));
  APP_STATE.elements.rotateButton.forEach((button) => button.addEventListener('click', handleButtonClick));
  APP_STATE.elements.fileInput.addEventListener('change', handleFileImageChange);
  APP_STATE.elements.resetButton.addEventListener('click', handleResetButtonClick);
  APP_STATE.elements.saveButton.addEventListener('click', handleSaveButtonClick);
  APP_STATE.elements.chooseButton.addEventListener('click', () => APP_STATE.elements.fileInput.click());
}

/**
 * Обработчик изменения значения слайдера
 * @param {Event} event - Событие изменения значения слайдера
 */
function handleSliderInputChange(event) {
  const value = event.target.value;
  if (APP_STATE.isDisable) return;

  APP_STATE.elements.sliderValue.textContent = `${value}%`;

  const activeFilter = document.querySelector(`${APP_CONFIG.selectors.filterOption}.active`).dataset.filterOption;
  APP_CONFIG.OPTIONS[activeFilter] = value;

  applyFilter();
}

/**
 * Применяет фильтры к изображению
 * @description Обновляет стили предпросмотра изображения на основе текущих настроек фильтров
 */
function applyFilter() {
  if (APP_STATE.isDisable) return;

  const { previewImage } = APP_STATE.elements;
  const { rotate, flipHorizontal, flipVertical, brightness, saturation, inversion, grayscale } = APP_CONFIG.OPTIONS;

  previewImage.classList.remove('hidden');
  previewImage.nextElementSibling.classList.add('hidden');

  previewImage.style.transform = `rotate(${rotate}deg) scale(${flipHorizontal}, ${flipVertical})`;
  previewImage.style.filter = `brightness(${brightness}%) saturate(${saturation}%) invert(${inversion}%) grayscale(${grayscale}%)`;
}

/**
 * Обрабатывает клик по опции фильтра
 * @param {Event} event - Объект события клика
 */
function handleOptionClick(event) {
  const { target } = event;
  if (APP_STATE.isDisable) return;

  const { filterOption, sliderName, sliderInput, sliderValue } = APP_STATE.elements;
  const filterType = target.dataset.filterOption;

  const activeClasses = ['active', 'bg-neutral-400', 'text-white', 'hover:bg-neutral-500'];

  filterOption.forEach(option => option.classList.remove(...activeClasses));
  target.classList.add(...activeClasses);

  sliderName.textContent = target.textContent;
  sliderInput.max = '200';
  sliderInput.value = APP_CONFIG.OPTIONS[filterType];
  sliderValue.textContent = `${APP_CONFIG.OPTIONS[filterType]}%`;
}

/**
 * Обрабатывает клик по кнопке поворота или отражения
 * @param {Event} event - Объект события клика
 */
function handleButtonClick(event) {
  const { target } = event;
  if (APP_STATE.isDisable) return;

  const direction = target.dataset.rotateDirection;
  const { rotate, flipHorizontal, flipVertical } = APP_CONFIG.OPTIONS;

  const actions = {
    left: () => rotate - 90,
    right: () => rotate + 90,
    horizontal: () => flipHorizontal * -1,
    vertical: () => flipVertical * -1,
  };

  if (direction in actions) {
    const newValue = actions[direction]();
    APP_CONFIG.OPTIONS[direction === 'left' || direction === 'right' ? 'rotate' : `flip${direction.charAt(0).toUpperCase() + direction.slice(1)}`] = newValue;
    applyFilter();
  }
}

/**
 * Обрабатывает изменение файла изображения
 * @param {Event} event - Объект события изменения файла
 */
function handleFileImageChange({ target: { files: [file] } }) {
  if (!file) return;

  const { previewImage, resetButton } = APP_STATE.elements;
  const fileReader = new FileReader();

  fileReader.onload = () => {
    previewImage.src = fileReader.result;
    previewImage.addEventListener('load', () => {
      APP_STATE.isDisable = false;
      resetButton.click();
      APP_STATE.imgName = file.name.split(/[\/\\]/).pop();
    }, { once: true });
  };

  fileReader.readAsDataURL(file);
}

/**
 * Обрабатывает клик по кнопке сброса фильтров
 */
function handleResetButtonClick() {
  if (APP_STATE.isDisable) return;

  const defaultOptions = {
    brightness: '100',
    saturation: '100',
    inversion: '0',
    grayscale: '0',
    rotate: 0,
    flipHorizontal: 1,
    flipVertical: 1,
  };

  Object.assign(APP_CONFIG.OPTIONS, defaultOptions);

  const [firstFilterOption] = APP_STATE.elements.filterOption;
  firstFilterOption.click();
  applyFilter();
}

/**
 * Обрабатывает клик по кнопке сохранения изображения
 * @param {Event} event - Объект события клика
 */
function handleSaveButtonClick({ target }) {
  if (APP_STATE.isDisable) return;

  const saveImage = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const { previewImage } = APP_STATE.elements;
    const { naturalWidth: width, naturalHeight: height } = previewImage;
    const { brightness, saturation, inversion, grayscale, rotate, flipHorizontal, flipVertical } = APP_CONFIG.OPTIONS;

    canvas.width = width;
    canvas.height = height;

    ctx.filter = `brightness(${brightness}%) saturate(${saturation}%) invert(${inversion}%) grayscale(${grayscale}%)`;
    ctx.translate(width / 2, height / 2);
    if (rotate !== 0) ctx.rotate((rotate * Math.PI) / 180);
    ctx.scale(flipHorizontal, flipVertical);
    ctx.drawImage(previewImage, -width / 2, -height / 2, width, height);

    const link = document.createElement('a');
    link.download = APP_STATE.imgName || 'image';
    link.href = canvas.toDataURL();
    link.click();

    updateButtonState(target, 'Save Image', false);
  };

  updateButtonState(target, 'Saving image...', true);
  requestAnimationFrame(saveImage);
}

/**
 * Обновляет состояние кнопки
 * @param {HTMLButtonElement} button - Элемент кнопки
 * @param {string} text - Текст для отображения на кнопке
 * @param {boolean} isDisabled - Флаг отключения кнопки
 */
function updateButtonState(button, text, isDisabled) {
  button.textContent = text;
  button.classList.toggle('disabled', isDisabled);
}

initApp();
