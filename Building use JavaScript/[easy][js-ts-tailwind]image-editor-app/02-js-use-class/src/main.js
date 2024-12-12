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


class ImageEditorLite {
  constructor() {
    this.config = {
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

    this.state = {
      /** DOM элементы */
      elements: {},
      /** Имя загруженного изображения */
      imgName: null,
      /** Флаг блокировки интерфейса */
      isDisable: true,
    };

    this.utils = {
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

    this.init();
  }

  /**
   * Создание HTML структуры приложения
   */
  createAppHTML() {
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
    } = this.config;
    const { renderDataAttributes } = this.utils;
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
              <button ${renderDataAttributes(filterOption)}='${el}' class='border px-3 py-2 ${idx === 0 ? 'active bg-neutral-400 text-white hover:bg-neutral-500' : ''}'>${this.utils.capitalizeFirstLetter(el)}</button>
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
  initDOMElements() {
    this.state.elements = {
      filterOption: Array.from(document.querySelectorAll(this.config.selectors.filterOption)),
      sliderName: document.querySelector(this.config.selectors.sliderName),
      sliderValue: document.querySelector(this.config.selectors.sliderValue),
      sliderInput: document.querySelector(this.config.selectors.sliderInput),
      rotateButton: Array.from(document.querySelectorAll(this.config.selectors.rotateButton)),
      previewImage: document.querySelector(this.config.selectors.previewImage),
      resetButton: document.querySelector(this.config.selectors.resetButton),
      fileInput: document.querySelector(this.config.selectors.fileInput),
      chooseButton: document.querySelector(this.config.selectors.chooseButton),
      saveButton: document.querySelector(this.config.selectors.saveButton),
    };
  }

  /**
   * Инициализация приложения
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();
    this.state.elements.sliderInput.addEventListener('input', this.handleSliderInputChange.bind(this));
    this.state.elements.filterOption.forEach((option) => option.addEventListener('click', this.handleOptionClick.bind(this)));
    this.state.elements.rotateButton.forEach((button) => button.addEventListener('click', this.handleButtonClick.bind(this)));
    this.state.elements.fileInput.addEventListener('change', this.handleFileImageChange.bind(this));
    this.state.elements.resetButton.addEventListener('click', this.handleResetButtonClick.bind(this));
    this.state.elements.saveButton.addEventListener('click', this.handleSaveButtonClick.bind(this));
    this.state.elements.chooseButton.addEventListener('click', () => this.state.elements.fileInput.click());
  }


  /**
   * Обработчик изменения значения слайдера
   * @param {Event} event - Событие изменения значения слайдера
   */
  handleSliderInputChange(event) {
    const value = event.target.value;
    if (this.state.isDisable) return;

    this.state.elements.sliderValue.textContent = `${value}%`;

    const activeFilter = document.querySelector(`${this.config.selectors.filterOption}.active`).dataset.filterOption;
    this.config.OPTIONS[activeFilter] = value;

    this.applyFilter();
  }

  /**
   * Применяет фильтры к изображению
   * @description Обновляет стили предпросмотра изображения на основе текущих настроек фильтров
   */
  applyFilter() {
    if (this.state.isDisable) return;

    const { previewImage } = this.state.elements;
    const { rotate, flipHorizontal, flipVertical, brightness, saturation, inversion, grayscale } = this.config.OPTIONS;

    previewImage.classList.remove('hidden');
    previewImage.nextElementSibling.classList.add('hidden');

    previewImage.style.transform = `rotate(${rotate}deg) scale(${flipHorizontal}, ${flipVertical})`;
    previewImage.style.filter = `brightness(${brightness}%) saturate(${saturation}%) invert(${inversion}%) grayscale(${grayscale}%)`;
  }

  /**
   * Обрабатывает клик по опции фильтра
   * @param {Event} event - Объект события клика
   */
  handleOptionClick(event) {
    const { target } = event;
    if (this.state.isDisable) return;

    const { filterOption, sliderName, sliderInput, sliderValue } = this.state.elements;
    const filterType = target.dataset.filterOption;

    const activeClasses = ['active', 'bg-neutral-400', 'text-white', 'hover:bg-neutral-500'];

    filterOption.forEach(option => option.classList.remove(...activeClasses));
    target.classList.add(...activeClasses);

    sliderName.textContent = target.textContent;
    sliderInput.max = '200';
    sliderInput.value = this.config.OPTIONS[filterType];
    sliderValue.textContent = `${this.config.OPTIONS[filterType]}%`;
  }

  /**
   * Обрабатывает клик по кнопке поворота или отражения
   * @param {Event} event - Объект события клика
   */
  handleButtonClick(event) {
    const { target } = event;
    if (this.state.isDisable) return;

    const direction = target.dataset.rotateDirection;
    const { rotate, flipHorizontal, flipVertical } = this.config.OPTIONS;

    const actions = {
      left: () => rotate - 90,
      right: () => rotate + 90,
      horizontal: () => flipHorizontal * -1,
      vertical: () => flipVertical * -1,
    };

    if (direction in actions) {
      const newValue = actions[direction]();
      this.config.OPTIONS[direction === 'left' || direction === 'right' ? 'rotate' : `flip${direction.charAt(0).toUpperCase() + direction.slice(1)}`] = newValue;
      this.applyFilter();
    }
  }

  /**
   * Обрабатывает изменение файла изображения
   * @param {Event} event - Объект события изменения файла
   */
  handleFileImageChange({ target: { files: [file] } }) {
    if (!file) return;

    const { previewImage, resetButton } = this.state.elements;
    const fileReader = new FileReader();

    fileReader.onload = () => {
      previewImage.src = fileReader.result;
      previewImage.addEventListener('load', () => {
        this.state.isDisable = false;
        resetButton.click();
        this.state.imgName = file.name.split(/[\/\\]/).pop();
      }, { once: true });
    };

    fileReader.readAsDataURL(file);
  }

  /**
   * Обрабатывает клик по кнопке сброса фильтров
   */
  handleResetButtonClick() {
    if (this.state.isDisable) return;

    const defaultOptions = {
      brightness: '100',
      saturation: '100',
      inversion: '0',
      grayscale: '0',
      rotate: 0,
      flipHorizontal: 1,
      flipVertical: 1,
    };

    Object.assign(this.config.OPTIONS, defaultOptions);

    const [firstFilterOption] = this.state.elements.filterOption;
    firstFilterOption.click();
    this.applyFilter();
  }

  /**
   * Обрабатывает клик по кнопке сохранения изображения
   * @param {Event} event - Объект события клика
   */
  handleSaveButtonClick({ target }) {
    if (this.state.isDisable) return;

    const saveImage = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const { previewImage } = this.state.elements;
      const { naturalWidth: width, naturalHeight: height } = previewImage;
      const {
        brightness,
        saturation,
        inversion,
        grayscale,
        rotate,
        flipHorizontal,
        flipVertical,
      } = this.config.OPTIONS;

      canvas.width = width;
      canvas.height = height;

      ctx.filter = `brightness(${brightness}%) saturate(${saturation}%) invert(${inversion}%) grayscale(${grayscale}%)`;
      ctx.translate(width / 2, height / 2);
      if (rotate !== 0) ctx.rotate((rotate * Math.PI) / 180);
      ctx.scale(flipHorizontal, flipVertical);
      ctx.drawImage(previewImage, -width / 2, -height / 2, width, height);

      const link = document.createElement('a');
      link.download = this.state.imgName || 'image';
      link.href = canvas.toDataURL();
      link.click();

      this.updateButtonState(target, 'Save Image', false);
    };

    this.updateButtonState(target, 'Saving image...', true);
    requestAnimationFrame(saveImage);
  }

  /**
   * Обновляет состояние кнопки
   * @param {HTMLButtonElement} button - Элемент кнопки
   * @param {string} text - Текст для отображения на кнопке
   * @param {boolean} isDisabled - Флаг отключения кнопки
   */
  updateButtonState(button, text, isDisabled) {
    button.textContent = text;
    button.classList.toggle('disabled', isDisabled);
  }
}

new ImageEditorLite();
