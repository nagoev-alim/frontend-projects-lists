import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

/**
 * Класс ColorGenerator - генератор случайных цветов с возможностью копирования.
 * Создает интерфейс для генерации случайных цветов, отображения их и копирования в буфер обмена.
 */
class ColorGenerator {
  /**
   * Создает экземпляр ColorGenerator.
   * Инициализирует конфигурацию, состояние и утилиты.
   */
  constructor() {
    /** @type {Object} Конфигурация приложения */
    this.config = {
      root: '#app',
      selectors: {
        colorDisplay: '[data-color-display]',
        colorValue: '[data-color-value]',
        generateColor: '[data-generate-color]',
        copyColor: '[data-copy-color]',
      },
      /** @type {Array} Варианты для генерации HEX-цвета */
      variants: [1, 2, 3, 4, 5, 6, 7, 8, 9, 'a', 'b', 'c', 'd', 'e', 'f'],
    };

    /** @type {Object} Состояние приложения, хранящее DOM элементы */
    this.state = {
      elements: {
        colorDisplay: null,
        colorValue: null,
        generateColor: null,
        copyColor: null,
      },
    };

    /** @type {Object} Утилиты приложения */
    this.utils = {
      /** 
       * Обрабатывает строку атрибута для использования в HTML.
       * @param {string} element - Строка атрибута
       * @returns {string} Обработанная строка атрибута
       */
      renderDataAttributes: (element) => element.slice(1, -1),
      /** @type {Object} Конфигурация для Toastify */
      toastConfig: {
        className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
        duration: 3000,
        gravity: 'bottom',
        position: 'center',
      },
      /**
       * Показывает уведомление с помощью Toastify.
       * @param {string} message - Сообщение для отображения
       */
      showToast: (message) => {
        Toastify({
          text: message,
          ...this.utils.toastConfig,
        }).showToast();
      },
      /**
       * Обрабатывает ошибки и показывает уведомление.
       * @param {string} message - Сообщение об ошибке
       * @param {Error} [error] - Объект ошибки
       */
      handleError: (message, error = null) => {
        this.utils.showToast(message);
        if (error) console.error(message, error);
      },
    };

    this.init();
  }

  /**
   * Создает HTML структуру приложения.
   */
  createAppHTML() {
    const {
      root,
      selectors: {
        colorDisplay,
        colorValue,
        generateColor,
        copyColor,
      },
    } = this.config;
    const { renderDataAttributes } = this.utils;
    const rootElement = document.querySelector(root);

    if (!rootElement) return;

    rootElement.innerHTML = `
    <div class='color-generator grid w-full max-w-md gap-4 p-3'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>Color Generator</h1>
      <div class='mx-auto grid max-w-max place-content-center gap-2 rounded border bg-white p-2 text-center shadow'>
        <div class='h-[170px] w-[170px] border bg-[#A1B5C1]' ${renderDataAttributes(colorDisplay)}></div>
        <p class='font-bold' ${renderDataAttributes(colorValue)}>#A1B5C1</p>
      </div>
      <div class='grid place-items-center gap-3'>
        <button class='rounded bg-purple-500 px-3 py-2 font-medium text-white hover:bg-purple-400' ${renderDataAttributes(generateColor)}>Generate color</button>
        <button class='rounded bg-green-500 px-3 py-2 font-medium text-white hover:bg-green-400' ${renderDataAttributes(copyColor)}>Click to copy</button>
      </div>
      <p class='text-center'>Or just press the <span class='font-bold'>"Spacebar"</span> to generate new palettes.</p>
    </div>
  `;
  }

  /**
   * Инициализирует DOM элементы.
   */
  initDOMElements() {
    this.state.elements = {
      colorDisplay: document.querySelector(this.config.selectors.colorDisplay),
      colorValue: document.querySelector(this.config.selectors.colorValue),
      copyColor: document.querySelector(this.config.selectors.copyColor),
      generateColor: document.querySelector(this.config.selectors.generateColor),
    };
  }

  /**
   * Инициализирует приложение.
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();
    this.state.elements.generateColor.addEventListener('click', this.handleGenerateColorClick.bind(this));
    this.state.elements.copyColor.addEventListener('click', this.handleCopyColorClick.bind(this));
    document.addEventListener('keydown', ({ code }) => {
      if (code === 'Space') {
        this.handleGenerateColorClick();
      }
    });
  }

  /**
   * Обработчик клика на кнопку генерации цвета.
   */
  handleGenerateColorClick() {
    const newColor = this.handleGenerateColor();
    const { colorValue, colorDisplay } = this.state.elements;
    colorValue.textContent = newColor;
    colorDisplay.style.backgroundColor = newColor;
  }

  /**
   * Генерирует случайный цвет в формате HEX.
   * @returns {string} Сгенерированный цвет в формате HEX
   */
  handleGenerateColor() {
    const { variants } = this.config;
    const randomHex = () => variants[Math.floor(Math.random() * variants.length)];
    return '#' + Array(6).fill().map(randomHex).join('');
  }

  /**
   * Обработчик клика на кнопку копирования цвета.
   */
  async handleCopyColorClick() {
    const { colorValue } = this.state.elements;
    const color = colorValue.textContent;
    if (!color) return;

    try {
      await navigator.clipboard.writeText(color);
      this.utils.showToast('Color copied to clipboard');
    } catch (error) {
      this.utils.handleError('Failed to copy color', error);
    }
  }
}

new ColorGenerator();
