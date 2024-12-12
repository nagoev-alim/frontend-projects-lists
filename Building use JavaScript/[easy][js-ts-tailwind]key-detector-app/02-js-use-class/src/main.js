/**
 * Этот модуль реализует интерактивное приложение для отображения информации о нажатых клавишах.
 * Он создает пользовательский интерфейс, который показывает код клавиши и ее название при нажатии любой клавиши на клавиатуре.
 */

import './style.css';

/**
 * Класс для обнаружения и отображения информации о нажатых клавишах.
 */
class KeyPressDetector {
  /**
   * Создает экземпляр KeyPressDetector.
   */
  constructor() {
    /**
     * Конфигурация приложения.
     * @type {Object}
     */
    this.config = {
      /** Корневой элемент приложения. */
      root: '#app',
      /** Селекторы для различных элементов UI. */
      selectors: {
        instruction: '[data-instruction]',
        resultContainer: '[data-result-container]',
        keyDisplay: '[data-key-display]',
        keycodeDisplay: '[data-keycode-display]',
      },
    };

    /**
     * Состояние приложения.
     * @type {Object}
     */
    this.state = {
      /** Элементы DOM. */
      elements: {
        instruction: null,
        resultContainer: null,
        keyDisplay: null,
        keycodeDisplay: null,
      },
    };

    /**
     * Утилиты приложения.
     * @type {Object}
     */
    this.utils = {
      /**
       * Преобразует селектор атрибута в строку для data-атрибута.
       * @param {string} element - Селектор элемента.
       * @returns {string} Строка для data-атрибута.
       */
      renderDataAttributes: (element) => element.slice(1, -1),
    };

    this.init();
  }

  /**
   * Создает HTML-структуру приложения.
   */
  createAppHTML() {
    const { root, selectors: { instruction, resultContainer, keyDisplay, keycodeDisplay } } = this.config;
    const { renderDataAttributes } = this.utils;
    const rootElement = document.querySelector(root);

    if (!rootElement) return;

    rootElement.innerHTML = `
    <div class='border shadow rounded max-w-md w-full p-3 grid gap-4'>
      <p class='font-bold text-center text-2xl md:text-3xl' ${renderDataAttributes(instruction)}>Press any key</p>
      <div class='grid gap-4' ${renderDataAttributes(resultContainer)}>
        <div class='grid gap-2 place-items-center'>
          <span class='inline-flex justify-center items-center text-red-400 uppercase font-bold text-4xl border-4 border-red-400 rounded-full w-[70px] h-[70px] md:w-[90px] md:h-[90px]' ${renderDataAttributes(keycodeDisplay)}></span>
          <span class='uppercase font-bold text-2xl text-red-400 md:text-4xl' ${renderDataAttributes(keyDisplay)}></span>
        </div>
        <div class='grid grid-cols-2 place-items-center'>
          <p class='font-bold text-2xl text-center w-full'>Key: <span class='font-normal' ${renderDataAttributes(keyDisplay)}></span></p>
          <p class='font-bold text-2xl text-center border-l-2 border-slate-900 w-full'>Code: <span class='font-normal' ${renderDataAttributes(keycodeDisplay)}></span></p>
        </div>
      </div>
    </div>
  `;
  }

  /**
   * Инициализирует элементы DOM.
   */
  initDOMElements() {
    this.state.elements = {
      instruction: document.querySelector(this.config.selectors.instruction),
      resultContainer: document.querySelector(this.config.selectors.resultContainer),
      keyDisplay: document.querySelectorAll(this.config.selectors.keyDisplay),
      keycodeDisplay: document.querySelectorAll(this.config.selectors.keycodeDisplay),
    };
  }

  /**
   * Инициализирует приложение.
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    if (this.state.elements.resultContainer) this.state.elements.resultContainer.classList.add('hidden');
  }

  /**
   * Обрабатывает событие нажатия клавиши.
   * @param {KeyboardEvent} event - Событие клавиатуры.
   */
  handleKeyDown({ key, keyCode }) {
    if (this.state.elements.instruction && this.state.elements.resultContainer) {
      this.state.elements.instruction.classList.add('hidden');
      this.state.elements.resultContainer.classList.remove('hidden');
    }
    this.state.elements.keyDisplay.forEach(
      (k) => (k.textContent = key === ' ' ? 'Space' : key),
    );
    this.state.elements.keycodeDisplay.forEach((k) => (k.textContent = keyCode.toString()));
  }
}

new KeyPressDetector();