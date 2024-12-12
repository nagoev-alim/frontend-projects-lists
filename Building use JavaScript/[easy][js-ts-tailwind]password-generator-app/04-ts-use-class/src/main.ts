/**
 * Этот код реализует генератор паролей с пользовательским интерфейсом.
 * Он позволяет настраивать длину пароля, выбирать типы символов (строчные, прописные, цифры, символы),
 * генерировать пароль на основе выбранных параметров, копировать его в буфер обмена
 * и отображать индикатор силы пароля.
 */

import './style.css';
import { icons } from 'feather-icons';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

/**
 * Интерфейс конфигурации генератора паролей
 */
interface Config {
  /** Корневой элемент для вставки HTML */
  root: string;
  /** Селекторы для различных элементов интерфейса */
  selectors: {
    [key: string]: string;
  };
  /** Функции для генерации различных типов символов */
  characters: {
    [key: string]: () => string;
  };
}

/**
 * Интерфейс состояния генератора паролей
 */
interface State {
  /** Элементы DOM, используемые в интерфейсе */
  elements: {
    [key: string]: HTMLElement | NodeListOf<HTMLElement> | null;
  };
}

/**
 * Интерфейс утилит генератора паролей
 */
interface Utils {
  /** Функция для рендеринга data-атрибутов */
  renderDataAttributes: (element: string) => string;
  /** Конфигурация для toast-уведомлений */
  toastConfig: {
    className: string;
    duration: number;
    gravity: string;
    position: string;
  };
  /** Функция для отображения toast-уведомлений */
  showToast: (message: string) => void;
  /** Функция для обработки ошибок */
  handleError: (message: string, error?: Error) => void;
  /** Функции для генерации символов разных типов */
  chars: {
    [key: string]: () => string;
  };
}

/**
 * Интерфейс опций для генерации пароля
 */
interface PasswordOptions {
  [key: string]: boolean | number;

  /** Длина пароля */
  length: number;
}

/**
 * Класс генератора паролей
 */
class PasswordGenerator {
  /** Конфигурация генератора */
  private readonly config: Config;
  /** Состояние генератора */
  private state: State;
  /** Утилиты генератора */
  private readonly utils: Utils;

  /**
   * Конструктор класса PasswordGenerator
   */
  constructor() {
    this.config = {
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

    this.state = {
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
      handleError: (message: string, error: Error | null = null): void => {
        this.utils.showToast(message);
        if (error) console.error(message, error);
      },
      chars: Object.keys(this.config.characters).reduce((acc: { [key: string]: () => string }, key: string) => {
        acc[key] = () => this.config.characters[key]();
        return acc;
      }, {}),
    };

    this.init();
  }

  /**
   * Создает HTML-разметку интерфейса генератора паролей
   */
  private createAppHTML(): void {
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
    } = this.config;
    const { renderDataAttributes } = this.utils;
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
   * Инициализирует DOM-элементы
   */
  private initDOMElements(): void {
    this.state.elements = {
      passwordOutput: document.querySelector<HTMLInputElement>(this.config.selectors.passwordOutput),
      copyButton: document.querySelector<HTMLButtonElement>(this.config.selectors.copyButton),
      strengthIndicator: document.querySelector<HTMLDivElement>(this.config.selectors.strengthIndicator),
      lengthDisplay: document.querySelector<HTMLSpanElement>(this.config.selectors.lengthDisplay),
      lengthSlider: document.querySelector<HTMLInputElement>(this.config.selectors.lengthSlider),
      charType: document.querySelectorAll<HTMLInputElement>(this.config.selectors.charType),
      generateButton: document.querySelector<HTMLButtonElement>(this.config.selectors.generateButton),
    };
  }

  /**
   * Инициализирует генератор паролей
   */
  private init(): void {
    this.createAppHTML();
    this.initDOMElements();

    const { lengthSlider, generateButton, copyButton } = this.state.elements;
    if (lengthSlider instanceof HTMLInputElement) {
      lengthSlider.addEventListener('input', this.handleLengthSliderChange.bind(this));
    }
    if (generateButton instanceof HTMLButtonElement) {
      generateButton.addEventListener('click', this.handleGenerateButtonClick.bind(this));
    }
    if (copyButton instanceof HTMLButtonElement) {
      copyButton.addEventListener('click', this.handleCopyButtonClick.bind(this));
    }
  }

  /**
   * Обрабатывает изменение длины пароля
   * @param event - Событие изменения ползунка
   */
  private handleLengthSliderChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (this.state.elements.lengthDisplay instanceof HTMLSpanElement) {
      this.state.elements.lengthDisplay.textContent = target.value;
    }
  }

  /**
   * Генерирует пароль на основе выбранных опций
   * @param options - Опции для генерации пароля
   * @returns Сгенерированный пароль
   */
  private generatePassword(options: PasswordOptions): string {
    const availableTypes = Object.keys(this.utils.chars).filter(
      (type) => options[type] === true,
    );
    return Array.from({ length: options.length }, () => {
      const randomType =
        availableTypes[Math.floor(Math.random() * availableTypes.length)];
      return this.utils.chars[randomType]();
    }).join('');
  }

  /**
   * Обрабатывает нажатие кнопки генерации пароля
   */
  private handleGenerateButtonClick(): void {
    if (this.state.elements.charType instanceof NodeList) {
      const params = Array.from(this.state.elements.charType).reduce((acc: { [key: string]: boolean }, option) => {
        if (option instanceof HTMLInputElement) {
          acc[option.dataset.charType || ''] = option.checked;
        }
        return acc;
      }, {});

      const passwordOptions: PasswordOptions = {
        ...params,
        length: this.state.elements.lengthSlider instanceof HTMLInputElement
          ? parseInt(this.state.elements.lengthSlider.value, 10)
          : 15,
      };

      if (this.state.elements.passwordOutput instanceof HTMLInputElement) {
        this.state.elements.passwordOutput.value = this.generatePassword(passwordOptions);
      }
      this.handleIndicatorUpdate();
    }
  }

  /**
   * Обновляет индикатор силы пароля
   * Устанавливает атрибут data-level в зависимости от длины пароля
   */
  private handleIndicatorUpdate(): void {
    if (this.state.elements.lengthSlider instanceof HTMLInputElement &&
      this.state.elements.strengthIndicator instanceof HTMLDivElement) {
      const value = +this.state.elements.lengthSlider.value;
      const level = value <= 8 ? 'weak' : value <= 16 ? 'medium' : 'strong';
      this.state.elements.strengthIndicator.setAttribute('data-level', level);
    }
  }

  /**
   * Обрабатывает нажатие на кнопку копирования пароля
   * Копирует сгенерированный пароль в буфер обмена
   * @returns {Promise<void>}
   */
  private async handleCopyButtonClick(): Promise<void> {
    if (this.state.elements.passwordOutput instanceof HTMLInputElement) {
      const password = this.state.elements.passwordOutput.value;
      if (!password) return;

      try {
        await navigator.clipboard.writeText(password);
        this.utils.showToast('✅ Password copied to clipboard');
      } catch (error) {
        this.utils.handleError('❌ Failed to copy password', error instanceof Error ? error : new Error('Unknown error'));
      }
    }
  }
}

/**
 * Создает новый экземпляр класса PasswordGenerator
 */
new PasswordGenerator();