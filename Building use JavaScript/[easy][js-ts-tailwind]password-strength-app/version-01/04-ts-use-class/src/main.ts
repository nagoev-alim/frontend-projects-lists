import './style.css';
import { icons } from 'feather-icons';
import { passwordStrength } from 'check-password-strength';

/**
 * Этот код реализует функциональность проверки силы пароля.
 * Он создает интерфейс с полем ввода пароля, кнопкой переключения видимости пароля
 * и индикатором силы пароля. При вводе пароля происходит оценка его силы,
 * и результат отображается пользователю.
 */

/**
 * Интерфейс конфигурации приложения
 * @typedef {Object} Config
 * @property {string} root - Корневой селектор для приложения
 * @property {Object} selectors - Селекторы для элементов DOM
 */
interface Config {
  root: string;
  selectors: {
    [key: string]: string;
  };
}

/**
 * Интерфейс состояния приложения
 * @typedef {Object} State
 * @property {Object} elements - Объект с элементами DOM
 */
interface State {
  elements: { [key: string]: HTMLElement | null };
}

/**
 * Класс для проверки силы пароля
 */
class PasswordStrength {
  private readonly config: Config;
  private state: State;

  /**
   * Создает экземпляр PasswordStrength
   */
  constructor() {
    this.config = {
      root: '#app',
      selectors: {
        input: '[data-password-input]',
        toggleVisibility: '[data-password-toggle]',
        strengthIndicator: '[data-password-strength]',
        strengthMessage: '[data-password-message]',
      },
    };

    this.state = {
      elements: {
        input: null,
        toggleVisibility: null,
        strengthIndicator: null,
        strengthMessage: null,
      },
    };

    this.init();
  }

  /**
   * Создает HTML-разметку приложения
   */
  private createAppHTML(): void {
    const { root, selectors } = this.config;
    const rootElement = document.querySelector(root);

    if (!rootElement) return;

    rootElement.innerHTML = `
    <div class='grid gap-4 max-w-md w-full rounded border bg-white p-3 shadow'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>Password Strength Check</h1>
      <div class='relative'>
        <input class='w-full rounded border bg-slate-50 px-3 py-2 pr-9 focus:border-blue-400 focus:outline-none' type='password' ${selectors.input.slice(1, -1)} placeholder='Type password'>
        <button class='absolute right-1 top-1/2 hidden -translate-y-1/2' ${selectors.toggleVisibility.slice(1, -1)}>
          ${icons.eye.toSvg()}
        </button>
      </div>
      <div class='hidden grid gap-2' ${selectors.strengthIndicator.slice(1, -1)}>
        <ul class='grid grid-cols-4 gap-2'>
          ${Array.from({ length: 4 }).map(() => `<li class='h-2 border-2'></li>`).join('')}
        </ul>
        <p class='text-center'>Your password is <span class='font-bold' ${selectors.strengthMessage.slice(1, -1)}></span></p>
      </div>
    </div>
  `;
  }

  /**
   * Инициализирует DOM-элементы
   */
  private initDOMElements(): void {
    this.state.elements = Object.fromEntries(
      Object.entries(this.config.selectors).map(([key, selector]) => [key, document.querySelector(selector)]),
    );
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
   * Обрабатывает изменение ввода пароля
   * @param {Event} event - Событие ввода
   */
  private handleInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const isEmpty = target.value.length === 0;
    const { strengthIndicator, toggleVisibility, strengthMessage } = this.state.elements;
    if (!strengthIndicator || !toggleVisibility || !strengthMessage) return;

    [strengthIndicator, toggleVisibility].forEach(el => el?.classList.toggle('hidden', isEmpty));

    if (!isEmpty) {
      const { value: checkType } = passwordStrength(target.value);
      const lowercaseType = checkType.toLowerCase();
      strengthMessage.textContent = lowercaseType;
      strengthIndicator.className = `grid gap-2 ${lowercaseType.replace(' ', '-')}`;
    }
  }

  /**
   * Обрабатывает клик по кнопке переключения видимости пароля
   * @param {Event} event - Событие клика
   */
  private handleToggleVisibilityClick(event: Event): void {
    const target = event.target as HTMLButtonElement;
    const isVisible = target.classList.toggle('toggle');
    target.innerHTML = icons[isVisible ? 'eye-off' : 'eye'].toSvg();
    const input = this.state.elements.input as HTMLInputElement;
    if (input) input.type = isVisible ? 'text' : 'password';
  }
}

new PasswordStrength();
