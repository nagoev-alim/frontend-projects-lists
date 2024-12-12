import './style.css';
import { icons } from 'feather-icons';
import { passwordStrength } from 'check-password-strength';

/**
 * @fileoverview Класс PasswordStrength реализует функционал проверки силы пароля.
 * Он создает интерфейс с полем ввода пароля, индикатором силы и возможностью
 * переключения видимости пароля. Использует библиотеки feather-icons для иконок
 * и check-password-strength для оценки силы пароля.
 */

class PasswordStrength {
  /**
   * Создает экземпляр PasswordStrength.
   * Инициализирует конфигурацию, состояние и утилиты.
   */
  constructor() {
    /**
     * @type {Object} Конфигурация компонента
     */
    this.config = {
      root: '#app',
      selectors: {
        input: '[data-password-input]',
        toggleVisibility: '[data-password-toggle]',
        strengthIndicator: '[data-password-strength]',
        strengthMessage: '[data-password-message]',
      },
    };

    /**
     * @type {Object} Состояние компонента
     */
    this.state = {
      elements: {
        input: null,
        toggleVisibility: null,
        strengthIndicator: null,
        strengthMessage: null,
      },
    };

    /**
     * @type {Object} Утилиты
     */
    this.utils = {
      renderDataAttributes: (element) => element.slice(1, -1),
    };

    this.init();
  }

  /**
   * Создает HTML структуру приложения
   */
  createAppHTML() {
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
    <div class='grid gap-4 max-w-md w-full rounded border bg-white p-3 shadow'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>Password Strength Check</h1>
      <div class='relative'>
        <input class='w-full rounded border bg-slate-50 px-3 py-2 pr-9 focus:border-blue-400 focus:outline-none' type='password' ${renderDataAttributes(input)} placeholder='Type password'>
        <button class='absolute right-1 top-1/2 hidden -translate-y-1/2' ${renderDataAttributes(toggleVisibility)}>
          ${icons.eye.toSvg()}
        </button>
      </div>
      <div class='hidden grid gap-2' ${renderDataAttributes(strengthIndicator)}>
        <ul class='grid grid-cols-4 gap-2'>
          ${Array.from({ length: 4 })
      .map(() => `<li class='h-2 border-2'></li>`)
      .join('')}
        </ul>
        <p class='text-center'>Your password is <span class='font-bold' ${renderDataAttributes(strengthMessage)}></span></p>
      </div>
    </div>
  `;
  }

  /**
   * Инициализирует DOM элементы
   */
  initDOMElements() {
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
  init() {
    this.createAppHTML();
    this.initDOMElements();
    this.state.elements.input.addEventListener('input', this.handleInputChange.bind(this));
    this.state.elements.toggleVisibility.addEventListener('click', this.handleToggleVisibilityClick.bind(this));
  }

  /**
   * Обрабатывает изменение ввода пароля
   * @param {Event} event - Событие изменения ввода
   */
  handleInputChange({ target }) {
    const isEmpty = target.value.length === 0;
    const { strengthIndicator, toggleVisibility, strengthMessage } = this.state.elements;

    strengthIndicator.classList.toggle('hidden', isEmpty);
    toggleVisibility.classList.toggle('hidden', isEmpty);

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
  handleToggleVisibilityClick({ target }) {
    const isVisible = target.classList.toggle('toggle');
    const iconType = isVisible ? 'eye-off' : 'eye';
    target.innerHTML = icons[iconType].toSvg();
    this.state.elements.input.type = isVisible ? 'text' : 'password';
  }
}

new PasswordStrength();
