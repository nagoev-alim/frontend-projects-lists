/**
 * Этот код представляет собой веб-приложение для генерации и отображения цитат.
 * Он позволяет пользователю выбрать источник цитат, получить случайную цитату
 * и скопировать её в буфер обмена. Приложение использует различные API для
 * получения цитат и обрабатывает разные форматы данных.
 */

import './style.css';
import apiEndpoints from './mock';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import feather from 'feather-icons';
import axios from 'axios';

/**
 * Конфигурация приложения
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента
 * @property {Object} selectors - Селекторы для элементов формы
 */
const APP_CONFIG = {
  root: '#app',
  selectors: {
    form: '[data-quote-form]',
    submit: '[data-quote-submit]',
    result: '[data-quote-result]',
  },
};

/**
 * Состояние приложения
 * @typedef {Object} AppState
 * @property {Object} elements - DOM элементы
 */
const APP_STATE = {
  elements: {
    form: null,
    submit: null,
    result: null,
  },
};

/**
 * Утилиты приложения
 * @typedef {Object} AppUtils
 */
const APP_UTILS = {
  /**
   * Удаляет квадратные скобки из строки
   * @param {string} element - Строка для обработки
   * @returns {string} Строка без квадратных скобок
   */
  renderDataAttributes: (element) => element.slice(1, -1),

  /**
   * Конфигурация для toast-уведомлений
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
      ...APP_UTILS.toastConfig,
    }).showToast();
  },

  /**
   * Обрабатывает ошибки
   * @param {string} message - Сообщение об ошибке
   * @param {Error} [error] - Объект ошибки
   */
  handleError: (message, error = null) => {
    APP_UTILS.showToast(message);
    if (error) console.error(message, error);
  },
};

/**
 * Создает HTML-разметку приложения
 */
function createAppHTML() {
  const {
    root,
    selectors: { form, submit, result },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
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
function initDOMElements() {
  APP_STATE.elements = {
    form: document.querySelector(APP_CONFIG.selectors.form),
    submit: document.querySelector(APP_CONFIG.selectors.submit),
    result: document.querySelector(APP_CONFIG.selectors.result),
  };
}

/**
 * Инициализирует приложение
 */
function initApp() {
  createAppHTML();
  initDOMElements();

  APP_STATE.elements.form.addEventListener('submit', handleFormSubmit);
  APP_STATE.elements.result.addEventListener('click', handleResultClick);
}

/**
 * Получает цитату из выбранного источника
 * @param {string} source - URL источника цитат
 */
async function getQuote(source) {
  try {
    APP_STATE.elements.submit.textContent = 'Loading...';
    const { data } = await fetchQuoteData(source);
    processQuoteData(data);
  } catch (error) {
    APP_UTILS.handleError('Failed to fetch quote', error);
    APP_STATE.elements.result.innerHTML = '';
    APP_STATE.elements.result.classList.add('hidden');
  } finally {
    APP_STATE.elements.submit.textContent = 'Submit';
    APP_STATE.elements.form.reset();
  }
}

/**
 * Получает данные цитаты из API
 * @param {string} source - URL источника цитат
 * @returns {Promise<Object>} Ответ от API
 */
async function fetchQuoteData(source) {
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
function processQuoteData(data) {
  if (Array.isArray(data)) {
    handleArrayData(data);
  } else if (data.hasOwnProperty('value')) {
    renderUI(data.value, false);
  } else if (data.hasOwnProperty('author') && data.hasOwnProperty('content')) {
    renderUI(data.content, data.author ?? false);
  } else if (data.hasOwnProperty('author') && data.hasOwnProperty('quote')) {
    renderUI(data.quote, data.author ?? false);
  } else if (data.hasOwnProperty('quoteText') && data.hasOwnProperty('quoteAuthor')) {
    renderUI(data.quoteText, data.quoteAuthor ?? false);
  } else if (data.hasOwnProperty('punchline') && data.hasOwnProperty('setup')) {
    renderUI(data.setup, data.punchline ?? false);
  } else if (data.hasOwnProperty('quote') && typeof data.quote === 'object') {
    handleQuoteObject(data.quote);
  } else if (data.hasOwnProperty('insult')) {
    renderUI(data.insult, false);
  } else if (data.hasOwnProperty('affirmation')) {
    renderUI(data.affirmation, false);
  }
}

/**
 * Обрабатывает массив данных цитат
 * @param {Array} data - Массив данных цитат
 */
function handleArrayData(data) {
  if (data.length === 1) {
    renderUI(data[0], false);
  } else {
    const { text, author, yoast_head_json } = data[Math.floor(Math.random() * data.length)];
    if (yoast_head_json) {
      renderUI(yoast_head_json.og_description, yoast_head_json.og_title ?? false);
    } else {
      renderUI(text, author ?? false);
    }
  }
}

/**
 * Обрабатывает объект цитаты
 * @param {Object} quote - Объект цитаты
 */
function handleQuoteObject(quote) {
  if (quote.hasOwnProperty('author') && quote.hasOwnProperty('body')) {
    renderUI(quote.body, quote.author ?? false);
  }
}

/**
 * Обработчик отправки формы
 * @param {Event} event - Событие отправки формы
 */
async function handleFormSubmit(event) {
  event.preventDefault();
  const { source } = Object.fromEntries(new FormData(event.target));
  if (!source) {
    APP_UTILS.showToast('Please select source');
    return;
  }
  await getQuote(source);
}

/**
 * Обработчик клика по результату (для копирования цитаты)
 * @param {Event} event - Событие клика
 */
async function handleResultClick({ target }) {
  if (!target.matches('button')) return;

  try {
    const quoteText = APP_STATE.elements.result.querySelector('p').textContent;
    await navigator.clipboard.writeText(quoteText);
    APP_UTILS.showToast('✅ Quote copied to clipboard');
  } catch (error) {
    APP_UTILS.handleError('❌ Failed to copy quote', error);
  }
}

/**
 * Отображает UI с цитатой
 * @param {string} text - Текст цитаты
 * @param {string|boolean} hasAuthor - Автор цитаты или false, если автор отсутствует
 */
function renderUI(text, hasAuthor) {
  APP_STATE.elements.result.classList.remove('hidden');
  APP_STATE.elements.result.innerHTML = `
   <button class='ml-auto'>
      <span class='pointer-events-none'>
        ${feather.icons.clipboard.toSvg()}
      </span>
   </button>
   <p>"${text}"</p>
   ${hasAuthor ? `<p>${hasAuthor}</p>` : ''}`;
}

initApp();
