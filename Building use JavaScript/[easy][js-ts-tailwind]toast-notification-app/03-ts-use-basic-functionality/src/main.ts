import './style.css';
import { icons } from 'feather-icons';

/**
 * Этот код реализует систему уведомлений (тостов) с различными типами (успех, ошибка, предупреждение, информация).
 * Пользователь может создавать уведомления, нажимая на соответствующие кнопки.
 * Уведомления автоматически исчезают через заданное время или могут быть закрыты пользователем.
 */

/**
 * Интерфейс для конфигурации приложения
 */
interface Config {
  root: string;
  selectors: {
    [key: string]: string
  };
  types: {
    [key: string]: {
      icon: string;
      text: string;
      color: string;
    };
  };
  time: number;
}

/**
 * Интерфейс для состояния приложения
 */
interface State {
  elements: {
    notificationList: HTMLElement | null;
    notificationButtons: HTMLElement[] | null;
  };
}

/**
 * Конфигурация приложения
 */
const APP_CONFIG: Config = {
  root: '#app',
  selectors: {
    notificationList: '[data-notification-list]',
    notificationType: '[data-notification-type]',
  },
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
  time: 5000,
};

/**
 * Состояние приложения
 */
const APP_STATE: State = {
  elements: {
    notificationList: null,
    notificationButtons: null,
  },
};

/**
 * Утилитарные функции
 */
const APP_UTILS = {
  /**
   * Преобразует строку атрибута в формат для data-атрибута
   * @param {string} element - Строка атрибута
   * @returns {string} Форматированная строка для data-атрибута
   */
  renderDataAttributes: (element: string): string => element.slice(1, -1),
};

/**
 * Создает HTML структуру приложения
 */
function createAppHTML(): void {
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
 * Инициализирует DOM элементы
 */
function initDOMElements(): void {
  APP_STATE.elements = {
    notificationList: document.querySelector(APP_CONFIG.selectors.notificationList),
    notificationButtons: Array.from(document.querySelectorAll(APP_CONFIG.selectors.notificationType)),
  };
}

/**
 * Инициализирует приложение
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();
  APP_STATE.elements.notificationButtons?.forEach((button) => button.addEventListener('click', handleButtonClick));
}

/**
 * Создает элемент уведомления
 * @param {string} type - Тип уведомления
 * @returns {HTMLLIElement} Элемент уведомления
 */
function createToastElement(type: string): HTMLLIElement {
  const { icon, text, color } = APP_CONFIG.types[type];
  const toast = document.createElement('li');
  toast.className = `flex toast ${type}`;
  toast.innerHTML = `
    <div style="color:${color}">${icons[icon as keyof typeof icons].toSvg()}</div>
    <span class="flex-grow">${text}</span>
    <button data-toast-delete>${icons.x.toSvg()}</button>`;
  return toast;
}

/**
 * Обработчик клика по кнопке создания уведомления
 * @param {Event} event - Событие клика
 */
function handleButtonClick(event: Event): void {
  const target = event.target as HTMLElement;
  const { notificationType: type } = target.dataset;
  if (!type) return;

  const toast = createToastElement(type) as HTMLLIElement & { timeoutId?: number };

  APP_STATE.elements.notificationList?.appendChild(toast);

  toast.querySelector('[data-toast-delete]')?.addEventListener('click', () => removeToast(toast));

  toast.timeoutId = setTimeout(() => removeToast(toast), APP_CONFIG.time);
}

/**
 * Удаляет уведомление
 * @param {HTMLLIElement & { timeoutId?: number }} toast - Элемент уведомления
 */
function removeToast(toast: HTMLLIElement & { timeoutId?: number }): void {
  toast.classList.add('hide');
  if (toast.timeoutId) {
    clearTimeout(toast.timeoutId);
  }
  setTimeout(() => toast.remove(), 500);
}

initApp();
