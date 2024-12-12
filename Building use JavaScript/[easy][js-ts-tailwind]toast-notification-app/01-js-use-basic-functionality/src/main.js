import './style.css';
import { icons } from 'feather-icons';

/**
 * Этот модуль реализует функциональность всплывающих уведомлений (тостов).
 * Он позволяет создавать уведомления различных типов (успех, ошибка, предупреждение, информация),
 * которые автоматически исчезают через заданное время или могут быть закрыты пользователем вручную.
 */

/**
 * Конфигурация приложения
 * @type {Object}
 */
const APP_CONFIG = {
  /** Корневой элемент приложения */
  root: '#app',
  /** Селекторы для DOM-элементов */
  selectors: {
    notificationList: '[data-notification-list]',
    notificationType: '[data-notification-type]',
  },
  /** Типы уведомлений и их параметры */
  types: {
    success: {
      icon: 'check-circle',
      text: 'Success: This is a success toast.',
      color: 'rgb(10, 191, 48)',
    },
    error: {
      icon: 'x-circle',
      text: 'Error: This is an error toast.',
      color: 'rgb(226, 77, 76)',
    },
    warning: {
      icon: 'alert-triangle',
      text: 'Warning: This is a warning toast.',
      color: 'rgb(233, 189, 12)',
    },
    info: {
      icon: 'alert-circle',
      text: 'Info: This is an information toast.',
      color: 'rgb(52, 152, 219)',
    },
  },
  /** Время отображения уведомления в миллисекундах */
  time: 5000,
};

/**
 * Состояние приложения
 * @type {Object}
 */
const APP_STATE = {
  elements: {
    notificationList: null,
    notificationType: null,
  },
};

/**
 * Утилиты приложения
 * @type {Object}
 */
const APP_UTILS = {
  /**
   * Преобразует строку селектора в атрибут данных
   * @param {string} element - Строка селектора
   * @returns {string} Строка атрибута данных
   */
  renderDataAttributes: (element) => element.slice(1, -1),
};

/**
 * Создает HTML-разметку приложения
 */
function createAppHTML() {
  const {
    root,
    selectors: { notificationList, notificationType },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='t-notifications border bg-white gap-4 grid max-w-md p-3 rounded shadow w-full'>
      <h1 class='font-bold md:text-4xl text-2xl text-center'>Toast Notification</h1>
      <ul ${renderDataAttributes(notificationList)}></ul>
      <div class='flex justify-center t-notifications__buttons'>
        <button class='bg-green-500 hover:bg-green-400 px-3 py-2 text-white' ${renderDataAttributes(notificationType)}='success'>Success</button>
        <button class='bg-red-500 hover:bg-red-400 px-3 py-2 text-white' ${renderDataAttributes(notificationType)}='error'>Error</button>
        <button class='bg-orange-500 hover:bg-orange-400 px-3 py-2 text-white' ${renderDataAttributes(notificationType)}='warning'>Warning</button>
        <button class='bg-blue-500 hover:bg-blue-400 px-3 py-2 text-white' ${renderDataAttributes(notificationType)}='info'>Info</button>
      </div>
    </div>
  `;
}

/**
 * Инициализирует DOM-элементы
 */
function initDOMElements() {
  APP_STATE.elements = {
    notificationList: document.querySelector(APP_CONFIG.selectors.notificationList),
    notificationButtons: document.querySelectorAll(APP_CONFIG.selectors.notificationType),
  };
}

/**
 * Инициализирует приложение
 */
function initApp() {
  createAppHTML();
  initDOMElements();
  APP_STATE.elements.notificationButtons.forEach((button) => button.addEventListener('click', handleButtonClick));
}

/**
 * Создает элемент уведомления
 * @param {string} type - Тип уведомления
 * @returns {HTMLElement} Элемент уведомления
 */
function createToastElement(type) {
  const { icon, text, color } = APP_CONFIG.types[type];
  const toast = document.createElement('li');
  toast.className = `flex toast ${type}`;
  toast.innerHTML = `
    <div style="color:${color}">${icons[icon].toSvg()}</div>
    <span class="flex-grow">${text}</span>
    <button data-toast-delete>${icons.x.toSvg()}</button>`;
  return toast;
}

/**
 * Обработчик клика по кнопке создания уведомления
 * @param {Event} event - Объект события
 */
function handleButtonClick({ target }) {
  const { notificationType: type } = target.dataset;
  if (!type) return;

  const toast = createToastElement(type);
  APP_STATE.elements.notificationList.appendChild(toast);

  toast.querySelector('[data-toast-delete]').addEventListener('click', () => removeToast(toast));

  toast.timeoutId = setTimeout(() => removeToast(toast), APP_CONFIG.time);
}

/**
 * Удаляет уведомление
 * @param {HTMLElement} toast - Элемент уведомления
 */
function removeToast(toast) {
  toast.classList.add('hide');
  clearTimeout(toast.timeoutId);
  setTimeout(() => toast.remove(), 500);
}

// Инициализация приложения
initApp();
