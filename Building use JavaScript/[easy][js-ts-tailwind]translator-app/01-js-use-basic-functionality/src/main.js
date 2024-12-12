/**
 * Этот код реализует функциональность веб-приложения для перевода текста.
 * Он включает в себя интерфейс пользователя с возможностью ввода текста,
 * выбора языков, перевода, копирования и озвучивания текста.
 * Для перевода используется API MyMemory.
 */

import './style.css';
import languages from './mock.js';
import { icons } from 'feather-icons';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';

/**
 * Конфигурация приложения
 * @type {Object}
 */
const APP_CONFIG = {
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
const APP_STATE = {
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
 * Утилиты приложения
 * @type {Object}
 */
const APP_UTILS = {
  /**
   * Добавляет ведущий ноль к числу, если оно меньше 10
   * @param {number} num - Число для форматирования
   * @returns {string} Отформатированное число
   */
  addLeadingZero: (num) => num.toString().padStart(2, '0'),

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
      ...APP_UTILS.toastConfig,
    }).showToast();
  },

  /**
   * Обрабатывает ошибки
   * @param {string} message - Сообщение об ошибке
   * @param {Error} [error] - Объект ошибки
   */
  handleError: (message, error = null) => {
    APP_UTILS.showToast(message);
    if (error) console.error(message, error);
  },

  /**
   * Создает функцию с задержкой выполнения
   * @param {Function} func - Функция для выполнения
   * @param {number} delay - Задержка в миллисекундах
   * @returns {Function} Функция с задержкой
   */
  debounce: (func, delay) => {
    let timeoutId;
    return function(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  },
};

/**
 * Создает HTML разметку приложения
 */
function createAppHTML() {
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
 * Инициализирует DOM элементы
 */
function initDOMElements() {
  APP_STATE.elements = {
    sourceInput: document.querySelector(APP_CONFIG.selectors.input),
    targetOutput: document.querySelector(APP_CONFIG.selectors.output),
    copySourceButton: document.querySelector(APP_CONFIG.selectors.copySource),
    speakSourceButton: document.querySelector(APP_CONFIG.selectors.speakSource),
    selectSource: document.querySelector(APP_CONFIG.selectors.selectSource),
    swapLanguagesButton: document.querySelector(APP_CONFIG.selectors.swapLanguages),
    selectTarget: document.querySelector(APP_CONFIG.selectors.selectTarget),
    copyTargetButton: document.querySelector(APP_CONFIG.selectors.copyTarget),
    speakTargetButton: document.querySelector(APP_CONFIG.selectors.speakTarget),
    translateButton: document.querySelector(APP_CONFIG.selectors.translate),
  };
}

/**
 * Инициализирует приложение
 */
function initApp() {
  createAppHTML();
  initDOMElements();
  APP_STATE.elements.translateButton.addEventListener('click', handleTranslateButtonClick);
  APP_STATE.elements.swapLanguagesButton.addEventListener('click', handleSwapLanguagesButtonClick);
  APP_STATE.elements.copySourceButton.addEventListener('click', handleCopyButtonClick);
  APP_STATE.elements.copyTargetButton.addEventListener('click', handleCopyButtonClick);
  APP_STATE.elements.speakSourceButton.addEventListener('click', handleSpeechButtonClick);
  APP_STATE.elements.speakTargetButton.addEventListener('click', handleSpeechButtonClick);
}

/**
 * Обрабатывает нажатие кнопки перевода
 * @param {Event} event - Событие клика
 */
async function handleTranslateButtonClick(event) {
  const sourceInput = APP_STATE.elements.sourceInput.value.trim();

  if (!sourceInput || sourceInput.length === 0) {
    APP_UTILS.showToast('Please enter some text');
    return;
  }

  try {
    updateTranslateButtonText('Loading...');

    const params = {
      q: sourceInput,
      langpair: `${APP_STATE.elements.selectSource.value}|${APP_STATE.elements.selectTarget.value}`,
    };

    const { data: { responseData: { translatedText } } } = await axios.get(APP_CONFIG.apiUrl, { params });
    APP_STATE.elements.targetOutput.value = translatedText;

  } catch (error) {
    APP_UTILS.handleError('Error during translation', error);
    return;
  } finally {
    updateTranslateButtonText('Translate Text');
  }
}

/**
 * Обновляет текст кнопки перевода
 * @param {string} text - Новый текст кнопки
 */
function updateTranslateButtonText(text) {
  APP_STATE.elements.translateButton.textContent = text;
}

/**
 * Обрабатывает нажатие кнопки обмена языками
 * Меняет местами значения исходного и целевого текста, а также выбранные языки
 */
function handleSwapLanguagesButtonClick() {
  [APP_STATE.elements.sourceInput.value, APP_STATE.elements.targetOutput.value] = [APP_STATE.elements.targetOutput.value, APP_STATE.elements.sourceInput.value];
  [APP_STATE.elements.selectSource.value, APP_STATE.elements.selectTarget.value] = [APP_STATE.elements.selectTarget.value, APP_STATE.elements.selectSource.value];
}

/**
 * Обрабатывает нажатие кнопки копирования
 * @param {Object} param0 - Объект события
 * @param {HTMLElement} param0.target - Элемент, на котором произошло событие
 */
async function handleCopyButtonClick({ target }) {
  const actionType = target.dataset.action;
  if (!actionType) return;

  const values = {
    ['copy-source']: APP_STATE.elements.sourceInput.value,
    ['copy-target']: APP_STATE.elements.targetOutput.value,
  };

  try {
    await navigator.clipboard.writeText(values[actionType]);
    APP_UTILS.showToast('✅ Success copied to clipboard');
  } catch (error) {
    APP_UTILS.handleError('❌ Failed to copy text to clipboard', error);
  }
}

/**
 * Обрабатывает нажатие кнопки озвучивания текста
 * @param {Object} param0 - Объект события
 * @param {HTMLElement} param0.target - Элемент, на котором произошло событие
 */
function handleSpeechButtonClick({ target }) {
  const actionType = target.dataset.action;
  if (!actionType) return;
  const VALUES = {
    ['speak-source']: {
      text: APP_STATE.elements.sourceInput.value,
      lang: APP_STATE.elements.selectSource.value,
    },
    ['speak-target']: {
      text: APP_STATE.elements.targetOutput.value,
      lang: APP_STATE.elements.selectTarget.value,
    },
  };
  try {
    const CONFIG = new SpeechSynthesisUtterance(VALUES[actionType].text);
    CONFIG.lang = VALUES[actionType].lang;
    speechSynthesis.speak(CONFIG);
  } catch (error) {
    APP_UTILS.handleError('Failed to speak', error);
  }
}

initApp();
