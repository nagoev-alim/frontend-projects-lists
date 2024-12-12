/**
 * Этот код реализует функциональность верификации аккаунта.
 * Он создает форму с шестью полями ввода для ввода кода подтверждения,
 * обрабатывает ввод пользователя и управляет фокусом между полями.
 */

import './style.css';

/**
 * Интерфейс для конфигурации приложения
 */
interface Config {
  /** Селектор корневого элемента */
  root: string;
  selectors: {
    /** Селектор для полей ввода кода верификации */
    verificationDigit: string;
  };
}

/**
 * Интерфейс для состояния приложения
 */
interface State {
  elements: {
    /** Массив полей ввода для кода верификации */
    verificationDigits: HTMLInputElement[] | null;
  };
}

/**
 * Класс, реализующий функциональность верификации аккаунта
 */
class VerifyAccount {
  /** Конфигурация приложения */
  private readonly config: Config;
  /** Состояние приложения */
  private state: State;
  /** Утилиты приложения */
  private readonly utils: { renderDataAttributes: (element: string) => string };

  constructor() {
    this.config = {
      root: '#app',
      selectors: {
        verificationDigit: '[data-verification-digit]',
      },
    };

    this.state = {
      elements: {
        verificationDigits: null,
      },
    };

    this.utils = {
      renderDataAttributes: (element: string): string => element.slice(1, -1),
    };

    this.init();
  }

  /**
   * Создает HTML-разметку приложения
   */
  private createAppHTML(): void {
    const {
      root,
      selectors: { verificationDigit },
    } = this.config;
    const { renderDataAttributes } = this.utils;
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
   * Инициализирует DOM-элементы
   */
  private initDOMElements(): void {
    this.state.elements.verificationDigits = Array.from(document.querySelectorAll<HTMLInputElement>(this.config.selectors.verificationDigit));
  }

  /**
   * Инициализирует приложение
   */
  private init(): void {
    this.createAppHTML();
    this.initDOMElements();

    this.state.elements.verificationDigits?.[0].focus();
    this.state.elements.verificationDigits?.forEach((digit, index) => {
      digit.addEventListener('keydown', (event: KeyboardEvent) => this.handleDigitKeydown(event, index));
    });
  }

  /**
   * Обрабатывает нажатие клавиши в поле ввода
   * @param {KeyboardEvent} param0 - Объект события клавиатуры
   * @param {number} index - Индекс текущего поля ввода
   */
  private handleDigitKeydown({ key }: KeyboardEvent, index: number): void {
    const keyNumber = Number(key);
    const isValidNumber = !isNaN(keyNumber) && keyNumber >= 0 && keyNumber <= 9;
    const isBackspace = key === 'Backspace';
    const isLastDigit = index === 5;
    const isFirstDigit = index === 0;

    if (isValidNumber) {
      this.state.elements.verificationDigits![index].value = '';
      if (!isLastDigit) {
        this.focusNextDigit(index);
      }
    } else if (isBackspace && !isFirstDigit) {
      this.focusPreviousDigit(index);
    }
  }

  /**
   * Перемещает фокус на следующее поле ввода
   * @param {number} currentIndex - Индекс текущего поля ввода
   */
  private focusNextDigit(currentIndex: number): void {
    setTimeout(() => this.state.elements.verificationDigits![currentIndex + 1].focus(), 10);
  }

  /**
   * Перемещает фокус на предыдущее поле ввода
   * @param {number} currentIndex - Индекс текущего поля ввода
   */
  private focusPreviousDigit(currentIndex: number): void {
    setTimeout(() => this.state.elements.verificationDigits![currentIndex - 1].focus(), 10);
  }
}

new VerifyAccount();
