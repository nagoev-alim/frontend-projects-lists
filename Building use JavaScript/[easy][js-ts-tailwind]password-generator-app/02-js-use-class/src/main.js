/**
 * Этот код реализует генератор паролей с пользовательским интерфейсом.
 * Он позволяет настраивать длину пароля, выбирать типы символов (строчные, прописные, цифры, символы),
 * генерировать пароль на основе выбранных параметров, копировать его в буфер обмена
 * и отображать индикатор силы пароля.
 */

import './style.css';
import { icons } from 'feather-icons';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

/**
 * Класс, реализующий функциональность генератора паролей.
 */
class PasswordGenerator {
  /**
   * Создает экземпляр PasswordGenerator.
   * Инициализирует конфигурацию, состояние и утилиты.
   */
  constructor() {
    /**
     * Конфигурация приложения.
     * @type {Object}
     */
    this.config = {
      root: '#app',
      selectors: {
        passwordOutput: '[data-password-output]',
        copyButton: '[data-copy-button]',
        strengthIndicator: '[data-strength-indicator]',
        lengthDisplay: '[data-length-display]',
        lengthSlider: '[data-length-slider]',
        charType: '[data-char-type]',
        generateButton: '[data-generate-button]',
      },
      characters: {
        lowercase: () => String.fromCharCode(Math.floor(Math.random() * 26) + 97),
        uppercase: () => String.fromCharCode(Math.floor(Math.random() * 26) + 65),
        numbers: () => String.fromCharCode(Math.floor(Math.random() * 10) + 48),
        symbols: () => '!@#$%^&*(){}[]=<>,.'[Math.floor(Math.random() * 19)],
      },
    };

    /**
     * Состояние приложения.
     * @type {Object}
     */
    this.state = {
      elements: {
        passwordOutput: null,
        copyButton: null,
        strengthIndicator: null,
        lengthDisplay: null,
        lengthSlider: null,
        charType: null,
        generateButton: null,
      },
    };

    /**
     * Утилиты приложения.
     * @type {Object}
     */
    this.utils = {
      /**
       * Обрабатывает строку для использования в data-атрибутах.
       * @param {string} element - Строка для обработки.
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
       * Отображает уведомление.
       * @param {string} message - Текст уведомления.
       */
      showToast: (message) => {
        Toastify({
          text: message,
          ...this.utils.toastConfig,
        }).showToast();
      },

      /**
       * Обрабатывает ошибки.
       * @param {string} message - Сообщение об ошибке.
       * @param {Error} [error] - Объект ошибки (опционально).
       */
      handleError: (message, error = null) => {
        this.utils.showToast(message);
        if (error) console.error(message, error);
      },

      /**
       * Объект с функциями генерации символов.
       * @type {Object}
       */
      chars: Object.keys(this.config.characters).reduce((acc, key) => {
        acc[key] = () => this.config.characters[key]();
        return acc;
      }, {}),
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
        passwordOutput,
        copyButton,
        strengthIndicator,
        lengthDisplay,
        lengthSlider,
        charType,
        generateButton,
      },
    } = this.config;
    const { renderDataAttributes } = this.utils;
    const rootElement = document.querySelector(root);

    if (!rootElement) return;

    rootElement.innerHTML = `
    <div class='grid max-w-md w-full gap-4 rounded border bg-white p-3 shadow'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>Password Generator</h1>
    
      <div class='relative'>
        <input class='w-full rounded border py-2 px-3 pr-8 text-lg tracking-wider' type='text' ${renderDataAttributes(passwordOutput)} disabled>
        <button class='absolute right-1 top-1/2 -translate-y-1/2' ${renderDataAttributes(copyButton)}>
          ${icons.clipboard.toSvg()}
        </button>
      </div>
    
      <div class='h-2 rounded border bg-gray-100 indicator' ${renderDataAttributes(strengthIndicator)}></div>
    
      <div>
        <div class='flex items-center justify-between gap-1'>
          <span>Password Length</span>
          <span ${renderDataAttributes(lengthDisplay)}>15</span>
        </div>
        <input class='range w-full' type='range' value='15' min='1' max='30' step='1' ${renderDataAttributes(lengthSlider)}>
      </div>
    
      <ul class='grid gap-3 sm:grid-cols-2'>
        <li>
          <label class='flex'>
            <input class='visually-hidden' type='checkbox' ${renderDataAttributes(charType)}='lowercase' checked>
            <span class='checkbox'></span>
            <span class='label'>Lowercase (a-z)</span>
          </label>
        </li>
        <li>
          <label class='flex'>
            <input class='visually-hidden' type='checkbox' ${renderDataAttributes(charType)}='uppercase'>
            <span class='checkbox'></span>
            <span class='label'>Uppercase (A-Z)</span>
          </label>
        </li>
        <li>
          <label class='flex'>
            <input class='visually-hidden' type='checkbox' ${renderDataAttributes(charType)}='numbers'>
            <span class='checkbox'></span>
            <span class='label'>Numbers (0-9)</span>
          </label>
        </li>
        <li>
          <label class='flex'>
            <input class='visually-hidden' type='checkbox' ${renderDataAttributes(charType)}='symbols'>
            <span class='checkbox'></span>
            <span class='label'>Symbols (!-$^+)</span>
          </label>
        </li>
      </ul>
      <button class='border px-3 py-2.5 hover:bg-gray-100' ${renderDataAttributes(generateButton)}>Generate Password</button>
    </div>
    `;
  }

  /**
   * Инициализирует DOM элементы.
   */
  initDOMElements() {
    this.state.elements = {
      passwordOutput: document.querySelector(this.config.selectors.passwordOutput),
      copyButton: document.querySelector(this.config.selectors.copyButton),
      strengthIndicator: document.querySelector(this.config.selectors.strengthIndicator),
      lengthDisplay: document.querySelector(this.config.selectors.lengthDisplay),
      lengthSlider: document.querySelector(this.config.selectors.lengthSlider),
      charType: document.querySelectorAll(this.config.selectors.charType),
      generateButton: document.querySelector(this.config.selectors.generateButton),
    };
  }

  /**
   * Инициализирует приложение.
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();

    this.state.elements.lengthSlider.addEventListener('input', this.handleLengthSliderChange.bind(this));
    this.state.elements.generateButton.addEventListener('click', this.handleGenerateButtonClick.bind(this));
    this.state.elements.copyButton.addEventListener('click', this.handleCopyButtonClick.bind(this));
  }

  /**
   * Обрабатывает изменение длины пароля.
   * @param {Event} event - Событие изменения.
   */
  handleLengthSliderChange({ target: { value } }) {
    this.state.elements.lengthDisplay.textContent = value;
  }

  /**
   * Генерирует пароль на основе заданных параметров.
   * @param {Object} options - Параметры генерации пароля.
   * @returns {string} Сгенерированный пароль.
   */
  generatePassword(options) {
    const availableTypes = Object.keys(this.utils.chars).filter(
      (type) => options[type],
    );
    return Array.from({ length: options.length }, () => {
      const randomType =
        availableTypes[Math.floor(Math.random() * availableTypes.length)];
      return this.utils.chars[randomType]();
    }).join('');
  }

  /**
   * Обрабатывает нажатие кнопки генерации пароля.
   */
  handleGenerateButtonClick() {
    const params = Array.from(this.state.elements.charType).reduce((acc, option) => {
      acc[option.dataset.charType] = option.checked;
      return acc;
    }, {});

    const passwordOptions = {
      ...params,
      length: parseInt(this.state.elements.lengthSlider.value, 10),
    };
    this.state.elements.passwordOutput.value = this.generatePassword(passwordOptions);
    this.handleIndicatorUpdate();
  }

  /**
   * Обновляет индикатор силы пароля.
   */
  handleIndicatorUpdate() {
    const value = +this.state.elements.lengthSlider.value;
    const level = value <= 8 ? 'weak' : value <= 16 ? 'medium' : 'strong';
    this.state.elements.strengthIndicator.setAttribute('data-level', level);
  }

  /**
   * Обрабатывает нажатие кнопки копирования пароля.
   */
  async handleCopyButtonClick() {
    const password = this.state.elements.passwordOutput.value;
    if (!password) return;

    try {
      await navigator.clipboard.writeText(password);
      this.utils.showToast('✅ Password copied to clipboard');
    } catch (error) {
      this.utils.handleError('❌ Failed to copy password', error);
    }
  }
}

new PasswordGenerator();