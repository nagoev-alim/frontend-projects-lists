import './style.css';
import { icons } from 'feather-icons';

/**
 * @file Этот файл содержит реализацию класса PasswordStrength, который
 * предоставляет функциональность проверки силы пароля и управления
 * видимостью пароля в пользовательском интерфейсе.
 */

/**
 * Интерфейс для конфигурации класса PasswordStrength
 */
interface Config {
  /** Корневой селектор для приложения */
  root: string;
  /** Объект с селекторами для различных элементов */
  selectors: {
    [key: string]: string;
  };
  /** Иконки для переключения видимости пароля */
  toggleVisibilityIcons: {
    [key: string]: string;
  };
  /** Регулярные выражения для проверки силы пароля */
  regExp: {
    [key: string]: RegExp;
  };
}

/**
 * Интерфейс для состояния класса PasswordStrength
 */
interface State {
  /** Объект с элементами DOM */
  elements: { [key: string]: HTMLElement | null };
  /** Идентификатор таймаута */
  timeout: number | null;
}

/**
 * Интерфейс для утилитарных функций
 */
interface Utils {
  /** Функция для рендеринга data-атрибутов */
  renderDataAttributes: (element: string) => string;
}

/**
 * Класс для проверки силы пароля и управления видимостью
 */
class PasswordStrength {
  private readonly config: Config;
  private readonly state: State;
  private readonly utils: Utils;

  constructor() {
    this.config = {
      root: '#app',
      selectors: {
        input: '[data-password-input]',
        toggleVisibility: '[data-password-toggle]',
        strengthIndicator: '[data-password-strength]',
        strengthMessage: '[data-password-message]',
      },
      toggleVisibilityIcons: {
        true: icons['eye-off'].toSvg(),
        false: icons.eye.toSvg(),
      },
      regExp: {
        medium: new RegExp(
          '((?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{6,}))|((?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9])(?=.{8,}))',
        ),
        strong: new RegExp(
          '(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})',
        ),
      },
    };

    this.state = {
      elements: {
        input: null,
        toggleVisibility: null,
        strengthIndicator: null,
        strengthMessage: null,
      },
      timeout: null,
    };

    this.utils = {
      renderDataAttributes: (element) => element.slice(1, -1),
    };

    this.init();
  }

  /**
   * Создает HTML-разметку приложения
   */
  private createAppHTML(): void {
    const {
      root,
      selectors: {
        input,
        toggleVisibility,
        strengthIndicator,
        strengthMessage,
      },
    } = this.config;
    const { renderDataAttributes } = this.utils;
    const rootElement = document.querySelector(root);

    if (!rootElement) return;

    rootElement.innerHTML = `
    <div class='grid max-w-md w-full gap-4 rounded border bg-white p-3 shadow'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>Password Strength Check</h1>
      <div class='relative'>
        <input class='w-full rounded border bg-slate-50 px-3 py-2 pr-9 focus:border-blue-400 focus:outline-none' type='password' ${renderDataAttributes(input)} placeholder='Type password'>
        <button class='absolute -translate-y-1/2 right-1 top-1/2 hidden' ${renderDataAttributes(toggleVisibility)}>
          ${icons.eye.toSvg()}
        </button>
      </div>
      <div class='grid hidden gap-2' ${renderDataAttributes(strengthIndicator)}>
        <ul class='grid grid-cols-3 gap-2'>
          ${Array.from({ length: 3 })
      .map(() => `<li class='h-2 border-2'></li>`)
      .join('')}
        </ul>
        <p class='text-center'>Your password is <span class='font-bold' ${renderDataAttributes(strengthMessage)}></span></p>
      </div>
    </div>
  `;
  }

  /**
   * Инициализирует DOM-элементы
   */
  private initDOMElements(): void {
    this.state.elements = {
      input: document.querySelector(this.config.selectors.input),
      toggleVisibility: document.querySelector(this.config.selectors.toggleVisibility),
      strengthIndicator: document.querySelector(this.config.selectors.strengthIndicator),
      strengthMessage: document.querySelector(this.config.selectors.strengthMessage),
    };
  }

  /**
   * Инициализирует приложение
   */
  private init(): void {
    this.createAppHTML();
    this.initDOMElements();
    this.state.elements.input?.addEventListener('input', this.handleInputChange.bind(this));
    this.state.elements.toggleVisibility?.addEventListener('click', this.handleToggleVisibilityClick.bind(this));
  }

  /**
   * Проверяет силу пароля
   * @param {string} value - Значение пароля
   */
  private strengthChecker(value: string): void {
    const strengths = ['too-weak', 'medium', 'strong'];
    const strengthIndex = this.config.regExp.strong.test(value) ? 2 : this.config.regExp.medium.test(value) ? 1 : 0;
    const strength = strengths[strengthIndex];
    if (!this.state.elements.strengthIndicator || !this.state.elements.strengthMessage) return;
    this.state.elements.strengthMessage.textContent = strength;
    this.state.elements.strengthIndicator.className = strength;
  }

  /**
   * Обрабатывает изменение ввода пароля
   * @param {Event} event - Событие ввода
   */
  private handleInputChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const trimmedValue = value.trim();
    const isValueEmpty = trimmedValue.length === 0;

    this.toggleElementsVisibility(isValueEmpty);
    if (this.state.timeout) clearTimeout(this.state.timeout);
    this.state.timeout = setTimeout(() => {
      if (!isValueEmpty) {
        this.strengthChecker(trimmedValue);
      }
    }, 500);
  }

  /**
   * Переключает видимость элементов
   * @param {boolean} isHidden - Флаг скрытия элементов
   */
  private toggleElementsVisibility(isHidden: boolean): void {
    [this.state.elements.toggleVisibility, this.state.elements.strengthIndicator].forEach(element => {
      element?.classList.toggle('hidden', isHidden);
    });
  }

  /**
   * Обрабатывает клик по кнопке переключения видимости пароля
   * @param {Event} event - Событие клика
   */
  private handleToggleVisibilityClick(event: Event): void {
    const currentTarget = event.target as HTMLButtonElement;
    const isPasswordVisible = currentTarget.classList.toggle('toggle');
    this.updatePasswordVisibility(currentTarget, isPasswordVisible);
  }

  /**
   * Обновляет видимость пароля
   * @param {HTMLButtonElement} button - Кнопка переключения видимости
   * @param {boolean} isVisible - Флаг видимости пароля
   */
  private updatePasswordVisibility(button: HTMLButtonElement, isVisible: boolean): void {
    //@ts-ignore
    button.innerHTML = this.config.toggleVisibilityIcons[isVisible];
    if (this.state.elements.input) {
      //@ts-ignore
      this.state.elements.input.type = isVisible ? 'text' : 'password';
    }
  }
}

new PasswordStrength();
