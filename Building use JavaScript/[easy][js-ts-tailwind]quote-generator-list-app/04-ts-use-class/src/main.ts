/**
 * Этот код реализует генератор цитат. Он позволяет пользователю выбрать источник цитат,
 * загружает цитату из выбранного API, отображает ее на странице и предоставляет возможность
 * скопировать цитату в буфер обмена. Код использует классовый подход для организации функциональности,
 * работает с DOM, выполняет асинхронные запросы к API и обрабатывает различные форматы данных цитат.
 */

import './style.css';
import apiEndpoints from './mock';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import { icons } from 'feather-icons';
import axios from 'axios';

class QuoteGenerator {
  /**
   * @type {Object} config - Конфигурация приложения
   * @property {string} root - Селектор корневого элемента
   * @property {Object} selectors - Селекторы для различных элементов DOM
   */
  config: {
    root: string;
    selectors: {
      form: string;
      submit: string;
      result: string;
    };
  };

  /**
   * @type {Object} state - Состояние приложения
   * @property {Object} elements - Ссылки на элементы DOM
   */
  state: {
    elements: {
      form: HTMLFormElement | null;
      submit: HTMLButtonElement | null;
      result: HTMLDivElement | null;
    };
  };

  /**
   * @type {Object} utils - Вспомогательные утилиты
   */
  utils: {
    renderDataAttributes: (element: string) => string;
    toastConfig: Object;
    showToast: (message: string) => void;
    handleError: (message: string, error?: any) => void;
  };

  constructor() {
    this.config = {
      root: '#app',
      selectors: {
        form: '[data-quote-form]',
        submit: '[data-quote-submit]',
        result: '[data-quote-result]',
      },
    };

    this.state = {
      elements: {
        form: null,
        submit: null,
        result: null,
      },
    };

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
   * Инициализирует ссылки на элементы DOM
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

    this.state.elements.form?.addEventListener('submit', this.handleFormSubmit.bind(this));
    this.state.elements.result?.addEventListener('click', this.handleResultClick.bind(this));
  }

  /**
   * Получает цитату из выбранного источника
   * @param {string} source - URL источника цитат
   */
  async getQuote(source: string) {
    try {
      if (this.state.elements.submit) {
        this.state.elements.submit.textContent = 'Loading...';
      }
      const { data } = await this.fetchQuoteData(source);
      this.processQuoteData(data);
    } catch (error) {
      this.utils.handleError('Failed to fetch quote', error);
      if (this.state.elements.result) {
        this.state.elements.result.innerHTML = '';
        this.state.elements.result.classList.add('hidden');
      }
    } finally {
      if (this.state.elements.submit) {
        this.state.elements.submit.textContent = 'Submit';
      }
      this.state.elements.form?.reset();
    }
  }

  /**
   * Выполняет запрос к API для получения цитаты
   * @param {string} source - URL источника цитат
   * @returns {Promise<Object>} - Ответ от API
   */
  async fetchQuoteData(source: string) {
    if (source === 'https://api.api-ninjas.com/v1/quotes') {
      return axios.get(source, {
        headers: { 'X-Api-Key': 'akxWnVBvUmGAjheE9llulw==TVZ6WIhfWDdCsx9o' },
      });
    }
    return axios.get(source);
  }

  /**
   * Обрабатывает полученные данные о цитате
   * @param {Object|Array} data - Данные о цитате
   */
  processQuoteData(data: any) {
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
   * Обрабатывает массив данных о цитатах
   * @param {Array} data - Массив данных о цитатах
   */
  handleArrayData(data: any[]) {
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
   * Обрабатывает объект с данными о цитате
   * @param {Object} quote - Объект с данными о цитате
   */
  handleQuoteObject(quote: any) {
    if (quote.hasOwnProperty('author') && quote.hasOwnProperty('body')) {
      this.renderUI(quote.body, quote.author ?? false);
    }
  }

  /**
   * Обрабатывает отправку формы
   * @param {Event} event - Событие отправки формы
   */
  async handleFormSubmit(event: Event) {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const { source } = Object.fromEntries(formData);
    if (!source) {
      this.utils.showToast('Please select source');
      return;
    }
    await this.getQuote(source as string);
  }

  /**
   * Обрабатывает клик по результату (для копирования цитаты)
   * @param {MouseEvent} event - Событие клика
   */
  async handleResultClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.matches('button')) return;

    try {
      const quoteText = this.state.elements.result?.querySelector('p')?.textContent;
      if (quoteText) {
        await navigator.clipboard.writeText(quoteText);
        this.utils.showToast('✅ Quote copied to clipboard');
      }
    } catch (error) {
      this.utils.handleError('❌ Failed to copy quote', error);
    }
  }

  /**
   * Отображает цитату в интерфейсе
   * @param {string} text - Текст цитаты
   * @param {string|boolean} hasAuthor - Автор цитаты или false, если автор отсутствует
   */
  renderUI(text: string, hasAuthor: string | boolean) {
    if (this.state.elements.result) {
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
}

new QuoteGenerator();
