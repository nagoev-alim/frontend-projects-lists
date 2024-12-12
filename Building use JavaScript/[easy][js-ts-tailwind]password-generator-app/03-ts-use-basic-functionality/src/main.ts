/**
 * Этот файл содержит код для генератора паролей. Он включает в себя:
 * - Настройку конфигурации приложения
 * - Управление состоянием приложения
 * - Утилиты для работы с UI и генерации паролей
 * - Функции для создания HTML-структуры и инициализации DOM-элементов
 * - Обработчики событий для взаимодействия с пользователем
 */

import './style.css';
import { icons } from 'feather-icons';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

/**
 * Интерфейс конфигурации приложения
 * @typedef {Object} AppConfig
 * @property {string} root - Корневой селектор приложения
 * @property {Object} selectors - Объект с селекторами элементов
 * @property {Object} characters - Объект с функциями генерации символов
 */
interface AppConfig {
  root: string;
  selectors: {
    passwordOutput: string;
    copyButton: string;
    strengthIndicator: string;
    lengthDisplay: string;
    lengthSlider: string;
    charType: string;
    generateButton: string;
  };
  characters: {
    [key: string]: () => string;
  };
}

/**
 * Конфигурация приложения
 * @type {AppConfig}
 */
const APP_CONFIG: AppConfig = {
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
 * Интерфейс состояния приложения
 * @typedef {Object} AppState
 * @property {Object} elements - Объект с DOM-элементами
 */
interface AppState {
  elements: {
    passwordOutput: HTMLElement | null,
    copyButton: HTMLElement | null,
    strengthIndicator: HTMLElement | null,
    lengthDisplay: HTMLElement | null,
    lengthSlider: HTMLElement | null,
    charType: NodeListOf<HTMLElement> | null,
    generateButton: HTMLElement | null,
  };
}

/**
 * Состояние приложения
 * @type {AppState}
 */
const APP_STATE: AppState = {
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
 * Интерфейс утилит приложения
 * @typedef {Object} AppUtils
 * @property {Function} renderDataAttributes - Функция для рендеринга data-атрибутов
 * @property {Object} toastConfig - Конфигурация для уведомлений
 * @property {Function} showToast - Функция для показа уведомлений
 * @property {Function} handleError - Функция для обработки ошибок
 * @property {Object} chars - Объект с функциями генерации символов
 */
interface AppUtils {
  renderDataAttributes: (element: string) => string;
  toastConfig: {
    className: string;
    duration: number;
    gravity: string;
    position: string;
  };
  showToast: (message: string) => void;
  handleError: (message: string, error?: Error) => void;
  chars: {
    [key: string]: () => string;
  };
}

/**
 * Утилиты приложения
 * @type {AppUtils}
 */
const APP_UTILS: AppUtils = {
  renderDataAttributes: (element: string) => element.slice(1, -1),

  toastConfig: {
    className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
    duration: 3000,
    gravity: 'bottom',
    position: 'center',
  },

  showToast: (message: string) => {
    // @ts-ignore
    Toastify({
      text: message,
      ...APP_UTILS.toastConfig,
    }).showToast();
  },

  handleError: (message: string, error: Error | null = null) => {
    APP_UTILS.showToast(message);
    if (error) console.error(message, error);
  },

  chars: Object.keys(APP_CONFIG.characters).reduce((acc, key) => {
    acc[key] = () => APP_CONFIG.characters[key]();
    return acc;
  }, {} as { [key: string]: () => string }),
};

/**
 * Создает HTML-структуру приложения
 */
function createAppHTML(): void {
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
 * Инициализирует DOM-элементы в состоянии приложения
 */
function initDOMElements(): void {
  APP_STATE.elements = {
    passwordOutput: document.querySelector(APP_CONFIG.selectors.passwordOutput) as HTMLInputElement | null,
    copyButton: document.querySelector(APP_CONFIG.selectors.copyButton) as HTMLButtonElement | null,
    strengthIndicator: document.querySelector(APP_CONFIG.selectors.strengthIndicator) as HTMLElement | null,
    lengthDisplay: document.querySelector(APP_CONFIG.selectors.lengthDisplay) as HTMLElement | null,
    lengthSlider: document.querySelector(APP_CONFIG.selectors.lengthSlider) as HTMLInputElement | null,
    charType: document.querySelectorAll(APP_CONFIG.selectors.charType),
    generateButton: document.querySelector(APP_CONFIG.selectors.generateButton) as HTMLButtonElement | null,
  };
}

/**
 * Инициализирует приложение
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();

  const { lengthSlider, generateButton, copyButton } = APP_STATE.elements;

  if (lengthSlider instanceof HTMLInputElement) {
    lengthSlider.addEventListener('input', handleLengthSliderChange);
  }
  if (generateButton instanceof HTMLButtonElement) {
    generateButton.addEventListener('click', handleGenerateButtonClick);
  }
  if (copyButton instanceof HTMLButtonElement) {
    copyButton.addEventListener('click', handleCopyButtonClick);
  }
}

/**
 * Обработчик изменения длины пароля
 * @param {Event} event - Событие изменения
 */
function handleLengthSliderChange(event: Event): void {
  const target = event.target as HTMLInputElement;
  const lengthDisplay = APP_STATE.elements.lengthDisplay as HTMLElement;
  lengthDisplay.textContent = target.value;
}

/**
 * Интерфейс опций пароля
 * @typedef {Object} PasswordOptions
 * @property {number} length - Длина пароля
 */
interface PasswordOptions {
  [key: string]: boolean | number;

  length: number;
}

/**
 * Генерирует пароль на основе заданных опций
 * @param {PasswordOptions} options - Опции для генерации пароля
 * @returns {string} Сгенерированный пароль
 */
function generatePassword(options: PasswordOptions): string {
  const availableTypes = Object.keys(APP_UTILS.chars).filter(
    (type) => options[type] === true,
  );
  return Array.from({ length: options.length }, () => {
    const randomType =
      availableTypes[Math.floor(Math.random() * availableTypes.length)];
    return APP_UTILS.chars[randomType]();
  }).join('');
}

/**
 * Обрабатывает нажатие кнопки генерации пароля.
 * Собирает параметры из выбранных типов символов и длины пароля,
 * затем генерирует новый пароль и обновляет индикатор сложности.
 */
function handleGenerateButtonClick(): void {
  const charTypeElements = APP_STATE.elements.charType as NodeListOf<HTMLInputElement>;
  const params = Array.from(charTypeElements).reduce((acc, option) => {
    acc[option.dataset.charType as string] = option.checked;
    return acc;
  }, {} as { [key: string]: boolean });

  const lengthSlider = APP_STATE.elements.lengthSlider as HTMLInputElement;
  const passwordOptions: PasswordOptions = {
    ...params,
    length: parseInt(lengthSlider.value, 10),
  };

  const passwordOutput = APP_STATE.elements.passwordOutput as HTMLInputElement;
  passwordOutput.value = generatePassword(passwordOptions);
  handleIndicatorUpdate();
}

/**
 * Обновляет индикатор сложности пароля на основе его длины.
 * Устанавливает уровень сложности: слабый, средний или сильный.
 */
function handleIndicatorUpdate(): void {
  const lengthSlider = APP_STATE.elements.lengthSlider as HTMLInputElement;
  const value = +lengthSlider.value;
  const level = value <= 8 ? 'weak' : value <= 16 ? 'medium' : 'strong';
  const strengthIndicator = APP_STATE.elements.strengthIndicator as HTMLElement;
  strengthIndicator.setAttribute('data-level', level);
}

/**
 * Обрабатывает нажатие кнопки копирования пароля.
 * Копирует сгенерированный пароль в буфер обмена и показывает уведомление.
 * В случае ошибки выводит сообщение об ошибке.
 * @returns {Promise<void>}
 */
async function handleCopyButtonClick(): Promise<void> {
  const passwordOutput = APP_STATE.elements.passwordOutput as HTMLInputElement;
  const password = passwordOutput.value;
  if (!password) return;

  try {
    await navigator.clipboard.writeText(password);
    APP_UTILS.showToast('✅ Password copied to clipboard');
  } catch (error) {
    APP_UTILS.handleError('❌ Failed to copy password', error as Error);
  }
}

/**
 * Инициализирует приложение, вызывая функцию создания HTML и настройки обработчиков событий.
 */
initApp();