/**
 * Этот код представляет собой приложение для генерации паролей.
 * Он позволяет пользователю настраивать параметры пароля, такие как длина и типы символов,
 * генерировать пароль на основе этих параметров, копировать пароль в буфер обмена
 * и отображать индикатор силы пароля.
 */

import './style.css';
import { icons } from 'feather-icons';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

/**
 * Конфигурация приложения, содержащая селекторы элементов и функции генерации символов.
 * @type {Object}
 */
const APP_CONFIG = {
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
 * Состояние приложения, хранящее ссылки на DOM элементы.
 * @type {Object}
 */
const APP_STATE = {
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
 * Утилиты приложения, включающие функции для работы с DOM и отображения уведомлений.
 * @type {Object}
 */
const APP_UTILS = {
  /**
   * Удаляет первый и последний символ из строки (для data-атрибутов).
   * @param {string} element - Строка для обработки.
   * @returns {string} Обработанная строка.
   */
  renderDataAttributes: (element) => element.slice(1, -1),

  /**
   * Конфигурация для отображения уведомлений.
   * @type {Object}
   */
  toastConfig: {
    className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
    duration: 3000,
    gravity: 'bottom',
    position: 'center',
  },

  /**
   * Отображает уведомление с заданным сообщением.
   * @param {string} message - Текст уведомления.
   */
  showToast: (message) => {
    Toastify({
      text: message,
      ...APP_UTILS.toastConfig,
    }).showToast();
  },

  /**
   * Обрабатывает ошибки, отображая уведомление и логируя в консоль.
   * @param {string} message - Сообщение об ошибке.
   * @param {Error} [error] - Объект ошибки (опционально).
   */
  handleError: (message, error = null) => {
    APP_UTILS.showToast(message);
    if (error) console.error(message, error);
  },

  /**
   * Объект с функциями генерации символов различных типов.
   * @type {Object}
   */
  chars: Object.keys(APP_CONFIG.characters).reduce((acc, key) => {
    acc[key] = () => APP_CONFIG.characters[key]();
    return acc;
  }, {}),
};

/**
 * Создает HTML структуру приложения и вставляет её в DOM.
 */
function createAppHTML() {
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
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
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
 * Инициализирует ссылки на DOM элементы в состоянии приложения.
 */
function initDOMElements() {
  APP_STATE.elements = {
    passwordOutput: document.querySelector(APP_CONFIG.selectors.passwordOutput),
    copyButton: document.querySelector(APP_CONFIG.selectors.copyButton),
    strengthIndicator: document.querySelector(APP_CONFIG.selectors.strengthIndicator),
    lengthDisplay: document.querySelector(APP_CONFIG.selectors.lengthDisplay),
    lengthSlider: document.querySelector(APP_CONFIG.selectors.lengthSlider),
    charType: document.querySelectorAll(APP_CONFIG.selectors.charType),
    generateButton: document.querySelector(APP_CONFIG.selectors.generateButton),
  };
}

/**
 * Инициализирует приложение, создавая HTML структуру и устанавливая обработчики событий.
 */
function initApp() {
  createAppHTML();
  initDOMElements();

  APP_STATE.elements.lengthSlider.addEventListener('input', handleLengthSliderChange);
  APP_STATE.elements.generateButton.addEventListener('click', handleGenerateButtonClick);
  APP_STATE.elements.copyButton.addEventListener('click', handleCopyButtonClick);
}

/**
 * Обрабатывает изменение значения ползунка длины пароля.
 * @param {Event} event - Событие изменения значения ползунка.
 */
function handleLengthSliderChange({ target: { value } }) {
  APP_STATE.elements.lengthDisplay.textContent = value;
}

/**
 * Генерирует пароль на основе заданных опций.
 * @param {Object} options - Опции для генерации пароля.
 * @returns {string} Сгенерированный пароль.
 */
function generatePassword(options) {
  const availableTypes = Object.keys(APP_UTILS.chars).filter(
    (type) => options[type],
  );
  return Array.from({ length: options.length }, () => {
    const randomType =
      availableTypes[Math.floor(Math.random() * availableTypes.length)];
    return APP_UTILS.chars[randomType]();
  }).join('');
}

/**
 * Обрабатывает нажатие на кнопку генерации пароля.
 */
function handleGenerateButtonClick() {
  const params = Array.from(APP_STATE.elements.charType).reduce((acc, option) => {
    acc[option.dataset.charType] = option.checked;
    return acc;
  }, {});

  const passwordOptions = {
    ...params,
    length: parseInt(APP_STATE.elements.lengthSlider.value, 10),
  };
  APP_STATE.elements.passwordOutput.value = generatePassword(passwordOptions);
  handleIndicatorUpdate();
}

/**
 * Обновляет индикатор силы пароля.
 */
function handleIndicatorUpdate() {
  const value = +APP_STATE.elements.lengthSlider.value;
  const level = value <= 8 ? 'weak' : value <= 16 ? 'medium' : 'strong';
  APP_STATE.elements.strengthIndicator.setAttribute('data-level', level);
}

/**
 * Обрабатывает нажатие на кнопку копирования пароля.
 */
async function handleCopyButtonClick() {
  const password = APP_STATE.elements.passwordOutput.value;
  if (!password) return;

  try {
    await navigator.clipboard.writeText(password);
    APP_UTILS.showToast('✅ Password copied to clipboard');
  } catch (error) {
    APP_UTILS.handleError('❌ Failed to copy password', error);
  }
}

initApp();