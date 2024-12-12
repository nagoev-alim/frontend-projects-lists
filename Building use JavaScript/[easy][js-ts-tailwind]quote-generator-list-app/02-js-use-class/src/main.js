/**
 * Этот код представляет собой веб-приложение для генерации и отображения цитат.
 * Приложение позволяет пользователю выбрать источник цитат, получить случайную цитату
 * и скопировать её в буфер обмена. Оно обрабатывает различные форматы данных от разных API
 * и использует классовый подход для организации функциональности.
 */

import './style.css';
import apiEndpoints from './mock';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import { icons } from 'feather-icons';
import axios from 'axios';

/**
 * Класс, представляющий генератор цитат
 */
class QuoteGenerator {
  /**
   * Создает экземпляр QuoteGenerator
   */
  constructor() {
    /**
     * Конфигурация приложения
     * @type {Object}
     */
    this.config = {
      root: '#app',
      selectors: {
        form: '[data-quote-form]',
        submit: '[data-quote-submit]',
        result: '[data-quote-result]',
      },
    };

    /**
     * Состояние приложения
     * @type {Object}
     */
    this.state = {
      elements: {
        form: null,
        submit: null,
        result: null,
      },
    };

    /**
     * Утилиты приложения
     * @type {Object}
     */
    this.utils = {
      /**
       * Удаляет квадратные скобки из строки
       * @param {string} element - Строка для обработки
       * @returns {string} Строка без квадратных скобок
       */
      renderDataAttributes: (element) => element.slice(1, -1),

      /**
       * Конфигурация для toast-уведомлений
       * @type {Object}
       */
      toastConfig: {
        className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
        duration: 3000,
        gravity: 'bottom',
        position: 'center',
      },

      /**
       * Показывает toast-уведомление
       * @param {string} message - Сообщение для отображения
       */
      showToast: (message) => {
        Toastify({
          text: message,
          ...this.utils.toastConfig,
        }).showToast();
      },

      /**
       * Обрабатывает ошибки
       * @param {string} message - Сообщение об ошибке
       * @param {Error} [error] - Объект ошибки
       */
      handleError: (message, error = null) => {
        this.utils.showToast(message);
        if (error) console.error(message, error);
      },
    };

    this.init();
  }

  /**
   * Создает HTML-разметку приложения
   */
  createAppHTML() {
    const {
      root,
      selectors: { form, submit, result },
    } = this.config;
    const { renderDataAttributes } = this.utils;
    const rootElement = document.querySelector(root);

    if (!rootElement) return;

    rootElement.innerHTML = `
    <div class='grid w-full max-w-md gap-4 rounded border bg-white p-3 shadow'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>Quote Generators</h1>
      <form class='grid gap-3' ${renderDataAttributes(form)}>
        <select class='w-full cursor-pointer border-2 bg-slate-50 px-3 py-2 focus:border-blue-400 focus:outline-none' name='source'>
          <option value=''>Select Source</option>
          ${apiEndpoints.map(({ name, value }) => `<option value='${value}'>${name}</option>`).join('')}
        </select>
        <button class='border px-3 py-2' type='submit' ${renderDataAttributes(submit)}>Submit</button>
      </form>
      <div class='hidden grid rounded border bg-gray-50 p-2' ${renderDataAttributes(result)}></div>
    </div>
  `;
  }

  /**
   * Инициализирует DOM-элементы
   */
  initDOMElements() {
    this.state.elements = {
      form: document.querySelector(this.config.selectors.form),
      submit: document.querySelector(this.config.selectors.submit),
      result: document.querySelector(this.config.selectors.result),
    };
  }

  /**
   * Инициализирует приложение
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();

    this.state.elements.form.addEventListener('submit', this.handleFormSubmit.bind(this));
    this.state.elements.result.addEventListener('click', this.handleResultClick.bind(this));
  }

  /**
   * Получает цитату из выбранного источника
   * @param {string} source - URL источника цитат
   */
  async getQuote(source) {
    try {
      this.state.elements.submit.textContent = 'Loading...';
      const { data } = await this.fetchQuoteData(source);
      this.processQuoteData(data);
    } catch (error) {
      this.utils.handleError('Failed to fetch quote', error);
      this.state.elements.result.innerHTML = '';
      this.state.elements.result.classList.add('hidden');
    } finally {
      this.state.elements.submit.textContent = 'Submit';
      this.state.elements.form.reset();
    }
  }

  /**
   * Получает данные цитаты из API
   * @param {string} source - URL источника цитат
   * @returns {Promise<Object>} Ответ от API
   */
  async fetchQuoteData(source) {
    if (source === 'https://api.api-ninjas.com/v1/quotes') {
      return axios.get(source, {
        headers: { 'X-Api-Key': 'akxWnVBvUmGAjheE9llulw==TVZ6WIhfWDdCsx9o' },
      });
    }
    return axios.get(source);
  }

  /**
   * Обрабатывает полученные данные цитаты
   * @param {Object|Array} data - Данные цитаты
   */
  processQuoteData(data) {
    if (Array.isArray(data)) {
      this.handleArrayData(data);
    } else if (data.hasOwnProperty('value')) {
      this.renderUI(data.value, false);
    } else if (data.hasOwnProperty('author') && data.hasOwnProperty('content')) {
      this.renderUI(data.content, data.author ?? false);
    } else if (data.hasOwnProperty('author') && data.hasOwnProperty('quote')) {
      this.renderUI(data.quote, data.author ?? false);
    } else if (data.hasOwnProperty('quoteText') && data.hasOwnProperty('quoteAuthor')) {
      this.renderUI(data.quoteText, data.quoteAuthor ?? false);
    } else if (data.hasOwnProperty('punchline') && data.hasOwnProperty('setup')) {
      this.renderUI(data.setup, data.punchline ?? false);
    } else if (data.hasOwnProperty('quote') && typeof data.quote === 'object') {
      this.handleQuoteObject(data.quote);
    } else if (data.hasOwnProperty('insult')) {
      this.renderUI(data.insult, false);
    } else if (data.hasOwnProperty('affirmation')) {
      this.renderUI(data.affirmation, false);
    }
  }

  /**
   * Обрабатывает массив данных цитат
   * @param {Array} data - Массив данных цитат
   */
  handleArrayData(data) {
    if (data.length === 1) {
      this.renderUI(data[0], false);
    } else {
      const { text, author, yoast_head_json } = data[Math.floor(Math.random() * data.length)];
      if (yoast_head_json) {
        this.renderUI(yoast_head_json.og_description, yoast_head_json.og_title ?? false);
      } else {
        this.renderUI(text, author ?? false);
      }
    }
  }

  /**
   * Обрабатывает объект цитаты
   * @param {Object} quote - Объект цитаты
   */
  handleQuoteObject(quote) {
    if (quote.hasOwnProperty('author') && quote.hasOwnProperty('body')) {
      this.renderUI(quote.body, quote.author ?? false);
    }
  }

  /**
   * Обрабатывает отправку формы
   * @param {Event} event - Событие отправки формы
   */
  async handleFormSubmit(event) {
    event.preventDefault();
    const { source } = Object.fromEntries(new FormData(event.target));
    if (!source) {
      this.utils.showToast('Please select source');
      return;
    }
    await this.getQuote(source);
  }

  /**
   * Обрабатывает клик по результату
   * @param {Event} event - Событие клика
   */
  async handleResultClick({ target }) {
    if (!target.matches('button')) return;

    try {
      const quoteText = this.state.elements.result.querySelector('p').textContent;
      await navigator.clipboard.writeText(quoteText);
      this.utils.showToast('✅ Quote copied to clipboard');
    } catch (error) {
      this.utils.handleError('❌ Failed to copy quote', error);
    }
  }

  /**
   * Отображает UI с цитатой
   * @param {string} text - Текст цитаты
   * @param {string|boolean} hasAuthor - Автор цитаты или false
   */
  renderUI(text, hasAuthor) {
    this.state.elements.result.classList.remove('hidden');
    this.state.elements.result.innerHTML = `
   <button class='ml-auto'>
      <span class='pointer-events-none'>
        ${icons.clipboard.toSvg()}
      </span>
   </button>
   <p>"${text}"</p>
   ${hasAuthor ? `<p>${hasAuthor}</p>` : ''}`;
  }
}

new QuoteGenerator();
