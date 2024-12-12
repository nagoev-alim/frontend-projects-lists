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
class URLShortener {
  constructor() {
    /**
     * Конфигурация приложения
     * @typedef {Object} AppConfig
     * @property {string} root - Селектор корневого элемента
     * @property {Object} selectors - Селекторы элементов DOM
     * @property {Object} api - Настройки API
     */
    this.config = {
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
    this.state = {
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
    this.utils = {
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
          ...this.utils.toastConfig,
        }).showToast();
      },
      handleError: (message, error = null) => {
        this.utils.showToast(message);
        if (error) console.error(message, error);
      },
    };

    this.init();
  }

  /**
   * Создает HTML-структуру приложения
   */
  createAppHTML() {
    const {
      root,
      selectors: { container, form, shortenedUrl, copyButton },
    } = this.config;
    const { renderDataAttributes } = this.utils;
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
  initDOMElements() {
    this.state.elements = {
      container: document.querySelector(this.config.selectors.container),
      copyButton: document.querySelector(this.config.selectors.copyButton),
      form: document.querySelector(this.config.selectors.form),
      formButton: document.querySelector(`${this.config.selectors.form} button[type="submit"]`),
      shortenedUrl: document.querySelector(this.config.selectors.shortenedUrl),
    };
  }

  /**
   * Инициализирует приложение
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();
    this.state.elements.form.addEventListener('submit', this.handleFormSubmit.bind(this));
    this.state.elements.copyButton.addEventListener('click', this.handleCopyButtonClick.bind(this));
  }

  /**
   * Обрабатывает отправку формы
   * @param {Event} event - Событие отправки формы
   */
  async handleFormSubmit(event) {
    event.preventDefault();
    const url = event.target.elements.url.value.trim();

    if (!this.isValidUrl(url)) {
      this.utils.showToast('Please enter the correct URL.');
      return;
    }

    try {
      this.setLoadingState(true);
      const shortenedUrl = await this.shortenUrl(url);
      this.updateUI(shortenedUrl);
    } catch (error) {
      this.utils.handleError('Failed to shorten the URL.', error);
    } finally {
      this.setLoadingState(false);
    }
  }

  /**
   * Проверяет, является ли строка допустимым URL
   * @param {string} url - URL для проверки
   * @returns {boolean} - Результат проверки
   */
  isValidUrl(url) {
    const urlPattern =
      /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;
    return urlPattern.test(url);
  }

  /**
   * Отправляет запрос на сокращение URL
   * @param {string} url - URL для сокращения
   * @returns {Promise<string>} - Сокращенный URL
   */
  async shortenUrl(url) {
    const {
      data: {
        data: { tiny_url },
        errors,
      },
    } = await axios.post(
      this.config.api.endpoint,
      { url },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.api.key}`,
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
  setLoadingState(isLoading) {
    this.state.elements.formButton.textContent = isLoading ? 'Loading...' : 'Submit';
  }

  /**
   * Обновляет UI после получения сокращенного URL
   * @param {string} shortenedUrl - Сокращенный URL
   */
  updateUI(shortenedUrl) {
    this.state.elements.shortenedUrl.value = shortenedUrl;
    this.state.elements.container.classList.add('max-h-[235px]');
  }

  /**
   * Обрабатывает клик по кнопке копирования
   */
  async handleCopyButtonClick() {
    const url = this.state.elements.shortenedUrl.value.trim();
    if (!url || url.length === 0) return;

    try {
      await navigator.clipboard.writeText(url);
      this.utils.showToast('URL copied to clipboard');
    } catch (error) {
      this.utils.handleError('Failed to copy URL', error);
    }
  }
}

new URLShortener();
