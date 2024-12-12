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


class ImageEditorLite {
  private readonly config: AppConfig;
  private readonly state: AppState;
  private readonly utils: AppUtils;

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
      filterOption: Array.from(document.querySelectorAll<HTMLButtonElement>(this.config.selectors.filterOption)),
      sliderName: document.querySelector<HTMLParagraphElement>(this.config.selectors.sliderName),
      sliderValue: document.querySelector<HTMLParagraphElement>(this.config.selectors.sliderValue),
      sliderInput: document.querySelector<HTMLInputElement>(this.config.selectors.sliderInput),
      rotateButton: Array.from(document.querySelectorAll<HTMLButtonElement>(this.config.selectors.rotateButton)),
      previewImage: document.querySelector<HTMLImageElement>(this.config.selectors.previewImage),
      resetButton: document.querySelector<HTMLButtonElement>(this.config.selectors.resetButton),
      fileInput: document.querySelector<HTMLInputElement>(this.config.selectors.fileInput),
      chooseButton: document.querySelector<HTMLButtonElement>(this.config.selectors.chooseButton),
      saveButton: document.querySelector<HTMLButtonElement>(this.config.selectors.saveButton),
    };
  }

  /**
   * Инициализация приложения
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();

    (this.state.elements.sliderInput as HTMLInputElement).addEventListener('input', this.handleSliderInputChange.bind(this));
    (this.state.elements.filterOption as HTMLElement[]).forEach((option) => option.addEventListener('click', this.handleOptionClick.bind(this)));
    (this.state.elements.rotateButton as HTMLElement[]).forEach((button) => button.addEventListener('click', this.handleButtonClick.bind(this)));
    (this.state.elements.fileInput as HTMLInputElement).addEventListener('change', this.handleFileImageChange.bind(this));
    (this.state.elements.resetButton as HTMLButtonElement).addEventListener('click', this.handleResetButtonClick.bind(this));
    (this.state.elements.saveButton as HTMLButtonElement).addEventListener('click', this.handleSaveButtonClick.bind(this));
    (this.state.elements.chooseButton as HTMLButtonElement).addEventListener('click', () => (this.state.elements.fileInput as HTMLInputElement).click());
  }

  /**
   * Обрабатывает изменение значения слайдера.
   * Обновляет отображаемое значение и применяет фильтр к изображению.
   * @param {Event} event - Событие изменения значения слайдера.
   */
  handleSliderInputChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (this.state.isDisable) return;

    (this.state.elements.sliderValue as HTMLElement).textContent = `${value}%`;

    const activeFilter = document.querySelector(`${this.config.selectors.filterOption}.active`) as HTMLElement;
    this.config.OPTIONS[activeFilter.dataset.filterOption as string] = value;

    this.applyFilter();
  }

  /**
   * Применяет текущие фильтры и трансформации к изображению.
   */
  applyFilter(): void {
    if (this.state.isDisable) return;

    const { previewImage } = this.state.elements as { previewImage: HTMLImageElement };
    const { rotate, flipHorizontal, flipVertical, brightness, saturation, inversion, grayscale } = this.config.OPTIONS;

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
  handleOptionClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (this.state.isDisable) return;

    const { filterOption, sliderName, sliderInput, sliderValue } = this.state.elements as {
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
    sliderInput.value = this.config.OPTIONS[filterType] as string;
    sliderValue.textContent = `${this.config.OPTIONS[filterType]}%`;
  }

  /**
   * Обрабатывает клик по кнопкам вращения и отражения изображения.
   * @param {MouseEvent} event - Событие клика мыши.
   */
  handleButtonClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (this.state.isDisable) return;

    const direction = target.dataset.rotateDirection as 'left' | 'right' | 'horizontal' | 'vertical';
    const { rotate, flipHorizontal, flipVertical } = this.config.OPTIONS;

    const actions: { [key: string]: () => number } = {
      left: () => Number(rotate) - 90,
      right: () => Number(rotate) + 90,
      horizontal: () => Number(flipHorizontal) * -1,
      vertical: () => Number(flipVertical) * -1,
    };

    if (direction in actions) {
      const newValue = actions[direction]();
      this.config.OPTIONS[direction === 'left' || direction === 'right' ? 'rotate' : `flip${direction.charAt(0).toUpperCase() + direction.slice(1)}`] = newValue;
      this.applyFilter();
    }
  }

  /**
   * Обрабатывает изменение файла изображения.
   * @param {Event} event - Событие изменения файла.
   */
  handleFileImageChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const { previewImage, resetButton } = this.state.elements as {
      previewImage: HTMLImageElement;
      resetButton: HTMLButtonElement;
    };
    const fileReader = new FileReader();

    fileReader.onload = () => {
      previewImage.src = fileReader.result as string;
      previewImage.addEventListener('load', () => {
        this.state.isDisable = false;
        resetButton.click();
        this.state.imgName = file.name.split(/[\/\\]/).pop() || null;
      }, { once: true });
    };

    fileReader.readAsDataURL(file);
  }

  /**
   * Обрабатывает клик по кнопке сброса фильтров.
   * Возвращает все настройки к значениям по умолчанию.
   */
  handleResetButtonClick(): void {
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

    const [firstFilterOption] = this.state.elements.filterOption as HTMLElement[];
    firstFilterOption.click();
    this.applyFilter();
  }

  /**
   * Обрабатывает клик по кнопке сохранения изображения.
   * Создает canvas, применяет фильтры и трансформации, затем сохраняет результат.
   * @param {MouseEvent} event - Событие клика мыши.
   */
  handleSaveButtonClick(event: MouseEvent): void {
    if (this.state.isDisable) return;

    const saveImage = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const { previewImage } = this.state.elements as { previewImage: HTMLImageElement };
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

      if (ctx) {
        ctx.filter = `brightness(${brightness}%) saturate(${saturation}%) invert(${inversion}%) grayscale(${grayscale}%)`;
        ctx.translate(width / 2, height / 2);
        if (rotate !== 0) ctx.rotate((Number(rotate) * Math.PI) / 180);
        ctx.scale(Number(flipHorizontal), Number(flipVertical));
        ctx.drawImage(previewImage, -width / 2, -height / 2, width, height);

        const link = document.createElement('a');
        link.download = this.state.imgName || 'image';
        link.href = canvas.toDataURL();
        link.click();
      }

      this.updateButtonState(event.target as HTMLButtonElement, 'Save Image', false);
    };

    this.updateButtonState(event.target as HTMLButtonElement, 'Saving image...', true);
    requestAnimationFrame(saveImage);
  }

  /**
   * Обновляет состояние кнопки (текст и доступность).
   * @param {HTMLButtonElement} button - Кнопка для обновления.
   * @param {string} text - Новый текст кнопки.
   * @param {boolean} isDisabled - Флаг, указывающий, должна ли кнопка быть отключена.
   */
  updateButtonState(button: HTMLButtonElement, text: string, isDisabled: boolean): void {
    button.textContent = text;
    button.classList.toggle('disabled', isDisabled);
  }
}

new ImageEditorLite();
