/**
 * Этот код представляет собой приложение для верификации аккаунта.
 * Оно отображает форму с шестью полями ввода для ввода кода подтверждения.
 * Реализована логика навигации между полями ввода с помощью клавиатуры.
 */

import './style.css';

/**
 * Конфигурация приложения
 * @type {Object}
 */
const APP_CONFIG = {
  root: '#app',
  selectors: {
    verificationDigit: '[data-verification-digit]',
  },
};

/**
 * Состояние приложения
 * @type {Object}
 */
const APP_STATE = {
  elements: {
    verificationDigits: null,
  },
};

/**
 * Утилиты приложения
 * @type {Object}
 */
const APP_UTILS = {
  /**
   * Преобразует атрибут данных в строку для использования в HTML
   * @param {string} element - Строка с атрибутом данных
   * @returns {string} Строка атрибута без квадратных скобок
   */
  renderDataAttributes: (element) => element.slice(1, -1),
};

/**
 * Создает HTML-разметку приложения
 */
function createAppHTML() {
  const {
    root,
    selectors: {verificationDigit},
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector(root);

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
function initDOMElements() {
  APP_STATE.elements.verificationDigits = Array.from(document.querySelectorAll(APP_CONFIG.selectors.verificationDigit));
}

/**
 * Инициализирует приложение
 */
function initApp() {
  createAppHTML();
  initDOMElements();
  APP_STATE.elements.verificationDigits[0].focus();
  APP_STATE.elements.verificationDigits.forEach((digit, index) => {
    digit.addEventListener('keydown', (event) => handleDigitKeydown(event, index));
  });
}

/**
 * Обрабатывает нажатие клавиши в поле ввода
 * @param {KeyboardEvent} event - Событие нажатия клавиши
 * @param {number} index - Индекс текущего поля ввода
 */
function handleDigitKeydown({ key }, index) {
  const keyNumber = Number(key);
  const isValidNumber = !isNaN(keyNumber) && keyNumber >= 0 && keyNumber <= 9;
  const isBackspace = key === 'Backspace';
  const isLastDigit = index === 5;
  const isFirstDigit = index === 0;

  if (isValidNumber) {
    APP_STATE.elements.verificationDigits[index].value = '';
    if (!isLastDigit) {
      focusNextDigit(index);
    }
  } else if (isBackspace && !isFirstDigit) {
    focusPreviousDigit(index);
  }
}

/**
 * Переводит фокус на следующее поле ввода
 * @param {number} currentIndex - Индекс текущего поля ввода
 */
function focusNextDigit(currentIndex) {
  setTimeout(() => APP_STATE.elements.verificationDigits[currentIndex + 1].focus(), 10);
}

/**
 * Переводит фокус на предыдущее поле ввода
 * @param {number} currentIndex - Индекс текущего поля ввода
 */
function focusPreviousDigit(currentIndex) {
  setTimeout(() => APP_STATE.elements.verificationDigits[currentIndex - 1].focus(), 10);
}

initApp();
