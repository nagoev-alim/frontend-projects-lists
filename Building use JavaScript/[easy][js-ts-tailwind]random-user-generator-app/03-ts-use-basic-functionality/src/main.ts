/**
 * Этот код реализует генератор случайных пользователей. Он использует API randomuser.me
 * для получения данных о случайном пользователе, отображает эту информацию на веб-странице
 * и позволяет пользователю переключаться между различными типами информации (имя, email, возраст и т.д.).
 * Код также включает функциональность для обработки ошибок и отображения уведомлений.
 */

import './style.css';
import { icons } from 'feather-icons';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';

/**
 * Интерфейс для иконки
 * @typedef {Object} Icon
 * @property {string} name - Название иконки
 * @property {string} src - SVG-код иконки
 */
interface Icon {
  name: string;
  src: string;
}

/**
 * Интерфейс для конфигурации приложения
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента
 * @property {Object} selectors - Объект с селекторами элементов
 * @property {Icon[]} icons - Массив иконок
 * @property {string} url - URL API для получения данных пользователя
 */
interface AppConfig {
  root: string;
  selectors: {
    userImage: string;
    userInfoLabel: string;
    userInfoValue: string;
    userInfoType: string;
    generateUser: string;
  };
  icons: Icon[];
  url: string;
}

/**
 * Интерфейс для состояния приложения
 * @typedef {Object} AppState
 * @property {Object} elements - Объект с DOM-элементами
 * @property {Object} userData - Объект с данными пользователя
 */
interface AppState {
  elements: {
    userImage: HTMLImageElement | null;
    userInfoLabel: HTMLSpanElement | null;
    userInfoValue: HTMLSpanElement | null;
    userInfoType: NodeListOf<HTMLButtonElement> | null;
    generateUser: HTMLButtonElement | null;
  };
  userData: {
    [key: string]: string | number;
  };
}

/**
 * Интерфейс для утилит приложения
 * @typedef {Object} AppUtils
 * @property {Function} renderDataAttributes - Функция для рендеринга data-атрибутов
 * @property {Object} toastConfig - Конфигурация для уведомлений
 * @property {Function} showToast - Функция для показа уведомлений
 * @property {Function} handleError - Функция для обработки ошибок
 */
interface AppUtils {
  renderDataAttributes: (element: string) => string;
  toastConfig: Toastify.Options;
  showToast: (message: string) => void;
  handleError: (message: string, error?: Error | null) => void;
}

/**
 * Конфигурация приложения
 * @type {AppConfig}
 */
const APP_CONFIG: AppConfig = {
  root: '#app',
  selectors: {
    userImage: '[data-user-image]',
    userInfoLabel: '[data-user-info-label]',
    userInfoValue: '[data-user-info-value]',
    userInfoType: '[data-user-info-type]',
    generateUser: '[data-generate-user]',
  },
  icons: [
    { name: 'name', src: icons.user.toSvg() },
    { name: 'email', src: icons['at-sign'].toSvg() },
    { name: 'age', src: icons.calendar.toSvg() },
    { name: 'street', src: icons.map.toSvg() },
    { name: 'phone', src: icons.phone.toSvg() },
    { name: 'password', src: icons.lock.toSvg() },
  ],
  url: 'https://randomuser.me/api/',
};

/**
 * Состояние приложения
 * @type {AppState}
 */
const APP_STATE: AppState = {
  elements: {
    userImage: null,
    userInfoLabel: null,
    userInfoValue: null,
    userInfoType: null,
    generateUser: null,
  },
  userData: {},
};

/**
 * Утилиты приложения
 * @type {AppUtils}
 */
const APP_UTILS: AppUtils = {
  /**
   * Обрабатывает строку для использования в качестве data-атрибута
   * @param {string} element - Строка с названием data-атрибута
   * @returns {string} Обработанная строка без квадратных скобок
   */
  renderDataAttributes: (element: string): string => element.slice(1, -1),

  /**
   * Конфигурация для уведомлений Toastify
   * @type {Toastify.Options}
   */
  toastConfig: {
    className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
    duration: 3000,
    gravity: 'bottom',
    position: 'center',
  },

  /**
   * Показывает уведомление с заданным сообщением
   * @param {string} message - Текст уведомления
   */
  showToast: (message: string): void => {
    Toastify({
      text: message,
      ...APP_UTILS.toastConfig,
    }).showToast();
  },

  /**
   * Обрабатывает ошибку: показывает уведомление и выводит ошибку в консоль
   * @param {string} message - Сообщение об ошибке
   * @param {Error | null} [error=null] - Объект ошибки (необязательный)
   */
  handleError: (message: string, error: Error | null = null): void => {
    APP_UTILS.showToast(message);
    if (error) console.error(message, error);
  },
};

/**
 * Создает HTML структуру приложения
 */
function createAppHTML(): void {
  const {
    root,
    selectors: {
      userImage,
      userInfoLabel,
      userInfoValue,
      userInfoType,
      generateUser,
    },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector<HTMLDivElement>(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='grid w-full max-w-md gap-4 rounded border bg-white p-3 shadow'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>Random User Generator</h1>
      <img class='mx-auto h-[132px] w-[132px] rounded-full border-2 border-black' src='#' alt='User' ${renderDataAttributes(userImage)}>
      <p class='flex flex-wrap justify-center gap-1'>
        <span ${renderDataAttributes(userInfoLabel)}></span>
        <span class='break-all font-medium' ${renderDataAttributes(userInfoValue)}></span>
      </p>
      <ul class='flex flex-wrap items-center justify-center gap-2'>
        ${APP_CONFIG.icons.map(
    ({ name, src }) => `
          <li>
            <button class='border bg-white px-3 py-3 hover:bg-slate-300 transition-colors' ${renderDataAttributes(userInfoType)}='${name}'>
              <span class='pointer-events-none'>${src}</span>
            </button>
          </li>
        `,
  ).join('')}
      </ul>
      <button class='border px-3 py-2.5 hover:bg-slate-50' ${renderDataAttributes(generateUser)}>Generate</button>
    </div>
  `;
}

/**
 * Инициализирует DOM-элементы
 */
function initDOMElements(): void {
  APP_STATE.elements = {
    userImage: document.querySelector<HTMLImageElement>(APP_CONFIG.selectors.userImage),
    userInfoLabel: document.querySelector<HTMLSpanElement>(APP_CONFIG.selectors.userInfoLabel),
    userInfoValue: document.querySelector<HTMLSpanElement>(APP_CONFIG.selectors.userInfoValue),
    userInfoType: document.querySelectorAll<HTMLButtonElement>(APP_CONFIG.selectors.userInfoType),
    generateUser: document.querySelector<HTMLButtonElement>(APP_CONFIG.selectors.generateUser),
  };
}

/**
 * Инициализирует приложение
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();

  (async () => {
    await getUser();
    APP_STATE.elements.userInfoType?.forEach((button) =>
      button.addEventListener('click', handleUserInfoTypeClick),
    );
    APP_STATE.elements.generateUser?.addEventListener('click', getUser);
  })();
}

/**
 * Получает данные случайного пользователя с API
 */
async function getUser(): Promise<void> {
  try {
    const {
      data: {
        results: [user],
      },
    } = await axios.get(APP_CONFIG.url);
    APP_STATE.userData = {
      phone: user.phone,
      email: user.email,
      image: user.picture.large,
      street: `${user.location.street.number} ${user.location.street.name}`,
      password: user.login.password,
      name: `${user.name.first} ${user.name.last}`,
      age: user.dob.age,
    };
    renderUI();
  } catch (error) {
    APP_UTILS.handleError('Failed to fetch user data.', error as Error);
  }
}

/**
 * Обрабатывает клик по кнопке типа информации пользователя
 * @param {MouseEvent} event - Объект события клика
 */
function handleUserInfoTypeClick(event: MouseEvent): void {
  const currentTarget = event.currentTarget as HTMLButtonElement;
  const type = currentTarget.dataset.userInfoType as string;
  if (APP_STATE.elements.userInfoLabel) {
    APP_STATE.elements.userInfoLabel.textContent = `My ${type} is`;
  }
  if (APP_STATE.elements.userInfoValue) {
    APP_STATE.elements.userInfoValue.textContent = APP_STATE.userData[type].toString();
  }
  if (APP_STATE.elements.userImage) {
    APP_STATE.elements.userImage.src = APP_STATE.userData.image as string;
  }
  APP_STATE.elements.userInfoType?.forEach((button) => {
    button.classList.remove('bg-white');
    button.classList.toggle('bg-slate-200', button === currentTarget);
  });
}

/**
 * Обновляет UI с данными пользователя
 */
function renderUI(): void {
  if (APP_STATE.elements.userImage) {
    APP_STATE.elements.userImage.src = APP_STATE.userData.image as string;
  }
  if (APP_STATE.elements.userInfoLabel) {
    APP_STATE.elements.userInfoLabel.textContent = `My ${Object.keys(APP_STATE.userData)[0]} is`;
  }
  if (APP_STATE.elements.userInfoValue) {
    APP_STATE.elements.userInfoValue.textContent = APP_STATE.userData[Object.keys(APP_STATE.userData)[0]].toString();
  }
  APP_STATE.elements.userInfoType?.forEach((button, index) => {
    button.classList.remove('bg-white');
    button.classList.toggle('bg-slate-200', index === 0);
  });
}

initApp();
