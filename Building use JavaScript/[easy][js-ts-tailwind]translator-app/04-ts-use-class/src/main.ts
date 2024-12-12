/**
 * Этот файл содержит класс Translator, который реализует функциональность веб-приложения для перевода текста.
 * Приложение позволяет пользователям вводить текст, выбирать языки для перевода, выполнять перевод,
 * копировать текст и использовать функцию преобразования текста в речь.
 */

import './style.css';
import languages from './mock.js';
import { icons } from 'feather-icons';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';

/**
 * Интерфейс для конфигурации приложения
 */
interface Config {
  /** Корневой элемент приложения */
  root: string;
  /** Селекторы для различных элементов DOM */
  selectors: {
    [key: string]: string;
  };
  /** URL API для перевода */
  apiUrl: string;
}

/**
 * Интерфейс для состояния приложения
 */
interface State {
  /** Элементы DOM */
  elements: {
    [key: string]: HTMLElement | null;
  };
}

/**
 * Интерфейс для вспомогательных функций
 */
interface Utils {
  /** Функция для рендеринга атрибутов данных */
  renderDataAttributes: (element: string) => string;
  /** Конфигурация для уведомлений */
  toastConfig: {
    className: string;
    duration: number;
    gravity: string;
    position: string;
  };
  /** Функция для отображения уведомлений */
  showToast: (message: string) => void;
  /** Функция для обработки ошибок */
  handleError: (message: string, error?: any) => void;
}

/**
 * Класс, реализующий функциональность переводчика
 */
class Translator {
  /** Конфигурация приложения */
  private readonly config: Config;
  /** Состояние приложения */
  private state: State;
  /** Вспомогательные функции */
  private readonly utils: Utils;

  /**
   * Конструктор класса Translator
   */
  constructor() {
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

    this.utils = {
      renderDataAttributes: (element: string): string => element.slice(1, -1),

      toastConfig: {
        className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
        duration: 3000,
        gravity: 'bottom',
        position: 'center',
      },

      showToast: (message: string): void => {
        // @ts-ignore
        Toastify({
          text: message,
          ...this.utils.toastConfig,
        }).showToast();
      },

      handleError: (message: string, error: any = null): void => {
        this.utils.showToast(message);
        if (error) console.error(message, error);
      },
    };

    this.init();
  }

  /**
   * Создает HTML разметку приложения
   */
  private createAppHTML(): void {
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
   * Инициализирует элементы DOM
   */
  private initDOMElements(): void {
    this.state.elements = {
      sourceInput: document.querySelector(this.config.selectors.input) as HTMLTextAreaElement,
      targetOutput: document.querySelector(this.config.selectors.output) as HTMLTextAreaElement,
      copySourceButton: document.querySelector(this.config.selectors.copySource) as HTMLButtonElement,
      speakSourceButton: document.querySelector(this.config.selectors.speakSource) as HTMLButtonElement,
      selectSource: document.querySelector(this.config.selectors.selectSource) as HTMLSelectElement,
      swapLanguagesButton: document.querySelector(this.config.selectors.swapLanguages) as HTMLButtonElement,
      selectTarget: document.querySelector(this.config.selectors.selectTarget) as HTMLSelectElement,
      copyTargetButton: document.querySelector(this.config.selectors.copyTarget) as HTMLButtonElement,
      speakTargetButton: document.querySelector(this.config.selectors.speakTarget) as HTMLButtonElement,
      translateButton: document.querySelector(this.config.selectors.translate) as HTMLButtonElement,
    };
  }

  /**
   * Инициализирует приложение
   */
  private init(): void {
    this.createAppHTML();
    this.initDOMElements();
    this.state.elements.translateButton?.addEventListener('click', this.handleTranslateButtonClick.bind(this));
    this.state.elements.swapLanguagesButton?.addEventListener('click', this.handleSwapLanguagesButtonClick.bind(this));
    this.state.elements.copySourceButton?.addEventListener('click', this.handleCopyButtonClick.bind(this));
    this.state.elements.copyTargetButton?.addEventListener('click', this.handleCopyButtonClick.bind(this));
    this.state.elements.speakSourceButton?.addEventListener('click', this.handleSpeechButtonClick.bind(this));
    this.state.elements.speakTargetButton?.addEventListener('click', this.handleSpeechButtonClick.bind(this));
  }

  /**
   * Обрабатывает клик по кнопке перевода
   */
  private async handleTranslateButtonClick(): Promise<void> {
    const sourceInput = (this.state.elements.sourceInput as HTMLTextAreaElement).value.trim();

    if (!sourceInput || sourceInput.length === 0) {
      this.utils.showToast('Please enter some text');
      return;
    }

    try {
      this.updateTranslateButtonText('Loading...');

      const params = {
        q: sourceInput,
        langpair: `${(this.state.elements.selectSource as HTMLSelectElement).value}|${(this.state.elements.selectTarget as HTMLSelectElement).value}`,
      };

      const { data: { responseData: { translatedText } } } = await axios.get(this.config.apiUrl, { params });
      (this.state.elements.targetOutput as HTMLTextAreaElement).value = translatedText;

    } catch (error) {
      this.utils.handleError('Error during translation', error);
    } finally {
      this.updateTranslateButtonText('Translate Text');
    }
  }

  /**
   * Обновляет текст кнопки перевода.
   * @param {string} text - Новый текст для кнопки.
   */
  private updateTranslateButtonText(text: string): void {
    if (this.state.elements.translateButton) {
      this.state.elements.translateButton.textContent = text;
    }
  }

  /**
   * Обрабатывает нажатие кнопки для обмена языками.
   * Меняет местами значения в полях ввода и выбора языков.
   */
  private handleSwapLanguagesButtonClick(): void {
    if (this.state.elements.sourceInput && this.state.elements.targetOutput && this.state.elements.selectSource && this.state.elements.selectTarget) {
      [this.state.elements.sourceInput.value, this.state.elements.targetOutput.value] = [this.state.elements.targetOutput.value, this.state.elements.sourceInput.value];
      [this.state.elements.selectSource.value, this.state.elements.selectTarget.value] = [this.state.elements.selectTarget.value, this.state.elements.selectSource.value];
    }
  }

  /**
   * Обрабатывает нажатие кнопки копирования.
   * Копирует текст в буфер обмена и показывает уведомление о результате.
   * @param {MouseEvent} param0 - Объект события мыши.
   */
  private async handleCopyButtonClick({ target }: MouseEvent): Promise<void> {
    const actionType = (target as HTMLElement).dataset.action;
    if (!actionType) return;

    const values: { [key: string]: string } = {
      'copy-source': (this.state.elements.sourceInput as HTMLTextAreaElement).value,
      'copy-target': (this.state.elements.targetOutput as HTMLTextAreaElement).value,
    };

    try {
      await navigator.clipboard.writeText(values[actionType]);
      this.utils.showToast('✅ Success copied to clipboard');
    } catch (error) {
      this.utils.handleError('❌ Failed to copy text to clipboard', error);
    }
  }

  /**
   * Обрабатывает нажатие кнопки озвучивания текста.
   * Использует Web Speech API для преобразования текста в речь.
   * @param {MouseEvent} param0 - Объект события мыши.
   */
  private handleSpeechButtonClick({ target }: MouseEvent): void {
    const actionType = (target as HTMLElement).dataset.action;
    if (!actionType) return;

    const VALUES: {
      [key: string]: {
        text: string;
        lang: string;
      }
    } = {
      'speak-source': {
        text: (this.state.elements.sourceInput as HTMLTextAreaElement).value,
        lang: (this.state.elements.selectSource as HTMLSelectElement).value,
      },
      'speak-target': {
        text: (this.state.elements.targetOutput as HTMLTextAreaElement).value,
        lang: (this.state.elements.selectTarget as HTMLSelectElement).value,
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
