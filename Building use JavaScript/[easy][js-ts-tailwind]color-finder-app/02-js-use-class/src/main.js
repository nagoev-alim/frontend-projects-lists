import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';
import 'vanilla-colorful';

/**
 * Приложение Color Finder
 *
 * Это приложение позволяет пользователю выбрать цвет с помощью цветового пикера
 * и получить подробную информацию о выбранном цвете, включая его название,
 * значения RGB, HSL, LAB и показатели яркости.
 */


/**
 * Класс ColorPicker представляет собой приложение для выбора и анализа цветов.
 */
class ColorPicker {
  /**
   * Создает экземпляр ColorPicker.
   * Инициализирует конфигурацию, состояние и утилиты приложения.
   */
  constructor() {
    /**
     * Конфигурация приложения.
     * @type {Object}
     * @property {string} root - Селектор корневого элемента.
     * @property {Object} selectors - Селекторы для различных элементов интерфейса.
     * @property {string} API_ENDPOINT - URL конечной точки API для получения данных о цветах.
     */
    this.config = {
      root: '#app',
      selectors: {
        colorInput: '[data-color-input]',
        submitButton: '[data-submit-color]',
        resultContainer: '[data-result-container]',
        colorPicker: 'hex-color-picker',
      },
      API_ENDPOINT: 'https://api.color.pizza/v1/',
    };

    /**
     * Состояние приложения.
     * @type {Object}
     * @property {Object} elements - Содержит ссылки на DOM элементы.
     */
    this.state = {
      elements: {
        colorInput: null,
        submitButton: null,
        resultContainer: null,
        colorPicker: null,
      },
    };

    /**
     * Утилиты приложения.
     * @type {Object}
     */
    this.utils = {
      /**
       * Обрабатывает строку атрибута данных.
       * @param {string} element - Строка атрибута данных.
       * @returns {string} Обработанная строка.
       */
      renderDataAttributes: (element) => element.slice(1, -1),

      /**
       * Конфигурация для уведомлений.
       * @type {Object}
       */
      toastConfig: {
        className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
        duration: 3000,
        gravity: 'bottom',
        position: 'center',
      },

      /**
       * Показывает уведомление.
       * @param {string} message - Текст уведомления.
       */
      showToast: (message) => {
        Toastify({
          text: message,
          ...this.utils.toastConfig,
        }).showToast();
      },

      /**
       * Обрабатывает ошибку.
       * @param {string} message - Сообщение об ошибке.
       * @param {Error} [error] - Объект ошибки (необязательный).
       */
      handleError: (message, error = null) => {
        this.utils.showToast(message);
        if (error) console.error(message, error);
      },
    };

    this.init();
  }


  /**
   * Создает HTML структуру приложения
   */
  createAppHTML() {
    const {
      root,
      selectors: {
        colorInput, submitButton, resultContainer,
      },
    } = this.config;
    const { renderDataAttributes } = this.utils;
    const rootElement = document.querySelector(root);

    if (!rootElement) return;

    rootElement.innerHTML = `
    <div class='grid gap-4 rounded border bg-white p-3 shadow max-w-xl w-full'>
      <h1 class='text-center font-bold text-2xl md:text-4xl'>Color Finder</h1>
      <div class='grid gap-3'>
        <div class='grid gap-3'>
          <hex-color-picker color='#1e88e5'></hex-color-picker>
          <input class='w-full rounded border bg-slate-50 px-3 py-2 text-center font-bold focus:border-blue-400 focus:outline-none' type='text' disabled value='#1e88e5' ${renderDataAttributes(colorInput)}>
          <button class='border px-3 py-2 hover:bg-slate-50' ${renderDataAttributes(submitButton)}>Submit</button>
        </div>
        <div class='grid gap-3' ${renderDataAttributes(resultContainer)}></div>
      </div>
    </div>
  `;
  }

  /**
   * Инициализирует DOM элементы
   */
  initDOMElements() {
    this.state.elements = {
      colorInput: document.querySelector(this.config.selectors.colorInput),
      submitButton: document.querySelector(this.config.selectors.submitButton),
      resultContainer: document.querySelector(this.config.selectors.resultContainer),
      colorPicker: document.querySelector(this.config.selectors.colorPicker),
    };
  }

  /**
   * Инициализирует приложение
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();

    this.state.elements.colorPicker.addEventListener(
      'color-changed',
      ({ detail: { value } }) => (this.state.elements.colorInput.value = value),
    );
    this.state.elements.submitButton.addEventListener('click', this.handleSubmitButtonClick.bind(this));
  }

  /**
   * Обрабатывает клик по кнопке отправки
   */
  async handleSubmitButtonClick() {
    this.updateUIRequest(true);

    try {
      const color = await this.fetchColorData();
      this.state.elements.resultContainer.innerHTML = this.createColorInfoHTML(color);
      setTimeout(this.updateUIRequest.bind(this), 1200);
    } catch (error) {
      this.handleRequestError(error);
    } finally {
      this.state.elements.submitButton.textContent = 'Submit';
    }
  }

  /**
   * Обновляет UI во время запроса
   * @param {boolean} isLoading - Флаг загрузки
   */


  updateUIRequest(isLoading = false) {
    this.state.elements.resultContainer.classList.toggle('open', !isLoading);
    this.state.elements.submitButton.textContent = isLoading ? 'Loading...' : 'Submit';
  }

  /**
   * Получает данные о цвете с API
   * @returns {Promise<Object>} Данные о цвете
   */
  async fetchColorData() {
    const colorValue = this.state.elements.colorInput.value.split('#')[1];
    const {
      data: {
        colors: [color],
      },
    } = await axios.get(`${this.config.API_ENDPOINT}?values=${colorValue}`);
    return color;
  }

  /**
   * Создает HTML для информации о цвете
   * @param {Object} color - Объект с информацией о цвете
   * @returns {string} HTML строка
   */


  createColorInfoHTML(color) {
    return `
    <h3 class='text-center font-bold text-lg'>About <span>${color.hex}</span></h3>
    <img class='w-[200px] border mx-auto' src='${this.createSwatchURL(color)}' alt='${color.name}'>
    <div class='table'>
      ${this.createColorInfoRows(color)}
    </div>
  `;
  }

  /**
   * Создает URL для образца цвета
   * @param {Object} color - Объект с информацией о цвете
   * @returns {string} URL образца цвета
   */


  createSwatchURL(color) {
    const colorValue = this.state.elements.colorInput.value.split('#')[1];
    return `${this.config.API_ENDPOINT}swatch/?color=${colorValue}&name=${color.name}`;
  }

  /**
   * Создает строки с информацией о цвете
   * @param {Object} color - Объект с информацией о цвете
   * @returns {string} HTML строка с информацией о цвете
   */


  createColorInfoRows(color) {
    const rows = [
      { label: 'Color Name', value: color.name },
      {
        label: 'RGB Values',
        value: `(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`,
      },
      {
        label: 'HSL Values',
        value: `(${color.hsl.h.toFixed(0)}, ${color.hsl.s.toFixed(0)}%, ${color.hsl.l.toFixed(0)}%)`,
      },
      {
        label: 'LAB Values',
        value: `(${color.lab.l}, ${color.lab.a}, ${color.lab.b})`,
      },
      { label: 'Luminances', value: `(${color.luminance})` },
      { label: 'Luminance WCAG', value: `(${color.luminanceWCAG})` },
    ];

    return rows
      .map(
        (row) => `
    <p class='grid grid-cols-2'>
      <span class='p-3 border font-medium'>${row.label}</span>
      <span class='p-3 border'>${row.value}</span>
    </p>
  `,
      )
      .join('');
  }

  /**
   * Обрабатывает ошибку запроса
   * @param {Error} error - Объект ошибки
   */


  handleRequestError(error) {
    this.utils.handleError('Error fetching color data', error);
    this.state.elements.resultContainer.classList.remove('open');
    this.state.elements.resultContainer.innerHTML = '';
  }
}

new ColorPicker();
