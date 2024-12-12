import './style.css';

/**
 * Приложение для создания слайдера цен.
 * Позволяет пользователю выбирать минимальную и максимальную цену
 * с помощью ввода или перетаскивания ползунков.
 */

/**
 * Класс RangeSlider представляет собой интерактивный слайдер цен.
 */
class RangeSlider {
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
      elements: {},
      gap: 1000,
    };

    /**
     * Утилиты слайдера.
     * @type {Object}
     */
    this.utils = {
      /**
       * Преобразует данные атрибуты в строку.
       * @param {string} element - Строка с данными атрибутами.
       * @returns {string} Строка без квадратных скобок.
       */
      renderDataAttributes: (element) => element.slice(1, -1),
    };

    this.init();
  }

  /**
   * Создает HTML структуру слайдера.
   */
  createAppHTML() {
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
  initDOMElements() {
    this.state.elements = {
      inputMin: document.querySelector(this.config.selectors.inputMin),
      inputMax: document.querySelector(this.config.selectors.inputMax),
      sliderProgress: document.querySelector(this.config.selectors.sliderProgress),
      rangeMin: document.querySelector(this.config.selectors.rangeMin),
      rangeMax: document.querySelector(this.config.selectors.rangeMax),
    };
  }

  /**
   * Инициализирует слайдер: создает HTML, инициализирует DOM элементы и добавляет слушатели событий.
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();
    [this.state.elements.inputMin, this.state.elements.inputMax].forEach(input => {
      input.addEventListener('input', this.handleInputChange.bind(this));
    });
    [this.state.elements.rangeMin, this.state.elements.rangeMax].forEach(input => {
      input.addEventListener('input', this.handleRangeChange.bind(this));
    });
  }

  /**
   * Обрабатывает изменение значения в текстовых полях ввода
   * @param {Event} event - Событие изменения
   */
  handleInputChange({ target }) {
    const isMin = target.dataset.input === 'min';
    let value = Number(target.value);
    const otherValue = Number(isMin ? this.state.elements.inputMax.value : this.state.elements.inputMin.value);

    value = Math.max(0, Math.min(10000, value));
    value = isMin ? Math.min(value, otherValue - this.state.gap) : Math.max(value, otherValue + this.state.gap);

    target.value = value;
    this.updateRangeInputs();
    this.updateSliderProgress();
  }

  /**
   * Обрабатывает изменение положения ползунков
   * @param {Event} event - Событие изменения
   */
  handleRangeChange({ target }) {
    const isMin = target.dataset.range === 'min';
    let value = Number(target.value);

    value = Math.max(0, Math.min(10000, value));

    if (isMin) {
      this.state.elements.inputMin.value = value;
      if (value > Number(this.state.elements.inputMax.value) - this.state.gap) {
        this.state.elements.inputMax.value = Math.min(10000, value + this.state.gap);
        this.state.elements.rangeMax.value = this.state.elements.inputMax.value;
      }
    } else {
      this.state.elements.inputMax.value = value;
      if (value < Number(this.state.elements.inputMin.value) + this.state.gap) {
        this.state.elements.inputMin.value = Math.max(0, value - this.state.gap);
        this.state.elements.rangeMin.value = this.state.elements.inputMin.value;
      }
    }

    this.updateSliderProgress();
  }

  /**
   * Обновляет значения ползунков в соответствии с текстовыми полями
   */
  updateRangeInputs() {
    this.state.elements.rangeMin.value = this.state.elements.inputMin.value;
    this.state.elements.rangeMax.value = this.state.elements.inputMax.value;
  }

  /**
   * Обновляет визуальное отображение прогресса слайдера
   */
  updateSliderProgress() {
    const minValue = Number(this.state.elements.inputMin.value);
    const maxValue = Number(this.state.elements.inputMax.value);
    const minPercent = (minValue / Number(this.state.elements.rangeMin.max)) * 100;
    const maxPercent = 100 - (maxValue / Number(this.state.elements.rangeMax.max)) * 100;

    this.state.elements.sliderProgress.style.left = `${minPercent}%`;
    this.state.elements.sliderProgress.style.right = `${maxPercent}%`;
  }
}

new RangeSlider();
