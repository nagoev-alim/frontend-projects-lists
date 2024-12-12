import './style.css';
import { icons } from 'feather-icons';

/**
 * @file Этот файл содержит код для веб-приложения редактора изображений.
 * Приложение позволяет пользователям загружать изображения, применять фильтры,
 * вращать и отражать изображения, а также сохранять отредактированные изображения.
 */

/**
 * Интерфейс для конфигурации приложения
 * @interface
 */
interface AppConfig {
  /** Корневой элемент приложения */
  root: string;
  /** Селекторы для DOM элементов */
  selectors: {
    [key: string]: string;
  };
  /** Опции для редактирования изображения */
  OPTIONS: {
    [key: string]: string | number;
  };
}

/**
 * Интерфейс для состояния приложения
 * @interface
 */
interface AppState {
  /** DOM элементы приложения */
  elements: {
    [key: string]: HTMLElement | HTMLElement[] | null;
  };
  /** Имя текущего изображения */
  imgName: string | null;
  /** Флаг, указывающий, отключены ли элементы управления */
  isDisable: boolean;
}

/**
 * Интерфейс для утилитарных функций приложения
 * @interface
 */
interface AppUtils {
  /** Функция для капитализации первой буквы строки */
  capitalizeFirstLetter: (str: string) => string;
  /** Функция для рендеринга data-атрибутов */
  renderDataAttributes: (element: string) => string;
}

/**
 * Конфигурация приложения
 * @type {AppConfig}
 */
const APP_CONFIG: AppConfig = {
  root: '#app',
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
 * @type {AppState}
 */
const APP_STATE: AppState = {
  elements: {
    filterOption: null,
    sliderName: null,
    sliderValue: null,
    sliderInput: null,
    rotateButton: null,
    previewImage: null,
    resetButton: null,
    fileInput: null,
    chooseButton: null,
    saveButton: null,
  },
  imgName: null,
  isDisable: true,
};

/**
 * Утилитарные функции приложения
 * @type {AppUtils}
 */
const APP_UTILS: AppUtils = {
  capitalizeFirstLetter: (str: string): string => str.charAt(0).toUpperCase() + str.slice(1),
  renderDataAttributes: (element: string): string => element.slice(1, -1),
};

/**
 * Создает HTML структуру приложения
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
 * Инициализирует DOM элементы приложения.
 * Заполняет объект APP_STATE.elements ссылками на необходимые элементы интерфейса.
 */
function initDOMElements(): void {
  APP_STATE.elements = {
    filterOption: Array.from(document.querySelectorAll<HTMLButtonElement>(APP_CONFIG.selectors.filterOption)),
    sliderName: document.querySelector<HTMLParagraphElement>(APP_CONFIG.selectors.sliderName),
    sliderValue: document.querySelector<HTMLParagraphElement>(APP_CONFIG.selectors.sliderValue),
    sliderInput: document.querySelector<HTMLInputElement>(APP_CONFIG.selectors.sliderInput),
    rotateButton: Array.from(document.querySelectorAll<HTMLButtonElement>(APP_CONFIG.selectors.rotateButton)),
    previewImage: document.querySelector<HTMLImageElement>(APP_CONFIG.selectors.previewImage),
    resetButton: document.querySelector<HTMLButtonElement>(APP_CONFIG.selectors.resetButton),
    fileInput: document.querySelector<HTMLInputElement>(APP_CONFIG.selectors.fileInput),
    chooseButton: document.querySelector<HTMLButtonElement>(APP_CONFIG.selectors.chooseButton),
    saveButton: document.querySelector<HTMLButtonElement>(APP_CONFIG.selectors.saveButton),
  };
}

/**
 * Инициализирует приложение.
 * Создает HTML структуру, инициализирует DOM элементы и устанавливает обработчики событий.
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();

  (APP_STATE.elements.sliderInput as HTMLInputElement).addEventListener('input', handleSliderInputChange);
  (APP_STATE.elements.filterOption as HTMLElement[]).forEach((option) => option.addEventListener('click', handleOptionClick));
  (APP_STATE.elements.rotateButton as HTMLElement[]).forEach((button) => button.addEventListener('click', handleButtonClick));
  (APP_STATE.elements.fileInput as HTMLInputElement).addEventListener('change', handleFileImageChange);
  (APP_STATE.elements.resetButton as HTMLButtonElement).addEventListener('click', handleResetButtonClick);
  (APP_STATE.elements.saveButton as HTMLButtonElement).addEventListener('click', handleSaveButtonClick);
  (APP_STATE.elements.chooseButton as HTMLButtonElement).addEventListener('click', () => (APP_STATE.elements.fileInput as HTMLInputElement).click());
}

/**
 * Обрабатывает изменение значения слайдера.
 * Обновляет отображаемое значение и применяет фильтр к изображению.
 * @param {Event} event - Событие изменения значения слайдера.
 */
function handleSliderInputChange(event: Event): void {
  const value = (event.target as HTMLInputElement).value;
  if (APP_STATE.isDisable) return;

  (APP_STATE.elements.sliderValue as HTMLElement).textContent = `${value}%`;

  const activeFilter = document.querySelector(`${APP_CONFIG.selectors.filterOption}.active`) as HTMLElement;
  APP_CONFIG.OPTIONS[activeFilter.dataset.filterOption as string] = value;

  applyFilter();
}

/**
 * Применяет текущие фильтры и трансформации к изображению.
 */
function applyFilter(): void {
  if (APP_STATE.isDisable) return;

  const { previewImage } = APP_STATE.elements as { previewImage: HTMLImageElement };
  const { rotate, flipHorizontal, flipVertical, brightness, saturation, inversion, grayscale } = APP_CONFIG.OPTIONS;

  previewImage.classList.remove('hidden');
  previewImage.nextElementSibling?.classList.add('hidden');

  previewImage.style.transform = `rotate(${rotate}deg) scale(${flipHorizontal}, ${flipVertical})`;
  previewImage.style.filter = `brightness(${brightness}%) saturate(${saturation}%) invert(${inversion}%) grayscale(${grayscale}%)`;
}

/**
 * Обрабатывает клик по опции фильтра.
 * Обновляет активный фильтр и соответствующие элементы управления.
 * @param {MouseEvent} event - Событие клика мыши.
 */
function handleOptionClick(event: MouseEvent): void {
  const target = event.target as HTMLElement;
  if (APP_STATE.isDisable) return;

  const { filterOption, sliderName, sliderInput, sliderValue } = APP_STATE.elements as {
    filterOption: HTMLElement[];
    sliderName: HTMLElement;
    sliderInput: HTMLInputElement;
    sliderValue: HTMLElement;
  };
  const filterType = target.dataset.filterOption as string;

  const activeClasses = ['active', 'bg-neutral-400', 'text-white', 'hover:bg-neutral-500'];

  filterOption.forEach(option => option.classList.remove(...activeClasses));
  target.classList.add(...activeClasses);

  sliderName.textContent = target.textContent;
  sliderInput.max = '200';
  sliderInput.value = APP_CONFIG.OPTIONS[filterType] as string;
  sliderValue.textContent = `${APP_CONFIG.OPTIONS[filterType]}%`;
}

/**
 * Обрабатывает клик по кнопкам вращения и отражения изображения.
 * @param {MouseEvent} event - Событие клика мыши.
 */
function handleButtonClick(event: MouseEvent): void {
  const target = event.target as HTMLElement;
  if (APP_STATE.isDisable) return;

  const direction = target.dataset.rotateDirection as 'left' | 'right' | 'horizontal' | 'vertical';
  const { rotate, flipHorizontal, flipVertical } = APP_CONFIG.OPTIONS;

  const actions: { [key: string]: () => number } = {
    left: () => Number(rotate) - 90,
    right: () => Number(rotate) + 90,
    horizontal: () => Number(flipHorizontal) * -1,
    vertical: () => Number(flipVertical) * -1,
  };

  if (direction in actions) {
    const newValue = actions[direction]();
    APP_CONFIG.OPTIONS[direction === 'left' || direction === 'right' ? 'rotate' : `flip${direction.charAt(0).toUpperCase() + direction.slice(1)}`] = newValue;
    applyFilter();
  }
}

/**
 * Обрабатывает изменение файла изображения.
 * @param {Event} event - Событие изменения файла.
 */
function handleFileImageChange(event: Event): void {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const { previewImage, resetButton } = APP_STATE.elements as {
    previewImage: HTMLImageElement;
    resetButton: HTMLButtonElement;
  };
  const fileReader = new FileReader();

  fileReader.onload = () => {
    previewImage.src = fileReader.result as string;
    previewImage.addEventListener('load', () => {
      APP_STATE.isDisable = false;
      resetButton.click();
      APP_STATE.imgName = file.name.split(/[\/\\]/).pop() || null;
    }, { once: true });
  };

  fileReader.readAsDataURL(file);
}

/**
 * Обрабатывает клик по кнопке сброса фильтров.
 * Возвращает все настройки к значениям по умолчанию.
 */
function handleResetButtonClick(): void {
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

  const [firstFilterOption] = APP_STATE.elements.filterOption as HTMLElement[];
  firstFilterOption.click();
  applyFilter();
}

/**
 * Обрабатывает клик по кнопке сохранения изображения.
 * Создает canvas, применяет фильтры и трансформации, затем сохраняет результат.
 * @param {MouseEvent} event - Событие клика мыши.
 */
function handleSaveButtonClick(event: MouseEvent): void {
  if (APP_STATE.isDisable) return;

  const saveImage = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const { previewImage } = APP_STATE.elements as { previewImage: HTMLImageElement };
    const { naturalWidth: width, naturalHeight: height } = previewImage;
    const { brightness, saturation, inversion, grayscale, rotate, flipHorizontal, flipVertical } = APP_CONFIG.OPTIONS;

    canvas.width = width;
    canvas.height = height;

    if (ctx) {
      ctx.filter = `brightness(${brightness}%) saturate(${saturation}%) invert(${inversion}%) grayscale(${grayscale}%)`;
      ctx.translate(width / 2, height / 2);
      if (rotate !== 0) ctx.rotate((Number(rotate) * Math.PI) / 180);
      ctx.scale(Number(flipHorizontal), Number(flipVertical));
      ctx.drawImage(previewImage, -width / 2, -height / 2, width, height);

      const link = document.createElement('a');
      link.download = APP_STATE.imgName || 'image';
      link.href = canvas.toDataURL();
      link.click();
    }

    updateButtonState(event.target as HTMLButtonElement, 'Save Image', false);
  };

  updateButtonState(event.target as HTMLButtonElement, 'Saving image...', true);
  requestAnimationFrame(saveImage);
}

/**
 * Обновляет состояние кнопки (текст и доступность).
 * @param {HTMLButtonElement} button - Кнопка для обновления.
 * @param {string} text - Новый текст кнопки.
 * @param {boolean} isDisabled - Флаг, указывающий, должна ли кнопка быть отключена.
 */
function updateButtonState(button: HTMLButtonElement, text: string, isDisabled: boolean): void {
  button.textContent = text;
  button.classList.toggle('disabled', isDisabled);
}

initApp();
