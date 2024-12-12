/**
 * Приложение для конвертации YouTube видео в MP3.
 * Позволяет пользователям вставить URL YouTube видео, проверяет его валидность,
 * извлекает информацию о видео и предоставляет ссылку для скачивания MP3.
 */

import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';

/**
 * Конфигурация приложения.
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента приложения.
 * @property {Object} selectors - Селекторы для различных элементов DOM.
 * @property {RegExp} REGEX - Регулярное выражение для проверки URL YouTube.
 */
const APP_CONFIG = {
  root: '#app',
  selectors: {
    form: '[data-youtube-form]',
    result: '[data-youtube-result]',
    info: '[data-youtube-info]',
  },
  REGEX: /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/,
};

/**
 * Состояние приложения.
 * @typedef {Object} AppState
 * @property {Object} elements - Ссылки на элементы DOM.
 */
const APP_STATE = {
  elements: {
    form: null,
    result: null,
    info: null,
  },
};

/**
 * Утилиты приложения.
 * @typedef {Object} AppUtils
 * @property {Function} renderDataAttributes - Функция для рендеринга атрибутов данных.
 * @property {Object} toastConfig - Конфигурация для уведомлений.
 * @property {Function} showToast - Функция для отображения уведомлений.
 * @property {Function} handleError - Функция для обработки ошибок.
 */
const APP_UTILS = {
  renderDataAttributes: (element) => element.slice(1, -1),
  toastConfig: {
    className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
    duration: 3000,
    gravity: 'bottom',
    position: 'center',
  },
  /**
   * Отображает уведомление.
   * @param {string} message - Сообщение для отображения.
   */
  showToast: (message) => {
    Toastify({
      text: message,
      ...APP_UTILS.toastConfig,
    }).showToast();
  },
  /**
   * Обрабатывает ошибки.
   * @param {string} message - Сообщение об ошибке.
   * @param {Error} [error] - Объект ошибки.
   */
  handleError: (message, error = null) => {
    APP_UTILS.showToast(message);
    if (error) console.error(message, error);
  },
};

/**
 * Создает HTML-структуру приложения.
 */
function createAppHTML() {
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
 * Инициализирует элементы DOM.
 */
function initDOMElements() {
  APP_STATE.elements = {
    form: document.querySelector(APP_CONFIG.selectors.form),
    formSubmitButton: document.querySelector(`${APP_CONFIG.selectors.form} button[type="submit"]`),
    result: document.querySelector(APP_CONFIG.selectors.result),
    info: document.querySelector(APP_CONFIG.selectors.info),
  };
}

/**
 * Инициализирует приложение.
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
async function handleFormSubmit(event) {
  event.preventDefault();
  const url = event.target.elements.url.value.trim();
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
 * Извлекает ID видео из URL YouTube.
 * @param {string} url - URL YouTube видео.
 * @returns {string|null} ID видео или null, если ID не найден.
 */
function extractVideoId(url) {
  const match = url.match(APP_CONFIG.REGEX);
  return match && match[7].length === 11 ? match[7] : null;
}

/**
 * Получает данные о видео и отображает их.
 * @param {string} id - ID видео YouTube.
 */
async function fetchData(id) {
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
 * Устанавливает состояние загрузки.
 * @param {boolean} isLoading - Флаг состояния загрузки.
 */
function setLoadingState(isLoading) {
  APP_STATE.elements.formSubmitButton.textContent = isLoading ? 'Loading...' : 'Submit';
  APP_STATE.elements.result.classList.toggle('hidden', isLoading);
}

/**
 * Получает данные о видео с API.
 * @param {string} id - ID видео YouTube.
 * @returns {Promise<Object>} Данные о видео.
 */
async function fetchVideoData(id) {
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
 * Отображает информацию о видео.
 * @param {Object} videoInfo - Информация о видео.
 * @param {string} videoInfo.thumb - URL миниатюры видео.
 * @param {string} videoInfo.title - Название видео.
 * @param {string} videoInfo.author - Автор видео.
 * @param {string} videoInfo.link - Ссылка для скачивания MP3.
 * @param {string} id - ID видео YouTube.
 */
function displayVideoInfo({ thumb, title, author, link }, id) {
  APP_STATE.elements.info.innerHTML = `
    <div class='grid grid-cols-[100px_auto] gap-3 items-center'>
      <img src='${thumb}' alt='${title}'>
      <h3 class='font-bold'>
      <a href='https://www.youtube.com/watch?v=${id}' target='_blank'>${title} - ${author}</a></h3>
    </div>
    <a href='${link}' target='_blank' class='px-3 py-2 border hover:bg-slate-50 flex justify-center items-center'>Download</a>
  `;
}

initApp();
