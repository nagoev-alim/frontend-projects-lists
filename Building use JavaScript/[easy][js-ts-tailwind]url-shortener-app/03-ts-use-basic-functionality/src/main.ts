/**
 * URL Shortener Application
 * 
 * Это приложение предоставляет функциональность для сокращения URL-адресов.
 * Оно использует API TinyURL для создания коротких ссылок и позволяет
 * пользователям копировать сокращенные URL в буфер обмена.
 * 
 * Основные функции:
 * - Создание сокращенных URL
 * - Копирование сокращенных URL в буфер обмена
 * - Отображение уведомлений пользователю
 * - Обработка ошибок
 */

import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios, { AxiosResponse } from 'axios';
import { icons } from 'feather-icons';

/**
 * Интерфейс конфигурации приложения
 * @interface
 */
interface AppConfig {
  /** Селектор корневого элемента */
  root: string;
  /** Селекторы элементов DOM */
  selectors: {
    container: string;
    form: string;
    shortenedUrl: string;
    copyButton: string;
  };
  /** Настройки API */
  api: {
    endpoint: string;
    key: string;
  };
}

/**
 * Интерфейс состояния приложения
 * @interface
 */
interface AppState {
  /** Элементы DOM */
  elements: {
    container: HTMLElement | null;
    form: HTMLFormElement | null;
    shortenedUrl: HTMLInputElement | null;
    copyButton: HTMLButtonElement | null;
    formButton: HTMLButtonElement | null;
  };
}

/**
 * Интерфейс утилит приложения
 * @interface
 */
interface AppUtils {
  /** Функция для рендеринга data-атрибутов */
  renderDataAttributes: (element: string) => string;
  /** Конфигурация для уведомлений */
  toastConfig: {
    className: string;
    duration: number;
    gravity: string;
    position: string;
  };
  /** Функция для отображения уведомлений */
  showToast: (message: string) => void;
  /** Функция для обработки ошибок */
  handleError: (message: string, error?: Error | null) => void;
}

/**
 * Конфигурация приложения
 */
const APP_CONFIG: AppConfig = {
  root: '#app',
  selectors: {
    container: '[data-shortener-container]',
    form: '[data-shortener-form]',
    shortenedUrl: '[data-shortened-url]',
    copyButton: '[data-copy-button]',
  },
  api: {
    endpoint: 'https://api.tinyurl.com/create',
    key: 'Wl2gadYaQ1kxXvyrscpipz5ThB6rg5euC0FGoPH1L5IqkLrnxALD7D0N7Hef',
  },
};

/**
 * Состояние приложения
 */
const APP_STATE: AppState = {
  elements: {
    container: null,
    form: null,
    shortenedUrl: null,
    copyButton: null,
    formButton: null,
  },
};

/**
 * Утилиты приложения
 */
const APP_UTILS: AppUtils = {
  renderDataAttributes: (element: string) => element.slice(1, -1),
  toastConfig: {
    className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
    duration: 3000,
    gravity: 'bottom',
    position: 'center',
  },
  showToast: (message: string) => {
    // @ts-ignore
    Toastify({
      text: message,
      ...APP_UTILS.toastConfig,
    }).showToast();
  },
  handleError: (message: string, error: Error | null = null) => {
    APP_UTILS.showToast(message);
    if (error) console.error(message, error);
  },
};

/**
 * Создает HTML-структуру приложения
 * @returns {void}
 */
function createAppHTML(): void {
  const {
    root,
    selectors: { container, form, shortenedUrl, copyButton },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='max-h-[175px] max-w-md w-full overflow-hidden rounded border bg-white p-3 shadow transition-all grid gap-4' ${renderDataAttributes(container)}>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>URL Shortener</h1>
      <form class='grid gap-2' ${renderDataAttributes(form)}>
        <input 
          class='w-full rounded border bg-slate-50 px-3 py-2 focus:border-blue-400 focus:outline-none' 
          type='text' 
          name='url' 
          placeholder='Paste a link to shorten it'
        >
        <button class='border px-3 py-2 hover:bg-slate-50' type='submit'>Submit</button>
      </form>
      <div class='result grid grid-cols-[1fr_60px] gap-1.5'>
        <input 
          class='w-full rounded border bg-slate-50 px-3 py-2 text-gray-600 focus:border-blue-400 focus:outline-none' 
          disabled 
          type='text' 
          ${renderDataAttributes(shortenedUrl)}
        >
        <button class='border px-3 py-2 hover:bg-slate-50 flex justify-center' ${renderDataAttributes(copyButton)}>${icons.clipboard.toSvg()}</button>
      </div>
    </div>
  `;
}

/**
 * Инициализирует элементы DOM
 * @returns {void}
 */
function initDOMElements(): void {
  APP_STATE.elements = {
    container: document.querySelector(APP_CONFIG.selectors.container),
    copyButton: document.querySelector(APP_CONFIG.selectors.copyButton),
    form: document.querySelector(APP_CONFIG.selectors.form),
    formButton: document.querySelector(`${APP_CONFIG.selectors.form} button[type="submit"]`),
    shortenedUrl: document.querySelector(APP_CONFIG.selectors.shortenedUrl),
  };
}

/**
 * Инициализирует приложение
 * @returns {void}
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();
  APP_STATE.elements.form?.addEventListener('submit', handleFormSubmit);
  APP_STATE.elements.copyButton?.addEventListener('click', handleCopyButtonClick);
}

/**
 * Обрабатывает отправку формы
 * @param {Event} event - Событие отправки формы
 * @returns {Promise<void>}
 */
async function handleFormSubmit(event: Event): Promise<void> {
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  const url = (form.elements.namedItem('url') as HTMLInputElement).value.trim();

  if (!isValidUrl(url)) {
    APP_UTILS.showToast('Please enter the correct URL.');
    return;
  }

  try {
    setLoadingState(true);
    const shortenedUrl = await shortenUrl(url);
    updateUI(shortenedUrl);
  } catch (error) {
    APP_UTILS.handleError('Failed to shorten the URL.', error as Error);
  } finally {
    setLoadingState(false);
  }
}

/**
 * Проверяет, является ли строка допустимым URL
 * @param {string} url - URL для проверки
 * @returns {boolean} - Результат проверки
 */
function isValidUrl(url: string): boolean {
  const urlPattern =
    /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;
  return urlPattern.test(url);
}

/**
 * Интерфейс ответа API TinyURL
 * @interface
 */
interface TinyUrlResponse {
  data: {
    tiny_url: string;
  };
  errors?: string[];
}

/**
 * Отправляет запрос на сокращение URL
 * @param {string} url - URL для сокращения
 * @returns {Promise<string>} - Сокращенный URL
 * @throws {Error} - Ошибка при выполнении запроса или обработке ответа
 */
async function shortenUrl(url: string): Promise<string> {
  const response: AxiosResponse<TinyUrlResponse> = await axios.post(
    APP_CONFIG.api.endpoint,
    { url },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${APP_CONFIG.api.key}`,
      },
    },
  );

  const { data: { tiny_url }, errors } = response.data;

  if (errors && errors.length > 0) {
    throw new Error(errors[0]);
  }

  return tiny_url;
}

/**
 * Устанавливает состояние загрузки
 * @param {boolean} isLoading - Флаг загрузки
 * @returns {void}
 */
function setLoadingState(isLoading: boolean): void {
  if (APP_STATE.elements.formButton) {
    APP_STATE.elements.formButton.textContent = isLoading ? 'Loading...' : 'Submit';
  }
}

/**
 * Обновляет UI после получения сокращенного URL
 * @param {string} shortenedUrl - Сокращенный URL
 * @returns {void}
 */
function updateUI(shortenedUrl: string): void {
  if (APP_STATE.elements.shortenedUrl) {
    APP_STATE.elements.shortenedUrl.value = shortenedUrl;
  }
  APP_STATE.elements.container?.classList.add('max-h-[235px]');
}

/**
 * Обрабатывает клик по кнопке копирования
 * @returns {Promise<void>}
 */
async function handleCopyButtonClick(): Promise<void> {
  const url = APP_STATE.elements.shortenedUrl?.value.trim() ?? '';
  if (url.length === 0) return;

  try {
    await navigator.clipboard.writeText(url);
    APP_UTILS.showToast('URL copied to clipboard');
  } catch (error) {
    APP_UTILS.handleError('Failed to copy URL', error as Error);
  }
}

initApp();
