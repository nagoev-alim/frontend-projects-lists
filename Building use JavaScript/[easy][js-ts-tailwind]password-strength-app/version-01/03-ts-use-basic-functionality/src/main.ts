import './style.css';
import { icons } from 'feather-icons';
import { passwordStrength } from 'check-password-strength';

/**
 * Приложение для проверки силы пароля.
 * Позволяет пользователю вводить пароль, отображает индикатор силы пароля
 * и предоставляет возможность переключения видимости пароля.
 */

/**
 * Конфигурация приложения
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
 * Конфигурация приложения
 */
const APP_CONFIG: Config = {
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
 * @typedef {Object} State
 * @property {Object} elements - Объект с элементами DOM
 */
interface State {
  elements: { [key: string]: HTMLElement | null };
}

/**
 * Состояние приложения
 */
const APP_STATE: State = {
  elements: Object.fromEntries(
    Object.keys(APP_CONFIG.selectors).map(key => [key, null]),
  ),
};

/**
 * Утилиты приложения
 * @typedef {Object} Utils
 * @property {Function} renderDataAttributes - Функция для рендеринга data-атрибутов
 */
interface Utils {
  renderDataAttributes: (element: string) => string;
}

/**
 * Утилиты приложения
 */
const APP_UTILS: Utils = {
  renderDataAttributes: (element) => element.slice(1, -1),
};

/**
 * Создает HTML-структуру приложения
 */
function createAppHTML(): void {
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
function initDOMElements(): void {
  APP_STATE.elements = Object.fromEntries(Object.entries(APP_CONFIG.selectors).map(([key, selector]) => [key, document.querySelector(selector)]));
}

/**
 * Инициализирует приложение
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();
  APP_STATE.elements.input?.addEventListener('input', handleInputChange);
  APP_STATE.elements.toggleVisibility?.addEventListener('click', handleToggleVisibilityClick);
}

/**
 * Обрабатывает изменение ввода пароля
 * @param {Event} event - Событие ввода
 */
function handleInputChange(event: Event): void {
  const target = event.target as HTMLInputElement;
  const isEmpty = target.value.length === 0;
  const { strengthIndicator, toggleVisibility, strengthMessage } = APP_STATE.elements;
  if (!strengthIndicator || !toggleVisibility || !strengthMessage) return;
  strengthIndicator?.classList.toggle('hidden', isEmpty);
  toggleVisibility?.classList.toggle('hidden', isEmpty);

  if (!isEmpty) {
    const { value: checkType } = passwordStrength(target.value);
    const lowercaseType = checkType.toLowerCase();
    strengthMessage.textContent = lowercaseType;
    strengthIndicator.className = `grid gap-2 ${lowercaseType.replace(' ', '-')}`;
  }
}

/**
 * Обрабатывает нажатие на кнопку видимости пароля
 * @param {Event} event - Событие клика
 */
function handleToggleVisibilityClick(event: Event): void {
  const target = event.target as HTMLButtonElement;
  const isVisible = target.classList.toggle('toggle');
  const iconType = isVisible ? 'eye-off' : 'eye';
  target.innerHTML = icons[iconType].toSvg();
  APP_STATE.elements.input!.type = isVisible ? 'text' : 'password';
}

initApp();
