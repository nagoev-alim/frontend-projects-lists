/**
 * Этот код реализует функциональность верификации аккаунта.
 * Он создает форму с шестью полями ввода для ввода кода подтверждения,
 * обрабатывает ввод пользователя и управляет фокусом между полями.
 */

import './style.css';

/**
 * Интерфейс для конфигурации приложения
 * @interface
 */
interface AppConfig {
  /** Селектор корневого элемента */
  root: string;
  selectors: {
    /** Селектор для полей ввода кода верификации */
    verificationDigit: string;
  };
}

/**
 * Интерфейс для состояния приложения
 * @interface
 */
interface AppState {
  elements: {
    /** Массив полей ввода для кода верификации */
    verificationDigits: HTMLInputElement[] | null;
  };
}

/**
 * Конфигурация приложения
 * @type {AppConfig}
 */
const APP_CONFIG: AppConfig = {
  root: '#app',
  selectors: {
    verificationDigit: '[data-verification-digit]',
  },
};

/**
 * Состояние приложения
 * @type {AppState}
 */
const APP_STATE: AppState = {
  elements: {
    verificationDigits: null,
  },
};

/**
 * Утилиты приложения
 * @namespace
 */
const APP_UTILS = {
  /**
   * Преобразует строку атрибута данных для использования в HTML
   * @param {string} element - Строка атрибута данных
   * @returns {string} Преобразованная строка атрибута
   */
  renderDataAttributes: (element: string): string => element.slice(1, -1),
};

/**
 * Создает HTML-разметку приложения
 */
function createAppHTML(): void {
  const {
    root,
    selectors: {verificationDigit},
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector<HTMLElement>(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='grid w-full max-w-3xl gap-4 rounded border bg-white p-3 text-center shadow'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>Verify Account</h1>
      <p>We emailed you the six-digit code to johndoe@email.com. Enter the code below to confirm your email address.</p>
      <div class='flex flex-wrap items-center justify-center gap-2'>
        ${Array.from({ length: 6 })
    .map(
      () => `
          <input 
            class='h-[40px] w-[40px] rounded border-2 px-1 py-1 text-center text-6xl font-bold focus:border-blue-400 focus:outline-none md:h-[80px] md:w-[80px]'
            type='number'
            ${renderDataAttributes(verificationDigit)}
            placeholder='0'
            min='0'
            max='9'
            required
          >
        `,
    )
    .join('')}
      </div>
      <p>This is design only. We didn't actually send you an email as we don't have your email, right?</p>
    </div>
  `;
}

/**
 * Инициализирует DOM-элементы приложения
 */
function initDOMElements(): void {
  APP_STATE.elements.verificationDigits = Array.from(document.querySelectorAll<HTMLInputElement>(APP_CONFIG.selectors.verificationDigit));
}

/**
 * Инициализирует приложение
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();
  APP_STATE.elements.verificationDigits?.[0].focus();
  APP_STATE.elements.verificationDigits?.forEach((digit, index) => {
    digit.addEventListener('keydown', (event) => handleDigitKeydown(event as KeyboardEvent, index));
  });
}

/**
 * Обрабатывает нажатие клавиши в поле ввода
 * @param {KeyboardEvent} param0 - Объект события клавиатуры
 * @param {number} index - Индекс текущего поля ввода
 */
function handleDigitKeydown({ key }: KeyboardEvent, index: number): void {
  const keyNumber = Number(key);
  const isValidNumber = !isNaN(keyNumber) && keyNumber >= 0 && keyNumber <= 9;
  const isBackspace = key === 'Backspace';
  const isLastDigit = index === 5;
  const isFirstDigit = index === 0;

  if (isValidNumber) {
    APP_STATE.elements.verificationDigits![index].value = '';
    if (!isLastDigit) {
      focusNextDigit(index);
    }
  } else if (isBackspace && !isFirstDigit) {
    focusPreviousDigit(index);
  }
}

/**
 * Перемещает фокус на следующее поле ввода
 * @param {number} currentIndex - Индекс текущего поля ввода
 */
function focusNextDigit(currentIndex: number): void {
  setTimeout(() => APP_STATE.elements.verificationDigits![currentIndex + 1].focus(), 10);
}

/**
 * Перемещает фокус на предыдущее поле ввода
 * @param {number} currentIndex - Индекс текущего поля ввода
 */
function focusPreviousDigit(currentIndex: number): void {
  setTimeout(() => APP_STATE.elements.verificationDigits![currentIndex - 1].focus(), 10);
}

initApp();
