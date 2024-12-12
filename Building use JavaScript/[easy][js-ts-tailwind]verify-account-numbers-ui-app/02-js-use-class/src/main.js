/**
 * Этот код представляет собой реализацию формы верификации аккаунта.
 * Он создает интерфейс с шестью полями ввода для ввода кода подтверждения,
 * обрабатывает ввод пользователя и управляет фокусом между полями.
 */

import './style.css';

/**
 * Класс, представляющий форму верификации аккаунта
 */
class VerifyAccount {
  /**
   * Создает экземпляр VerifyAccount
   */
  constructor() {
    /**
     * Конфигурация приложения
     * @type {Object}
     */
    this.config = {
      root: '#app',
      selectors: {
        verificationDigit: '[data-verification-digit]',
      },
    };

    /**
     * Состояние приложения
     * @type {Object}
     */
    this.state = {
      elements: {
        verificationDigits: null,
      },
    };

    /**
     * Утилиты приложения
     * @type {Object}
     */
    this.utils = {
      /**
       * Преобразует строку атрибута данных для использования в HTML
       * @param {string} element - Строка атрибута данных
       * @returns {string} Преобразованная строка атрибута
       */
      renderDataAttributes: (element) => element.slice(1, -1),
    };

    this.init();
  }

  /**
   * Создает HTML-разметку приложения
   */
  createAppHTML() {
    const {
      root,
      selectors: { verificationDigit },
    } = this.config;
    const { renderDataAttributes } = this.utils;
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
   * Инициализирует DOM-элементы
   */
  initDOMElements() {
    this.state.elements = {
      verificationDigits: Array.from(document.querySelectorAll(this.config.selectors.verificationDigit)),
    };
  }

  /**
   * Инициализирует приложение
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();

    this.state.elements.verificationDigits[0].focus();
    this.state.elements.verificationDigits.forEach((digit, index) => {
      digit.addEventListener('keydown', (event) => this.handleDigitKeydown(event, index));
    });
  }

  /**
   * Обрабатывает нажатие клавиши в поле ввода
   * @param {KeyboardEvent} event - Событие нажатия клавиши
   * @param {number} index - Индекс текущего поля ввода
   */
  handleDigitKeydown({ key }, index) {
    const keyNumber = Number(key);
    const isValidNumber = !isNaN(keyNumber) && keyNumber >= 0 && keyNumber <= 9;
    const isBackspace = key === 'Backspace';
    const isLastDigit = index === 5;
    const isFirstDigit = index === 0;

    if (isValidNumber) {
      this.state.elements.verificationDigits[index].value = '';
      if (!isLastDigit) {
        this.focusNextDigit(index);
      }
    } else if (isBackspace && !isFirstDigit) {
      this.focusPreviousDigit(index);
    }
  }

  /**
   * Переводит фокус на следующее поле ввода
   * @param {number} currentIndex - Индекс текущего поля ввода
   */
  focusNextDigit(currentIndex) {
    setTimeout(() => this.state.elements.verificationDigits[currentIndex + 1].focus(), 10);
  }

  /**
   * Переводит фокус на предыдущее поле ввода
   * @param {number} currentIndex - Индекс текущего поля ввода
   */
  focusPreviousDigit(currentIndex) {
    setTimeout(() => this.state.elements.verificationDigits[currentIndex - 1].focus(), 10);
  }
}

new VerifyAccount();
