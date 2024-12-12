import './style.css';
import { icons } from 'feather-icons';
import 'toastify-js/src/toastify.css';

/**
 * Этот код представляет собой приложение для проверки силы пароля.
 * Он включает в себя функциональность ввода пароля, отображения его силы
 * и возможность переключения видимости пароля.
 */

/**
 * Интерфейс для конфигурации приложения
 * @interface
 */
interface Config {
  root: string;
  selectors: {
    [key: string]: string;
  };
  toggleVisibilityIcons: {
    [key: string]: string;
  };
  regExp: {
    [key: string]: RegExp;
  };
}

/**
 * Конфигурация приложения
 * @type {Config}
 */
const APP_CONFIG: Config = {
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

/**
 * Интерфейс для состояния приложения
 * @interface
 */
interface State {
  elements: { [key: string]: HTMLElement | null };
  timeout: number | null;
}

/**
 * Состояние приложения
 * @type {State}
 */
const APP_STATE: State = {
  elements: Object.fromEntries(
    Object.keys(APP_CONFIG.selectors).map(key => [key, null]),
  ),
  timeout: null,
};

/**
 * Интерфейс для утилит приложения
 * @interface
 */
interface Utils {
  renderDataAttributes: (element: string) => string;
}

/**
 * Утилиты приложения
 * @type {Utils}
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
function initDOMElements(): void {
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
function initApp(): void {
  createAppHTML();
  initDOMElements();
  APP_STATE.elements.input?.addEventListener('input', handleInputChange);
  APP_STATE.elements.toggleVisibility?.addEventListener('click', handleToggleVisibilityClick);
}

/**
 * Проверяет силу пароля
 * @param {string} value - Значение пароля
 */
function strengthChecker(value: string): void {
  const strengths = ['too-weak', 'medium', 'strong'];
  const strengthIndex = APP_CONFIG.regExp.strong.test(value) ? 2 : APP_CONFIG.regExp.medium.test(value) ? 1 : 0;
  const strength = strengths[strengthIndex];

  APP_STATE.elements.strengthMessage!.textContent = strength;
  APP_STATE.elements.strengthIndicator!.className = strength;
}

/**
 * Обрабатывает изменение ввода пароля
 * @param {Event} event - Событие изменения ввода
 */
function handleInputChange(event: Event): void {
  const value = (event.target as HTMLInputElement).value;
  const trimmedValue = value.trim();
  const isValueEmpty = trimmedValue.length === 0;

  toggleElementsVisibility(isValueEmpty);
  if (APP_STATE.timeout) {
    clearTimeout(APP_STATE.timeout);
  }

  APP_STATE.timeout = setTimeout(() => {
    if (!isValueEmpty) {
      strengthChecker(trimmedValue);
    }
  }, 500) as unknown as number | null;
}

/**
 * Переключает видимость элементов
 * @param {boolean} isHidden - Флаг скрытия элементов
 */
function toggleElementsVisibility(isHidden: boolean): void {
  [APP_STATE.elements.toggleVisibility, APP_STATE.elements.strengthIndicator].forEach(element => {
    element?.classList.toggle('hidden', isHidden);
  });
}

/**
 * Обрабатывает клик по кнопке переключения видимости пароля
 * @param {Event} event - Событие клика
 */
function handleToggleVisibilityClick(event: Event): void {
  const currentTarget = event.target as HTMLButtonElement;
  const isPasswordVisible = currentTarget.classList.toggle('toggle');
  updatePasswordVisibility(currentTarget, isPasswordVisible);
}

/**
 * Обновляет видимость пароля
 * @param {HTMLButtonElement} button - Кнопка переключения видимости
 * @param {boolean} isVisible - Флаг видимости пароля
 */
function updatePasswordVisibility(button: HTMLButtonElement, isVisible: boolean): void {
  // @ts-ignore
  button.innerHTML = APP_CONFIG.toggleVisibilityIcons[isVisible];
  // @ts-ignore
  APP_STATE.elements.input!.type = isVisible ? 'text' : 'password';
}

initApp();
