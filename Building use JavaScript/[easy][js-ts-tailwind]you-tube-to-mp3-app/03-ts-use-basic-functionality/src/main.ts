/**
 * Этот файл содержит код для приложения конвертера YouTube в MP3.
 * Приложение позволяет пользователям вставить URL-адрес YouTube видео,
 * извлечь информацию о видео и предоставить ссылку для скачивания MP3 версии.
 */

import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';

/**
 * @typedef {Object} AppUtils
 * @property {function(string): string} renderDataAttributes - Функция для рендеринга атрибутов данных
 * @property {Object} toastConfig - Конфигурация для уведомлений
 * @property {string} toastConfig.className - CSS класс для уведомлений
 * @property {number} [toastConfig.duration] - Продолжительность отображения уведомления
 * @property {('top'|'bottom')} [toastConfig.gravity] - Позиция уведомления по вертикали
 * @property {('left'|'center'|'right')} [toastConfig.position] - Позиция уведомления по горизонтали
 * @property {function(string): void} showToast - Функция для отображения уведомлений
 * @property {function(string, any=): void} handleError - Функция для обработки ошибок
 */
interface AppUtils {
  renderDataAttributes: (element: string) => string;
  toastConfig: {
    className: string;
    duration?: number;
    gravity?: 'top' | 'bottom';
    position?: 'left' | 'center' | 'right';
  };
  showToast: (message: string) => void;
  handleError: (message: string, error?: any) => void;
}

/**
 * @typedef {Object} AppConfig
 * @property {string} root - Корневой селектор приложения
 * @property {Object.<string, string>} selectors - Селекторы для элементов приложения
 * @property {RegExp} REGEX - Регулярное выражение для проверки URL YouTube
 */
interface AppConfig {
  root: string;
  selectors: {
    [key: string]: string;
  };
  REGEX: RegExp;
}

/**
 * @typedef {Object} AppState
 * @property {Object} elements - Объект, содержащий элементы DOM
 * @property {HTMLFormElement} elements.form - Форма приложения
 * @property {HTMLElement} elements.result - Элемент для отображения результатов
 * @property {HTMLElement} elements.info - Элемент для отображения информации
 * @property {HTMLButtonElement} [elements.formSubmitButton] - Кнопка отправки формы
 */
interface AppState {
  elements: {
    form: HTMLFormElement;
    result: HTMLElement;
    info: HTMLElement;
    formSubmitButton?: HTMLButtonElement;
  };
}

/**
 * Конфигурация приложения
 * @type {AppConfig}
 */
const APP_CONFIG: AppConfig = {
  root: '#app',
  selectors: {
    form: '[data-youtube-form]',
    result: '[data-youtube-result]',
    info: '[data-youtube-info]',
  },
  REGEX: /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/,
};

/**
 * Состояние приложения
 * @type {AppState}
 */
const APP_STATE: AppState = {
  elements: {
    form: document.createElement('form'),
    result: document.createElement('div'),
    info: document.createElement('div'),
  },
};

/**
 * Утилиты приложения
 * @type {AppUtils}
 */
const APP_UTILS: AppUtils = {
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

function createAppHTML(): void {
  const {
    root,
    selectors: { form, result, info },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='grid gap-4 w-full max-w-md rounded border bg-white p-3 shadow'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>YouTube to MP3 Converter</h1>
      <div class='grid gap-3'>
        <form class='grid gap-2' ${renderDataAttributes(form)}>
          <label>
            <input class='w-full rounded border bg-slate-50 px-3 py-2 focus:border-blue-400 focus:outline-none' type='text' name='url' placeholder='Paste your youtube url here..'>
          </label>
          <button class='border px-3 py-2 hover:bg-slate-50' type='submit'>Submit</button>
        </form>
        <div class='hidden' ${renderDataAttributes(result)}>
          <div class='grid gap-3' ${renderDataAttributes(info)}></div>
        </div>
      </div>
    </div>
  `;
}


/**
 * Инициализирует элементы DOM в состоянии приложения
 */
function initDOMElements(): void {
  APP_STATE.elements = {
    form: document.querySelector(APP_CONFIG.selectors.form) as HTMLFormElement,
    formSubmitButton: document.querySelector(`${APP_CONFIG.selectors.form} button[type="submit"]`) as HTMLButtonElement,
    result: document.querySelector(APP_CONFIG.selectors.result) as HTMLDivElement,
    info: document.querySelector(APP_CONFIG.selectors.info) as HTMLDivElement,
  };
}

/**
 * Инициализирует приложение
 */

function initApp() {
  createAppHTML();
  initDOMElements();
  APP_STATE.elements.form.addEventListener('submit', handleFormSubmit);
}

/**
 * Обрабатывает отправку формы.
 * @param {Event} event - Событие отправки формы.
 */
async function handleFormSubmit(event: Event): Promise<void> {
  event.preventDefault();
  const target = event.target as HTMLFormElement;
  const url = (target.elements.namedItem('url') as HTMLInputElement).value.trim();
  if (!APP_CONFIG.REGEX.test(url)) {
    APP_UTILS.showToast('Invalid YouTube URL');
    return;
  }
  const videoId = extractVideoId(url);
  if (videoId) {
    await fetchData(videoId);
  }
}

/**
 * Извлекает идентификатор видео из URL YouTube.
 * @param {string} url - URL видео YouTube.
 * @returns {string | null} Идентификатор видео или null, если не найден.
 */
function extractVideoId(url: string): string | null {
  const match = url.match(APP_CONFIG.REGEX);
  return match && match[7].length === 11 ? match[7] : null;
}

/**
 * Получает данные о видео и отображает информацию.
 * @param {string} id - Идентификатор видео YouTube.
 */
async function fetchData(id: string): Promise<void> {
  try {
    setLoadingState(true);
    const videoData = await fetchVideoData(id);
    displayVideoInfo(videoData, id);
  } catch (error) {
    APP_UTILS.handleError('Failed to fetch data', error);
  } finally {
    setLoadingState(false);
  }
}

/**
 * Устанавливает состояние загрузки для элементов интерфейса.
 * @param {boolean} isLoading - Флаг, указывающий на состояние загрузки.
 */
function setLoadingState(isLoading: boolean): void {
  APP_STATE.elements.formSubmitButton!.textContent = isLoading ? 'Loading...' : 'Submit';
  APP_STATE.elements.result.classList.toggle('hidden', isLoading);
}

/**
 * Интерфейс для данных о видео.
 */
interface VideoData {
  thumb: string;
  title: string;
  author: string;
  link: string;
}

/**
 * Получает данные о видео с API.
 * @param {string} id - Идентификатор видео YouTube.
 * @returns {Promise<VideoData>} Промис с данными о видео.
 */
async function fetchVideoData(id: string): Promise<VideoData> {
  const { data } = await axios({
    method: 'GET',
    url: 'https://youtube-mp3-download1.p.rapidapi.com/dl',
    params: { id },
    headers: {
      'X-RapidAPI-Key': 'a07622a786mshaea27da6a042696p1c7a02jsncc2e1c7e534e',
      'X-RapidAPI-Host': 'youtube-mp3-download1.p.rapidapi.com',
    },
  });
  return data;
}

/**
 * Отображает информацию о видео в интерфейсе.
 * @param {VideoData} param0 - Объект с данными о видео.
 * @param {string} id - Идентификатор видео YouTube.
 */
function displayVideoInfo({ thumb, title, author, link }: VideoData, id: string): void {
  APP_STATE.elements.info.innerHTML = `
    <div class='grid grid-cols-[100px_auto] gap-3 items-center'>
      <img src='${thumb}' alt='${title}'>
      <h3 class='font-bold'>
        <a href='https://www.youtube.com/watch?v=${id}' target='_blank'>${title} - ${author}</a>
      </h3>
    </div>
    <a href='${link}' target='_blank' class='px-3 py-2 border hover:bg-slate-50 flex justify-center items-center'>Download</a>
  `;
}

// Инициализация приложения
initApp();
