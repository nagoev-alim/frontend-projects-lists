/**
 * Модуль Color Finder
 *
 * Этот модуль представляет собой приложение для поиска информации о цветах.
 * Он позволяет пользователю выбрать цвет с помощью цветового пикера,
 * отправить запрос на API для получения информации о выбранном цвете,
 * и отобразить полученную информацию на странице.
 *
 * @module ColorFinder
 */

import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';
import 'vanilla-colorful';
import { HexColorPicker } from 'vanilla-colorful';

/**
 * @interface AppConfig
 * @description Конфигурация приложения
 */
interface AppConfig {
  /** Корневой элемент приложения */
  root: string;
  /** Селекторы для элементов DOM */
  selectors: {
    [key: string]: string;
  };
  /** Конечная точка API для получения данных о цветах */
  API_ENDPOINT: string;
}

/**
 * @interface AppState
 * @description Состояние приложения
 */
interface AppState {
  /** Элементы DOM, используемые в приложении */
  elements: {
    colorInput: HTMLInputElement;
    submitButton: HTMLButtonElement;
    resultContainer: HTMLDivElement;
    colorPicker: HexColorPicker;
  };
}

/**
 * @interface AppUtils
 * @description Утилиты приложения
 */
interface AppUtils {
  /**
   * Преобразует строку атрибута в формат для data-атрибутов
   * @param {string} element - Строка с атрибутом
   * @returns {string} Преобразованная строка
   */
  renderDataAttributes: (element: string) => string;
  /** Конфигурация для уведомлений */
  toastConfig: {
    className: string;
    duration?: number;
    gravity?: 'top' | 'bottom';
    position?: 'left' | 'center' | 'right';
  };
  /**
   * Показывает уведомление
   * @param {string} message - Текст уведомления
   */
  showToast: (message: string) => void;
  /**
   * Обрабатывает ошибки
   * @param {string} message - Сообщение об ошибке
   * @param {any} [error] - Объект ошибки
   */
  handleError: (message: string, error?: any) => void;
}

/**
 * @interface Color
 * @description Представление цвета и его характеристик
 */
interface Color {
  /** Шестнадцатеричное представление цвета */
  hex: string;
  /** Название цвета */
  name: string;
  /** RGB значения */
  rgb: {
    r: number;
    g: number;
    b: number;
  };
  /** HSL значения */
  hsl: {
    h: number;
    s: number;
    l: number;
  };
  /** LAB значения */
  lab: {
    l: number;
    a: number;
    b: number;
  };
  /** Яркость */
  luminance: number;
  /** Яркость по WCAG */
  luminanceWCAG: number;
}

/**
 * @interface ColorResponse
 * @description Ответ API с информацией о цветах
 */
interface ColorResponse {
  /** Массив цветов */
  colors: Color[];
}

class ColorPicker {
  private readonly config: AppConfig;
  private state: AppState;
  private readonly utils: AppUtils;

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
        colorInput: document.createElement('input'),
        submitButton: document.createElement('button'),
        resultContainer: document.createElement('div'),
        colorPicker: document.createElement('hex-color-picker'),
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
      colorInput: document.querySelector(this.config.selectors.colorInput) as HTMLInputElement,
      submitButton: document.querySelector(this.config.selectors.submitButton) as HTMLButtonElement,
      resultContainer: document.querySelector(this.config.selectors.resultContainer) as HTMLDivElement,
      colorPicker: document.querySelector(this.config.selectors.colorPicker) as HexColorPicker,
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
   * Обрабатывает нажатие кнопки отправки.
   * Запускает процесс получения данных о цвете, обновляет UI и обрабатывает возможные ошибки.
   * @returns {Promise<void>}
   * @throws {Error} Если произошла ошибка при получении данных о цвете
   */
  async handleSubmitButtonClick(): Promise<void> {
    try {
      this.updateUIRequest(true);
      const color = await this.fetchColorData();
      this.state.elements.resultContainer.innerHTML = this.createColorInfoHTML(color);
      setTimeout(() => this.updateUIRequest(false), 1200);
    } catch (error: unknown) {
      this.handleRequestError(error instanceof Error ? error : new Error('An unknown error occurred'));
    } finally {
      this.state.elements.submitButton.textContent = 'Submit';
    }
  }

  /**
   * Обновляет UI в зависимости от состояния загрузки.
   * @param {boolean} isLoading - Флаг, указывающий на состояние загрузки
   */
  updateUIRequest(isLoading: boolean): void {
    this.state.elements.resultContainer.classList.toggle('open', !isLoading);
    this.state.elements.submitButton.textContent = isLoading ? 'Loading...' : 'Submit';
  }

  /**
   * Получает данные о цвете от API.
   * @returns {Promise<Color>} Объект с данными о цвете
   * @throws {Error} Если произошла ошибка при запросе к API
   */
  async fetchColorData(): Promise<Color> {
    const colorValue = this.state.elements.colorInput.value.replace('#', '');
    const response = await axios.get<ColorResponse>(`${this.config.API_ENDPOINT}?values=${colorValue}`);
    return response.data.colors[0];
  }

  /**
   * Создает HTML-разметку для отображения информации о цвете.
   * @param {Color} color - Объект с данными о цвете
   * @returns {string} HTML-разметка с информацией о цвете
   */
  createColorInfoHTML(color: Color): string {
    return `
    <h3 class='text-center font-bold text-lg'>About <span>${color.hex}</span></h3>
    <img class='w-[200px] border mx-auto' src='${this.createSwatchURL(color)}' alt='${color.name}'>
    <div class='table'>
      ${this.createColorInfoRows(color)}
    </div>
  `;
  }

  /**
   * Создает URL для изображения цветового образца.
   * @param {Color} color - Объект с данными о цвете
   * @returns {string} URL изображения цветового образца
   */
  createSwatchURL(color: Color): string {
    const colorValue = this.state.elements.colorInput.value.slice(1);
    return `${this.config.API_ENDPOINT}swatch/?color=${colorValue}&name=${encodeURIComponent(color.name)}`;
  }

  /**
   * Создает HTML-разметку для отображения информации о цвете в виде таблицы.
   * @param {Color} color - Объект с данными о цвете
   * @returns {string} HTML-разметка с информацией о цвете в виде таблицы
   */
  createColorInfoRows(color: Color): string {
    const rows = [
      { label: 'Color Name', value: color.name },
      { label: 'RGB Values', value: `(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})` },
      {
        label: 'HSL Values',
        value: `(${color.hsl.h.toFixed(0)}, ${color.hsl.s.toFixed(0)}%, ${color.hsl.l.toFixed(0)}%)`,
      },
      {
        label: 'LAB Values',
        value: `(${color.lab.l.toFixed(2)}, ${color.lab.a.toFixed(2)}, ${color.lab.b.toFixed(2)})`,
      },
      { label: 'Luminance', value: color.luminance.toFixed(4) },
      { label: 'Luminance WCAG', value: color.luminanceWCAG.toFixed(4) },
    ];

    return rows
      .map(({ label, value }) => `
      <p class='grid grid-cols-2'>
        <span class='p-3 border font-medium'>${label}</span>
        <span class='p-3 border'>${value}</span>
      </p>
    `)
      .join('');
  }

  /**
   * Обрабатывает ошибки, возникшие при запросе данных о цвете.
   * @param {Error} error - Объект ошибки
   */
  handleRequestError(error: Error): void {
    this.utils.handleError('Error fetching color data', error);
    this.state.elements.resultContainer.classList.remove('open');
    this.state.elements.resultContainer.innerHTML = '';
  }

}

new ColorPicker();
