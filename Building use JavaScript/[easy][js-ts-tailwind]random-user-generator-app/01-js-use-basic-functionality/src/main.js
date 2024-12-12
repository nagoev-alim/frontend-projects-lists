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
 * Конфигурация приложения
 * @type {Object}
 */
const APP_CONFIG = {
  /** @type {string} Селектор корневого элемента */
  root: '#app',
  /** @type {Object} Селекторы DOM-элементов */
  selectors: {
    userImage: '[data-user-image]',
    userInfoLabel: '[data-user-info-label]',
    userInfoValue: '[data-user-info-value]',
    userInfoType: '[data-user-info-type]',
    generateUser: '[data-generate-user]',
  },
  /** @type {Array} Массив иконок для типов информации пользователя */
  icons: [
    { name: 'name', src: icons.user.toSvg() },
    { name: 'email', src: icons['at-sign'].toSvg() },
    { name: 'age', src: icons.calendar.toSvg() },
    { name: 'street', src: icons.map.toSvg() },
    { name: 'phone', src: icons.phone.toSvg() },
    { name: 'password', src: icons.lock.toSvg() },
  ],
  /** @type {string} URL API для получения данных случайного пользователя */
  url: 'https://randomuser.me/api/',
};

/**
 * Состояние приложения
 * @type {Object}
 */
const APP_STATE = {
  /** @type {Object} Ссылки на DOM-элементы */
  elements: {
    userImage: null,
    userInfoLabel: null,
    userInfoValue: null,
    userInfoType: null,
    generateUser: null,
  },
  /** @type {Object} Данные пользователя */
  userData: {},
};

/**
 * Утилиты приложения
 * @type {Object}
 */
const APP_UTILS = {
  /**
   * Преобразует строку селектора в атрибут для data-атрибутов
   * @param {string} element - Строка селектора
   * @returns {string} Атрибут без квадратных скобок
   */
  renderDataAttributes: (element) => element.slice(1, -1),

  /**
   * Конфигурация для Toast уведомлений
   * @type {Object}
   */
  toastConfig: {
    className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
    duration: 3000,
    gravity: 'bottom',
    position: 'center',
  },

  /**
   * Показывает Toast уведомление
   * @param {string} message - Сообщение для отображения
   */
  showToast: (message) => {
    Toastify({
      text: message,
      ...APP_UTILS.toastConfig,
    }).showToast();
  },

  /**
   * Обрабатывает ошибку, показывая уведомление и логируя её
   * @param {string} message - Сообщение об ошибке
   * @param {Error} [error=null] - Объект ошибки (необязательный)
   */
  handleError: (message, error = null) => {
    APP_UTILS.showToast(message);
    if (error) console.error(message, error);
  },
};

/**
 * Создает HTML структуру приложения
 */
function createAppHTML() {
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
  const rootElement = document.querySelector(root);

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
function initDOMElements() {
  APP_STATE.elements = {
    userImage: document.querySelector(APP_CONFIG.selectors.userImage),
    userInfoLabel: document.querySelector(APP_CONFIG.selectors.userInfoLabel),
    userInfoValue: document.querySelector(APP_CONFIG.selectors.userInfoValue),
    userInfoType: document.querySelectorAll(APP_CONFIG.selectors.userInfoType),
    generateUser: document.querySelector(APP_CONFIG.selectors.generateUser),
  };
}

/**
 * Инициализирует приложение
 */
function initApp() {
  createAppHTML();
  initDOMElements();

  (async () => {
    await getUser();
    [...APP_STATE.elements.userInfoType].forEach((button) =>
      button.addEventListener('click', handleUserInfoTypeClick),
    );
    APP_STATE.elements.generateUser.addEventListener('click', getUser);
  })();
}

/**
 * Получает данные случайного пользователя с API
 */
async function getUser() {
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
    APP_UTILS.handleError('Failed to fetch user data.', error);
  }
}

/**
 * Обрабатывает клик по кнопке типа информации пользователя
 * @param {Event} event - Объект события клика
 */
function handleUserInfoTypeClick({ currentTarget }) {
  const type = currentTarget.dataset.userInfoType;
  APP_STATE.elements.userInfoLabel.textContent = `My ${type} is`;
  APP_STATE.elements.userInfoValue.textContent = APP_STATE.userData[type];
  APP_STATE.elements.userImage.src = APP_STATE.userData.image;
  APP_STATE.elements.userInfoType.forEach((button) => {
    button.classList.remove('bg-white');
    button.classList.toggle('bg-slate-200', button === currentTarget);
  });
}

/**
 * Обновляет UI с данными пользователя
 */
function renderUI() {
  APP_STATE.elements.userImage.src = APP_STATE.userData.image;
  APP_STATE.elements.userInfoLabel.textContent = `My ${Object.keys(APP_STATE.userData)[0]} is`;
  APP_STATE.elements.userInfoValue.textContent = APP_STATE.userData[Object.keys(APP_STATE.userData)[0]];
  APP_STATE.elements.userInfoType.forEach((button) => {
    button.classList.remove('bg-white');
    button.classList.toggle(
      'bg-slate-200',
      button === APP_STATE.elements.userInfoType[0],
    );
  });
}

initApp();
