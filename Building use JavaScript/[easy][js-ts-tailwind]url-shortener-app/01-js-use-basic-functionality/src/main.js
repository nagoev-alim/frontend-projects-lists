import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';
import { icons } from 'feather-icons';

/**
 * Описание функциональности кода:
 * Данный код реализует веб-приложение для сокращения URL-адресов.
 * Пользователь может ввести длинный URL, приложение отправляет запрос
 * к API TinyURL для получения короткой версии ссылки. Затем пользователь
 * может скопировать сокращенный URL в буфер обмена.
 */

/**
 * Конфигурация приложения
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента
 * @property {Object} selectors - Селекторы элементов DOM
 * @property {Object} api - Настройки API
 */
const APP_CONFIG = {
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
 * @typedef {Object} AppState
 * @property {Object} elements - Элементы DOM
 */
const APP_STATE = {
  elements: {
    container: null,
    form: null,
    shortenedUrl: null,
    copyButton: null,
  },
};

/**
 * Утилиты приложения
 * @typedef {Object} AppUtils
 * @property {Function} renderDataAttributes - Функция для рендеринга data-атрибутов
 * @property {Object} toastConfig - Конфигурация для уведомлений
 * @property {Function} showToast - Функция для отображения уведомлений
 * @property {Function} handleError - Функция для обработки ошибок
 */
const APP_UTILS = {
  renderDataAttributes: (element) => element.slice(1, -1),
  toastConfig: {
    className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
    duration: 3000,
    gravity: 'bottom',
    position: 'center',
  },
  showToast: (message) => {
    Toastify({
      text: message,
      ...APP_UTILS.toastConfig,
    }).showToast();
  },
  handleError: (message, error = null) => {
    APP_UTILS.showToast(message);
    if (error) console.error(message, error);
  },
};

/**
 * Создает HTML-структуру приложения
 */
function createAppHTML() {
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
 */
function initDOMElements() {
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
 */
function initApp() {
  createAppHTML();
  initDOMElements();
  APP_STATE.elements.form.addEventListener('submit', handleFormSubmit);
  APP_STATE.elements.copyButton.addEventListener('click', handleCopyButtonClick);
}

/**
 * Обрабатывает отправку формы
 * @param {Event} event - Событие отправки формы
 */
async function handleFormSubmit(event) {
  event.preventDefault();
  const url = event.target.elements.url.value.trim();

  if (!isValidUrl(url)) {
    APP_UTILS.showToast('Please enter the correct URL.');
    return;
  }

  try {
    setLoadingState(true);
    const shortenedUrl = await shortenUrl(url);
    updateUI(shortenedUrl);
  } catch (error) {
    APP_UTILS.handleError('Failed to shorten the URL.', error);
  } finally {
    setLoadingState(false);
  }
}

/**
 * Проверяет, является ли строка допустимым URL
 * @param {string} url - URL для проверки
 * @returns {boolean} - Результат проверки
 */
function isValidUrl(url) {
  const urlPattern =
    /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;
  return urlPattern.test(url);
}

/**
 * Отправляет запрос на сокращение URL
 * @param {string} url - URL для сокращения
 * @returns {Promise<string>} - Сокращенный URL
 */
async function shortenUrl(url) {
  const {
    data: {
      data: { tiny_url },
      errors,
    },
  } = await axios.post(
    APP_CONFIG.api.endpoint,
    { url },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${APP_CONFIG.api.key}`,
      },
    },
  );

  if (errors && errors.length > 0) {
    throw new Error(errors[0]);
  }

  return tiny_url;
}

/**
 * Устанавливает состояние загрузки
 * @param {boolean} isLoading - Флаг загрузки
 */
function setLoadingState(isLoading) {
  APP_STATE.elements.formButton.textContent = isLoading ? 'Loading...' : 'Submit';
}

/**
 * Обновляет UI после получения сокращенного URL
 * @param {string} shortenedUrl - Сокращенный URL
 */
function updateUI(shortenedUrl) {
  APP_STATE.elements.shortenedUrl.value = shortenedUrl;
  APP_STATE.elements.container.classList.add('max-h-[235px]');
}

/**
 * Обрабатывает клик по кнопке копирования
 */
async function handleCopyButtonClick() {
  const url = APP_STATE.elements.shortenedUrl.value.trim();
  if (!url || url.length === 0) return;

  try {
    await navigator.clipboard.writeText(url);
    APP_UTILS.showToast('URL copied to clipboard');
  } catch (error) {
    APP_UTILS.handleError('Failed to copy URL', error);
  }
}

initApp();
