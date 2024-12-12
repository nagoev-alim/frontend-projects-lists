/**
 * @fileoverview Этот файл содержит код для создания интерактивного слайдера цен.
 * Пользователь может управлять диапазоном цен с помощью ползунков или путем ввода
 * значений в поля ввода. Слайдер визуально отображает выбранный диапазон цен.
 */

import './style.css';

/**
 * Конфигурация приложения.
 * @interface
 */
interface AppConfig {
  /** Селектор корневого элемента */
  root: string;
  /** Селекторы элементов управления */
  selectors: {
    /** Селектор поля ввода минимальной цены */
    inputMin: string;
    /** Селектор поля ввода максимальной цены */
    inputMax: string;
    /** Селектор элемента прогресса слайдера */
    sliderProgress: string;
    /** Селектор ползунка минимальной цены */
    rangeMin: string;
    /** Селектор ползунка максимальной цены */
    rangeMax: string;
  };
}

/**
 * Состояние приложения.
 * @interface
 */
interface AppState {
  /** Элементы управления */
  elements: {
    /** Поле ввода минимальной цены */
    inputMin: HTMLInputElement;
    /** Поле ввода максимальной цены */
    inputMax: HTMLInputElement;
    /** Элемент прогресса слайдера */
    sliderProgress: HTMLDivElement;
    /** Ползунок минимальной цены */
    rangeMin: HTMLInputElement;
    /** Ползунок максимальной цены */
    rangeMax: HTMLInputElement;
  };
  /** Минимальный разрыв между значениями */
  gap: number;
}

/**
 * Утилиты приложения.
 * @interface
 */
interface AppUtils {
  /**
   * Преобразует строку селектора в строку атрибута данных.
   * @param {string} element - Строка селектора.
   * @returns {string} Строка атрибута данных.
   */
  renderDataAttributes: (element: string) => string;
}

/**
 * Класс RangeSlider представляет собой интерактивный слайдер цен.
 */
class RangeSlider {
  private readonly config: AppConfig;
  private readonly state: AppState;
  private readonly utils: AppUtils;

  /**
   * Создает экземпляр RangeSlider.
   * Инициализирует конфигурацию, состояние и утилиты слайдера.
   */
  constructor() {
    /**
     * Конфигурация слайдера.
     * @type {Object}
     * @property {string} root - Селектор корневого элемента.
     * @property {Object} selectors - Селекторы для различных элементов DOM.
     */
    this.config = {
      root: '#app',
      selectors: {
        inputMin: '[data-input="min"]',
        inputMax: '[data-input="max"]',
        sliderProgress: '[data-slider-progress]',
        rangeMin: '[data-range="min"]',
        rangeMax: '[data-range="max"]',
      },
    };

    /**
     * Состояние слайдера.
     * @type {Object}
     * @property {Object} elements - Объект для хранения DOM элементов.
     * @property {number} gap - Минимальный разрыв между min и max значениями.
     */
    this.state = {
      elements: {
        inputMin: document.createElement('input'),
        inputMax: document.createElement('input'),
        sliderProgress: document.createElement('div'),
        rangeMin: document.createElement('input'),
        rangeMax: document.createElement('input'),
      },
      gap: 1000,
    };

    /**
     * Утилиты слайдера.
     * @type {Object}
     */
    this.utils = {
      renderDataAttributes: (element: string) => element.slice(1, -1),
    };

    this.init();
  }

  /**
   * Создает HTML структуру слайдера.
   */
  private createAppHTML(): void {
    const {
      root,
      selectors: {
        inputMin,
        inputMax,
        sliderProgress,
        rangeMin,
        rangeMax,
      },
    } = this.config;
    const { renderDataAttributes } = this.utils;
    const rootElement = document.querySelector(root);

    if (!rootElement) return;

    rootElement.innerHTML = `
    <div class='price-slider bg-white border gap-4 grid max-w-md p-3 rounded shadow w-full'>
      <h1 class='font-bold md:text-4xl text-2xl text-center'>Price Slider</h1>
      <p>Use slider or enter min and max price</p>
      <div>
        <label class='gap-2 grid'>
          <span>Min</span>
          <input class='bg-slate-50 border focus:border-blue-400 focus:outline-none px-3 py-2 rounded w-full' 
                 type='number' ${renderDataAttributes(inputMin)} value='1800'>
        </label>
        <span class='separator'></span>
        <label class='gap-2 grid'>
          <span>Max</span>
          <input class='bg-slate-50 border focus:border-blue-400 focus:outline-none px-3 py-2 rounded w-full' 
                 type='number' ${renderDataAttributes(inputMax)} value='7800'>
        </label>
      </div>
      <div class='slider'>
        <div class='slider__progress' ${renderDataAttributes(sliderProgress)}></div>
      </div>
      <div class='ranges'>
        <input class='ranges__input' type='range' ${renderDataAttributes(rangeMin)} min='0' max='10000' value='1800' step='100'>
        <input class='ranges__input' type='range' ${renderDataAttributes(rangeMax)} min='0' max='10000' value='7800' step='100'>
      </div>
    </div>
  `;
  }

  /**
   * Инициализирует DOM элементы и сохраняет их в состоянии.
   */
  private initDOMElements(): void {
    this.state.elements = {
      inputMin: document.querySelector(this.config.selectors.inputMin) as HTMLInputElement,
      inputMax: document.querySelector(this.config.selectors.inputMax) as HTMLInputElement,
      sliderProgress: document.querySelector(this.config.selectors.sliderProgress) as HTMLDivElement,
      rangeMin: document.querySelector(this.config.selectors.rangeMin) as HTMLInputElement,
      rangeMax: document.querySelector(this.config.selectors.rangeMax) as HTMLInputElement,
    };
  }

  /**
   * Инициализирует слайдер: создает HTML, инициализирует DOM элементы и добавляет слушатели событий.
   */
  private init(): void {
    this.createAppHTML();
    this.initDOMElements();
    [this.state.elements.inputMin, this.state.elements.inputMax].forEach(input => {
      input.addEventListener('input', this.handleInputChange.bind(this) as EventListener);
    });
    [this.state.elements.rangeMin, this.state.elements.rangeMax].forEach(input => {
      input.addEventListener('input', this.handleRangeChange.bind(this) as EventListener);
    });
  }


  /**
   * Обрабатывает изменение значения в полях ввода.
   * @function
   * @param {InputEvent} event - Событие ввода.
   */
  private handleInputChange(event: InputEvent): void {
    const target = event.target as HTMLInputElement;
    const isMin = target.dataset.input === 'min';
    let value = Number(target.value);
    const otherValue = Number(isMin ? this.state.elements.inputMax.value : this.state.elements.inputMin.value);

    value = Math.max(0, Math.min(10000, value));
    value = isMin ? Math.min(value, otherValue - this.state.gap) : Math.max(value, otherValue + this.state.gap);

    target.value = value.toString();
    this.updateRangeInputs();
    this.updateSliderProgress();
  }

  /**
   * Обрабатывает изменение значения ползунков.
   * @function
   * @param {InputEvent} event - Событие ввода.
   */
  private handleRangeChange(event: InputEvent): void {
    const target = event.target as HTMLInputElement;
    const isMin = target.dataset.range === 'min';
    let value = Number(target.value);

    value = Math.max(0, Math.min(10000, value));

    if (isMin) {
      this.state.elements.inputMin.value = value.toString();
      if (value > Number(this.state.elements.inputMax.value) - this.state.gap) {
        this.state.elements.inputMax.value = Math.min(10000, value + this.state.gap).toString();
        this.state.elements.rangeMax.value = this.state.elements.inputMax.value;
      }
    } else {
      this.state.elements.inputMax.value = value.toString();
      if (value < Number(this.state.elements.inputMin.value) + this.state.gap) {
        this.state.elements.inputMin.value = Math.max(0, value - this.state.gap).toString();
        this.state.elements.rangeMin.value = this.state.elements.inputMin.value;
      }
    }

    this.updateSliderProgress();
  }

  /**
   * Обновляет значения ползунков в соответствии с полями ввода.
   * @function
   */
  private updateRangeInputs(): void {
    this.state.elements.rangeMin.value = this.state.elements.inputMin.value;
    this.state.elements.rangeMax.value = this.state.elements.inputMax.value;
  }

  /**
   * Обновляет визуальное отображение прогресса слайдера.
   * @function
   */
  private updateSliderProgress(): void {
    const minValue = Number(this.state.elements.inputMin.value);
    const maxValue = Number(this.state.elements.inputMax.value);
    const minPercent = (minValue / Number(this.state.elements.rangeMin.max)) * 100;
    const maxPercent = 100 - (maxValue / Number(this.state.elements.rangeMax.max)) * 100;

    this.state.elements.sliderProgress.style.left = `${minPercent}%`;
    this.state.elements.sliderProgress.style.right = `${maxPercent}%`;
  }


}

new RangeSlider();
