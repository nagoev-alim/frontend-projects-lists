/**
 * Этот код представляет собой реализацию веб-приложения для перевода текста.
 * Он использует API MyMemory для выполнения переводов и предоставляет
 * пользовательский интерфейс для ввода текста, выбора языков и выполнения
 * различных действий, таких как копирование и озвучивание текста.
 */

import './style.css';
import languages from './mock.js';
import { icons } from 'feather-icons';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';

/**
 * Класс, представляющий приложение-переводчик
 */
class Translator {
  /**
   * Создает экземпляр приложения-переводчика
   */
  constructor() {
    /**
     * Конфигурация приложения
     * @type {Object}
     */
    this.config = {
      root: '#app',
      selectors: {
        input: '[data-input="source"]',
        output: '[data-output="target"]',
        copySource: '[data-action="copy-source"]',
        speakSource: '[data-action="speak-source"]',
        selectSource: '[data-select="source"]',
        swapLanguages: '[data-action="swap-languages"]',
        selectTarget: '[data-select="target"]',
        copyTarget: '[data-action="copy-target"]',
        speakTarget: '[data-action="speak-target"]',
        translate: '[data-action="translate"]',
      },
      apiUrl: 'https://api.mymemory.translated.net/get',
    };

    /**
     * Состояние приложения
     * @type {Object}
     */
    this.state = {
      elements: {
        sourceInput: null,
        targetOutput: null,
        copySourceButton: null,
        speakSourceButton: null,
        selectSource: null,
        swapLanguagesButton: null,
        selectTarget: null,
        copyTargetButton: null,
        speakTargetButton: null,
        translateButton: null,
      },
    };

    /**
     * Утилитарные функции
     * @type {Object}
     */
    this.utils = {
      /**
       * Подготавливает строку атрибута для вставки в HTML
       * @param {string} element - Строка атрибута
       * @returns {string} Подготовленная строка атрибута
       */
      renderDataAttributes: (element) => element.slice(1, -1),

      /**
       * Конфигурация для уведомлений
       * @type {Object}
       */
      toastConfig: {
        className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
        duration: 3000,
        gravity: 'bottom',
        position: 'center',
      },

      /**
       * Показывает уведомление
       * @param {string} message - Текст уведомления
       */
      showToast: (message) => {
        Toastify({
          text: message,
          ...this.utils.toastConfig,
        }).showToast();
      },

      /**
       * Обрабатывает ошибки
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
   * Создает HTML-разметку приложения
   */
  createAppHTML() {
    const {
      root,
      selectors: {
        input,
        output,
        copySource,
        speakSource,
        selectSource,
        swapLanguages,
        selectTarget,
        copyTarget,
        speakTarget,
        translate,
      },
    } = this.config;
    const { renderDataAttributes } = this.utils;
    const rootElement = document.querySelector(root);

    if (!rootElement) return;

    rootElement.innerHTML = `
    <div class='grid w-full max-w-2xl gap-4 rounded border bg-white p-3 shadow'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>Translator</h1>
      <div class='grid gap-3'>
        <div class='grid gap-3 md:grid-cols-2'>
          <textarea class='min-h-[130px] w-full resize-none rounded border bg-slate-50 px-3 py-2 focus:border-blue-400 focus:outline-none' ${renderDataAttributes(input)} placeholder='Enter text'></textarea>
          <textarea class='min-h-[130px] w-full resize-none rounded border bg-gray-100 px-3 py-2 focus:border-blue-400 focus:outline-none' ${renderDataAttributes(output)} placeholder='Translation' readonly disabled></textarea>
        </div>
    
        <ul class='grid gap-3 md:grid-cols-[1fr_auto_1fr]'>
          <li class='grid grid-cols-[auto_1fr] gap-2'>
            <div class='grid grid-cols-2 gap-2'>
              <button class='border p-3 hover:bg-slate-50' ${renderDataAttributes(copySource)}><span class='pointer-events-none'>${icons.clipboard.toSvg()}</span></button>
              <button class='border p-3 hover:bg-slate-50' ${renderDataAttributes(speakSource)}><span class='pointer-events-none'>${icons['volume-2'].toSvg()}</span></button>
            </div>
    
            <select class='w-full rounded border bg-slate-50 px-3 py-2 focus:border-blue-400 focus:outline-none' ${renderDataAttributes(selectSource)}>
              ${languages.map(({ value, name }) => value === 'en-GB'
      ? `<option value='${value}' selected>${name}</option>`
      : `<option value='${value}'>${name}</option>`).join('')}
            </select>
          </li>
    
          <li class='flex justify-center'>
            <button class='border p-3 hover:bg-slate-50' ${renderDataAttributes(swapLanguages)}><span class='pointer-events-none'>${icons['refresh-cw'].toSvg()}</span></button>
          </li>
    
          <li class='grid grid-cols-[1fr_auto] gap-2'>
            <select class='w-full rounded border bg-slate-50 px-3 py-2 focus:border-blue-400 focus:outline-none' ${renderDataAttributes(selectTarget)}>
              ${languages.map(({ value, name }) => value === 'ru-RU'
      ? `<option value='${value}' selected>${name}</option>`
      : `<option value='${value}'>${name}</option>`).join('')}
            </select>
    
            <div class='grid grid-cols-2 gap-2'>
              <button class='border p-3 hover:bg-slate-50' ${renderDataAttributes(copyTarget)}><span class='pointer-events-none'>${icons.clipboard.toSvg()}</span></button>
              <button class='border p-3 hover:bg-slate-50' ${renderDataAttributes(speakTarget)}><span class='pointer-events-none'>${icons['volume-2'].toSvg()}</span></button>
            </div>
          </li>
        </ul>
      </div>
    
      <button class='border p-3 hover:bg-slate-50' ${renderDataAttributes(translate)}>Translate Text</button>
    </div>
  `;
  }

  /**
   * Инициализирует DOM-элементы
   */
  initDOMElements() {
    this.state.elements = {
      sourceInput: document.querySelector(this.config.selectors.input),
      targetOutput: document.querySelector(this.config.selectors.output),
      copySourceButton: document.querySelector(this.config.selectors.copySource),
      speakSourceButton: document.querySelector(this.config.selectors.speakSource),
      selectSource: document.querySelector(this.config.selectors.selectSource),
      swapLanguagesButton: document.querySelector(this.config.selectors.swapLanguages),
      selectTarget: document.querySelector(this.config.selectors.selectTarget),
      copyTargetButton: document.querySelector(this.config.selectors.copyTarget),
      speakTargetButton: document.querySelector(this.config.selectors.speakTarget),
      translateButton: document.querySelector(this.config.selectors.translate),
    };
  }

  /**
   * Инициализирует приложение
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();
    this.state.elements.translateButton.addEventListener('click', this.handleTranslateButtonClick.bind(this));
    this.state.elements.swapLanguagesButton.addEventListener('click', this.handleSwapLanguagesButtonClick.bind(this));
    this.state.elements.copySourceButton.addEventListener('click', this.handleCopyButtonClick.bind(this));
    this.state.elements.copyTargetButton.addEventListener('click', this.handleCopyButtonClick.bind(this));
    this.state.elements.speakSourceButton.addEventListener('click', this.handleSpeechButtonClick.bind(this));
    this.state.elements.speakTargetButton.addEventListener('click', this.handleSpeechButtonClick.bind(this));
  }

  /**
   * Обрабатывает клик по кнопке перевода
   */
  async handleTranslateButtonClick() {
    const sourceInput = this.state.elements.sourceInput.value.trim();

    if (!sourceInput || sourceInput.length === 0) {
      this.utils.showToast('Please enter some text');
      return;
    }

    try {
      this.updateTranslateButtonText('Loading...');

      const params = {
        q: sourceInput,
        langpair: `${this.state.elements.selectSource.value}|${this.state.elements.selectTarget.value}`,
      };

      const { data: { responseData: { translatedText } } } = await axios.get(this.config.apiUrl, { params });
      this.state.elements.targetOutput.value = translatedText;

    } catch (error) {
      this.utils.handleError('Error during translation', error);
    } finally {
      this.updateTranslateButtonText('Translate Text');
    }
  }

  /**
   * Обновляет текст кнопки перевода
   * @param {string} text - Новый текст кнопки
   */
  updateTranslateButtonText(text) {
    this.state.elements.translateButton.textContent = text;
  }

  /**
   * Обрабатывает клик по кнопке смены языков
   */
  handleSwapLanguagesButtonClick() {
    [this.state.elements.sourceInput.value, this.state.elements.targetOutput.value] = [this.state.elements.targetOutput.value, this.state.elements.sourceInput.value];
    [this.state.elements.selectSource.value, this.state.elements.selectTarget.value] = [this.state.elements.selectTarget.value, this.state.elements.selectSource.value];
  }

  /**
   * Обрабатывает клик по кнопке копирования
   * @param {Event} param0 - Объект события
   */
  async handleCopyButtonClick({ target }) {
    const actionType = target.dataset.action;
    if (!actionType) return;

    const values = {
      ['copy-source']: this.state.elements.sourceInput.value,
      ['copy-target']: this.state.elements.targetOutput.value,
    };

    try {
      await navigator.clipboard.writeText(values[actionType]);
      this.utils.showToast('✅ Success copied to clipboard');
    } catch (error) {
      this.utils.handleError('❌ Failed to copy text to clipboard', error);
    }
  }

  /**
   * Обрабатывает клик по кнопке озвучивания
   * @param {Event} param0 - Объект события
   */
  handleSpeechButtonClick({ target }) {
    const actionType = target.dataset.action;
    if (!actionType) return;
    const VALUES = {
      ['speak-source']: {
        text: this.state.elements.sourceInput.value,
        lang: this.state.elements.selectSource.value,
      },
      ['speak-target']: {
        text: this.state.elements.targetOutput.value,
        lang: this.state.elements.selectTarget.value,
      },
    };
    try {
      const CONFIG = new SpeechSynthesisUtterance(VALUES[actionType].text);
      CONFIG.lang = VALUES[actionType].lang;
      speechSynthesis.speak(CONFIG);
    } catch (error) {
      this.utils.handleError('Failed to speak', error);
    }
  }
}

new Translator();
