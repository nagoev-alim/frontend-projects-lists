import './style.css';
import { icons } from 'feather-icons';
import { passwordStrength } from 'check-password-strength';

/**
 * Приложение для проверки силы пароля
 *
 * Этот код создает интерфейс для ввода пароля, отображает его силу
 * и позволяет переключать видимость пароля. Он использует библиотеки
 * feather-icons для иконок и check-password-strength для оценки силы пароля.
 */

/**
 * Конфигурация приложения
 * @type {Object}
 */
const APP_CONFIG = {
  root: '#app',
  selectors: {
    input: '[data-password-input]',
    toggleVisibility: '[data-password-toggle]',
    strengthIndicator: '[data-password-strength]',
    strengthMessage: '[data-password-message]',
  },
};

/**
 * Состояние приложения
 * @type {Object}
 */
const APP_STATE = {
  elements: {
    input: null,
    toggleVisibility: null,
    strengthIndicator: null,
    strengthMessage: null,
  },
};

/**
 * Утилиты приложения
 * @type {Object}
 */
const APP_UTILS = {
  /**
   * Преобразует строку атрибута в строку для data-атрибута
   * @param {string} element - Строка атрибута
   * @returns {string} Строка для data-атрибута
   */
  renderDataAttributes: (element) => element.slice(1, -1),
};

/**
 * Создает HTML структуру приложения
 */
function createAppHTML() {
  const {
    root,
    selectors: {
      input,
      toggleVisibility,
      strengthIndicator,
      strengthMessage,
    },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
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
 * Инициализирует элементы DOM
 */
function initDOMElements() {
  APP_STATE.elements = {
    input: document.querySelector(APP_CONFIG.selectors.input),
    toggleVisibility: document.querySelector(APP_CONFIG.selectors.toggleVisibility),
    strengthIndicator: document.querySelector(APP_CONFIG.selectors.strengthIndicator),
    strengthMessage: document.querySelector(APP_CONFIG.selectors.strengthMessage),
  };
}

/**
 * Инициализирует приложение
 */
function initApp() {
  createAppHTML();
  initDOMElements();
  APP_STATE.elements.input.addEventListener('input', handleInputChange);
  APP_STATE.elements.toggleVisibility.addEventListener('click', handleToggleVisibilityClick);
}

/**
 * Обрабатывает изменение ввода пароля
 * @param {Event} event - Событие ввода
 */
function handleInputChange({ target }) {
  const isEmpty = target.value.length === 0;
  const { strengthIndicator, toggleVisibility, strengthMessage } = APP_STATE.elements;

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
function handleToggleVisibilityClick({ target }) {
  const isVisible = target.classList.toggle('toggle');
  const iconType = isVisible ? 'eye-off' : 'eye';
  target.innerHTML = icons[iconType].toSvg();
  APP_STATE.elements.input.type = isVisible ? 'text' : 'password';
}

initApp();
