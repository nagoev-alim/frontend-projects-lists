/**
 * Этот модуль содержит основные интерфейсы, конфигурацию и утилиты для приложения-переводчика.
 * Он определяет структуру данных, настройки приложения и вспомогательные функции,
 * необходимые для работы переводчика.
 */

import './style.css';
import languages from './mock.js';
import { icons } from 'feather-icons';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';

/**
 * Интерфейс, описывающий структуру языка.
 */
interface Language {
  /** Код языка */
  value: string;
  /** Название языка */
  name: string;
}

/**
 * Интерфейс, описывающий конфигурацию приложения.
 */
interface AppConfig {
  /** Селектор корневого элемента приложения */
  root: string;
  /** Объект с селекторами элементов интерфейса */
  selectors: {
    [key: string]: string;
  };
  /** URL API для выполнения переводов */
  apiUrl: string;
}

/**
 * Интерфейс, описывающий состояние приложения.
 */
interface AppState {
  /** Объект с ссылками на элементы DOM */
  elements: {
    sourceInput: HTMLTextAreaElement | null;
    targetOutput: HTMLTextAreaElement | null;
    copySourceButton: HTMLButtonElement | null;
    speakSourceButton: HTMLButtonElement | null;
    selectSource: HTMLSelectElement | null;
    swapLanguagesButton: HTMLButtonElement | null;
    selectTarget: HTMLSelectElement | null;
    copyTargetButton: HTMLButtonElement | null;
    speakTargetButton: HTMLButtonElement | null;
    translateButton: HTMLButtonElement | null;
  };
}

/**
 * Интерфейс, описывающий утилиты приложения.
 */
interface AppUtils {
  /** Функция для добавления ведущего нуля к числу */
  addLeadingZero: (num: number) => string;
  /** Функция для рендеринга data-атрибутов */
  renderDataAttributes: (element: string) => string;
  /** Конфигурация для toast-уведомлений */
  toastConfig: {
    className: string;
    duration: number;
    gravity: string;
    position: string;
  };
  /** Функция для отображения toast-уведомления */
  showToast: (message: string) => void;
  /** Функция для обработки ошибок */
  handleError: (message: string, error?: Error) => void;
}

/**
 * Конфигурация приложения.
 */
const APP_CONFIG: AppConfig = {
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
 * Состояние приложения.
 */
const APP_STATE: AppState = {
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
 * Утилиты приложения.
 */
const APP_UTILS: AppUtils = {
  /**
   * Добавляет ведущий ноль к числу, если оно меньше 10.
   * @param {number} num - Число для форматирования.
   * @returns {string} Отформатированное число в виде строки.
   */
  addLeadingZero: (num: number): string => num.toString().padStart(2, '0'),

  /**
   * Удаляет квадратные скобки из строки с data-атрибутом.
   * @param {string} element - Строка с data-атрибутом.
   * @returns {string} Очищенная строка без квадратных скобок.
   */
  renderDataAttributes: (element: string): string => element.slice(1, -1),

  /**
   * Конфигурация для toast-уведомлений.
   */
  toastConfig: {
    className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
    duration: 3000,
    gravity: 'bottom',
    position: 'center',
  },

  /**
   * Отображает toast-уведомление с заданным сообщением.
   * @param {string} message - Сообщение для отображения.
   */
  showToast: (message: string): void => {
    // @ts-ignore
    Toastify({
      text: message,
      ...APP_UTILS.toastConfig,
    }).showToast();
  },

  /**
   * Обрабатывает ошибку, отображая уведомление и логируя её в консоль.
   * @param {string} message - Сообщение об ошибке.
   * @param {Error | null} [error] - Объект ошибки (опционально).
   */
  handleError: (message: string, error: Error | null = null): void => {
    APP_UTILS.showToast(message);
    if (error) console.error(message, error);
  },
};

/**
 * Создает HTML-структуру приложения.
 * Формирует основной интерфейс переводчика, включая текстовые поля, кнопки и выпадающие списки.
 */
function createAppHTML(): void {
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
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector<HTMLElement>(root);

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
              ${(languages as Language[]).map(({ value, name }) => value === 'en-GB'
    ? `<option value='${value}' selected>${name}</option>`
    : `<option value='${value}'>${name}</option>`).join('')}
            </select>
          </li>
    
          <li class='flex justify-center'>
            <button class='border p-3 hover:bg-slate-50' ${renderDataAttributes(swapLanguages)}><span class='pointer-events-none'>${icons['refresh-cw'].toSvg()}</span></button>
          </li>
    
          <li class='grid grid-cols-[1fr_auto] gap-2'>
            <select class='w-full rounded border bg-slate-50 px-3 py-2 focus:border-blue-400 focus:outline-none' ${renderDataAttributes(selectTarget)}>
              ${(languages as Language[]).map(({ value, name }) => value === 'ru-RU'
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
 * Инициализирует DOM-элементы приложения.
 * Находит и сохраняет ссылки на ключевые элементы интерфейса для дальнейшего использования.
 */
function initDOMElements(): void {
  APP_STATE.elements = {
    sourceInput: document.querySelector<HTMLTextAreaElement>(APP_CONFIG.selectors.input),
    targetOutput: document.querySelector<HTMLTextAreaElement>(APP_CONFIG.selectors.output),
    copySourceButton: document.querySelector<HTMLButtonElement>(APP_CONFIG.selectors.copySource),
    speakSourceButton: document.querySelector<HTMLButtonElement>(APP_CONFIG.selectors.speakSource),
    selectSource: document.querySelector<HTMLSelectElement>(APP_CONFIG.selectors.selectSource),
    swapLanguagesButton: document.querySelector<HTMLButtonElement>(APP_CONFIG.selectors.swapLanguages),
    selectTarget: document.querySelector<HTMLSelectElement>(APP_CONFIG.selectors.selectTarget),
    copyTargetButton: document.querySelector<HTMLButtonElement>(APP_CONFIG.selectors.copyTarget),
    speakTargetButton: document.querySelector<HTMLButtonElement>(APP_CONFIG.selectors.speakTarget),
    translateButton: document.querySelector<HTMLButtonElement>(APP_CONFIG.selectors.translate),
  };
}

/**
 * Инициализирует приложение.
 * Создает HTML-структуру, инициализирует DOM-элементы и устанавливает обработчики событий.
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();
  APP_STATE.elements.translateButton?.addEventListener('click', handleTranslateButtonClick);
  APP_STATE.elements.swapLanguagesButton?.addEventListener('click', handleSwapLanguagesButtonClick);
  APP_STATE.elements.copySourceButton?.addEventListener('click', handleCopyButtonClick);
  APP_STATE.elements.copyTargetButton?.addEventListener('click', handleCopyButtonClick);
  APP_STATE.elements.speakSourceButton?.addEventListener('click', handleSpeechButtonClick);
  APP_STATE.elements.speakTargetButton?.addEventListener('click', handleSpeechButtonClick);
}

/**
 * Обрабатывает нажатие кнопки перевода.
 * Отправляет запрос на перевод введенного текста и обновляет интерфейс результатом.
 * @returns {Promise<void>}
 */
async function handleTranslateButtonClick(): Promise<void> {
  const sourceInput = APP_STATE.elements.sourceInput?.value.trim();

  if (!sourceInput || sourceInput.length === 0) {
    APP_UTILS.showToast('Please enter some text');
    return;
  }

  try {
    updateTranslateButtonText('Loading...');

    const params = {
      q: sourceInput,
      langpair: `${APP_STATE.elements.selectSource?.value}|${APP_STATE.elements.selectTarget?.value}`,
    };

    const { data: { responseData: { translatedText } } } = await axios.get<{
      responseData: { translatedText: string }
    }>(APP_CONFIG.apiUrl, { params });
    if (APP_STATE.elements.targetOutput) {
      APP_STATE.elements.targetOutput.value = translatedText;
    }

  } catch (error) {
    APP_UTILS.handleError('Error during translation', error as Error);
    return;
  } finally {
    updateTranslateButtonText('Translate Text');
  }
}

/**
 * Обновляет текст на кнопке перевода.
 * @param {string} text - Новый текст для кнопки.
 */
function updateTranslateButtonText(text: string): void {
  if (APP_STATE.elements.translateButton) {
    APP_STATE.elements.translateButton.textContent = text;
  }
}

/**
 * Обрабатывает нажатие кнопки смены языков.
 * Меняет местами исходный и целевой языки, а также содержимое текстовых полей.
 */
function handleSwapLanguagesButtonClick(): void {
  if (APP_STATE.elements.sourceInput && APP_STATE.elements.targetOutput && APP_STATE.elements.selectSource && APP_STATE.elements.selectTarget) {
    [APP_STATE.elements.sourceInput.value, APP_STATE.elements.targetOutput.value] = [APP_STATE.elements.targetOutput.value, APP_STATE.elements.sourceInput.value];
    [APP_STATE.elements.selectSource.value, APP_STATE.elements.selectTarget.value] = [APP_STATE.elements.selectTarget.value, APP_STATE.elements.selectSource.value];
  }
}

/**
 * Обрабатывает нажатие кнопки копирования текста.
 * Копирует текст из соответствующего поля в буфер обмена.
 * @param {MouseEvent} event - Событие клика мыши.
 * @returns {Promise<void>}
 */
async function handleCopyButtonClick(event: MouseEvent): Promise<void> {
  const target = event.target as HTMLElement;
  const actionType = target.dataset.action;
  if (!actionType) return;

  const values: { [key: string]: string } = {
    'copy-source': APP_STATE.elements.sourceInput?.value || '',
    'copy-target': APP_STATE.elements.targetOutput?.value || '',
  };

  try {
    await navigator.clipboard.writeText(values[actionType]);
    APP_UTILS.showToast('✅ Success copied to clipboard');
  } catch (error) {
    APP_UTILS.handleError('❌ Failed to copy text to clipboard', error as Error);
  }
}

/**
 * Обрабатывает нажатие кнопки озвучивания текста.
 * Использует API синтеза речи для озвучивания выбранного текста.
 * @param {MouseEvent} event - Событие клика мыши.
 */
function handleSpeechButtonClick(event: MouseEvent): void {
  const target = event.target as HTMLElement;
  const actionType = target.dataset.action;
  if (!actionType) return;

  const VALUES: {
    [key: string]: {
      text: string;
      lang: string;
    }
  } = {
    'speak-source': {
      text: APP_STATE.elements.sourceInput?.value || '',
      lang: APP_STATE.elements.selectSource?.value || '',
    },
    'speak-target': {
      text: APP_STATE.elements.targetOutput?.value || '',
      lang: APP_STATE.elements.selectTarget?.value || '',
    },
  };

  try {
    const CONFIG = new SpeechSynthesisUtterance(VALUES[actionType].text);
    CONFIG.lang = VALUES[actionType].lang;
    speechSynthesis.speak(CONFIG);
  } catch (error) {
    APP_UTILS.handleError('Failed to speak', error as Error);
  }
}

initApp();
