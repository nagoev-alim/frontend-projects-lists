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
 * Класс для конвертации YouTube видео в MP3.
 * @class
 */
class YouTubeToMp3 {
  /**
   * Создает экземпляр YouTubeToMp3.
   * Инициализирует конфигурацию, состояние и утилиты.
   * Запускает инициализацию приложения.
   * @constructor
   */
  constructor() {
    /**
     * Конфигурация приложения.
     * @type {Object}
     * @property {string} root - Селектор корневого элемента.
     * @property {Object} selectors - Селекторы для элементов DOM.
     * @property {RegExp} REGEX - Регулярное выражение для проверки URL YouTube.
     */
    this.config = {
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
     * @type {Object}
     * @property {Object} elements - Ссылки на элементы DOM.
     */
    this.state = {
      elements: {
        form: null,
        result: null,
        info: null,
      },
    };

    /**
     * Утилиты приложения.
     * @type {Object}
     */
    this.utils = {
      /**
       * Обрабатывает атрибуты данных для рендеринга.
       * @param {string} element - Строка с атрибутами данных.
       * @returns {string} Обработанная строка атрибутов.
       */
      renderDataAttributes: (element) => element.slice(1, -1),

      /**
       * Конфигурация для уведомлений Toastify.
       * @type {Object}
       */
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
          ...this.utils.toastConfig,
        }).showToast();
      },

      /**
       * Обрабатывает ошибки.
       * @param {string} message - Сообщение об ошибке.
       * @param {Error} [error] - Объект ошибки (опционально).
       */
      handleError: (message, error = null) => {
        this.utils.showToast(message);
        if (error) console.error(message, error);
      },
    };

    this.init();
  }

  /**
   * Создает HTML-структуру приложения.
   */
  createAppHTML() {
    const {
      root,
      selectors: { form, result, info },
    } = this.config;
    const { renderDataAttributes } = this.utils;
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
  initDOMElements() {
    this.state.elements = {
      form: document.querySelector(this.config.selectors.form),
      formSubmitButton: document.querySelector(`${this.config.selectors.form} button[type="submit"]`),
      result: document.querySelector(this.config.selectors.result),
      info: document.querySelector(this.config.selectors.info),
    };
  }

  /**
   * Инициализирует приложение.
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();
    this.state.elements.form.addEventListener('submit', this.handleFormSubmit.bind(this));
  }


  /**
   * Обрабатывает отправку формы.
   * @param {Event} event - Событие отправки формы.
   */
  async handleFormSubmit(event) {
    event.preventDefault();
    const url = event.target.elements.url.value.trim();
    if (!this.config.REGEX.test(url)) {
      this.utils.showToast('Invalid YouTube URL');
      return;
    }
    const videoId = this.extractVideoId(url);
    if (videoId) {
      await this.fetchData(videoId);
    }
  }

  /**
   * Извлекает ID видео из URL YouTube.
   * @param {string} url - URL YouTube видео.
   * @returns {string|null} ID видео или null, если ID не найден.
   */
  extractVideoId(url) {
    const match = url.match(this.config.REGEX);
    return match && match[7].length === 11 ? match[7] : null;
  }

  /**
   * Получает данные о видео и отображает их.
   * @param {string} id - ID видео YouTube.
   */
  async fetchData(id) {
    try {
      this.setLoadingState(true);
      const videoData = await this.fetchVideoData(id);
      this.displayVideoInfo(videoData, id);
    } catch (error) {
      this.utils.handleError('Failed to fetch data', error);
    } finally {
      this.setLoadingState(false);
    }
  }

  /**
   * Устанавливает состояние загрузки.
   * @param {boolean} isLoading - Флаг состояния загрузки.
   */
  setLoadingState(isLoading) {
    this.state.elements.formSubmitButton.textContent = isLoading ? 'Loading...' : 'Submit';
    this.state.elements.result.classList.toggle('hidden', isLoading);
  }

  /**
   * Получает данные о видео с API.
   * @param {string} id - ID видео YouTube.
   * @returns {Promise<Object>} Данные о видео.
   */
  async fetchVideoData(id) {
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
  displayVideoInfo({ thumb, title, author, link }, id) {
    this.state.elements.info.innerHTML = `
    <div class='grid grid-cols-[100px_auto] gap-3 items-center'>
      <img src='${thumb}' alt='${title}'>
      <h3 class='font-bold'>
      <a href='https://www.youtube.com/watch?v=${id}' target='_blank'>${title} - ${author}</a></h3>
    </div>
    <a href='${link}' target='_blank' class='px-3 py-2 border hover:bg-slate-50 flex justify-center items-center'>Download</a>
  `;
  }
}

new YouTubeToMp3();
