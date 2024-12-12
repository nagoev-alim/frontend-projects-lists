/**
 * Этот код реализует веб-приложение "Number Facts", которое позволяет пользователям
 * получать интересные факты о числах. Приложение использует внешний API для получения
 * фактов, отображает их пользователю и обрабатывает ошибки. Код включает в себя
 * конфигурацию приложения, управление состоянием, утилиты и функции для работы с DOM.
 */

import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';

/**
 * Конфигурация приложения
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента приложения
 * @property {Object} selectors - Объект с селекторами DOM элементов
 * @property {string} apiUrl - URL API для получения фактов о числах
 */
const APP_CONFIG = {
  root: '#app',
  selectors: {
    form: '[data-number-form]',
    factDisplay: '[data-fact-display]',
    loadingSpinner: '[data-loading-spinner]',
  },
  apiUrl: 'http://numbersapi.com/',
};

/**
 * Состояние приложения
 * @typedef {Object} AppState
 * @property {Object} elements - Объект с ссылками на DOM элементы
 */
const APP_STATE = {
  elements: {
    form: null,
    factDisplay: null,
    loadingSpinner: null,
  },
};

/**
 * Утилиты приложения
 * @typedef {Object} AppUtils
 */
const APP_UTILS = {
  /**
   * Добавляет ведущий ноль к числу, если оно меньше 10
   * @param {number} num - Число для форматирования
   * @returns {string} Отформатированное число
   */
  addLeadingZero: (num) => num.toString().padStart(2, '0'),

  /**
   * Преобразует строку селектора в атрибут для data-атрибутов
   * @param {string} element - Строка селектора
   * @returns {string} Атрибут без квадратных скобок
   */
  renderDataAttributes: (element) => element.slice(1, -1),

  /**
   * Конфигурация для Toast уведомлений
   * @type {Object}
   */
  toastConfig: {
    className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
    duration: 3000,
    gravity: 'bottom',
    position: 'center',
  },

  /**
   * Показывает Toast уведомление
   * @param {string} message - Сообщение для отображения
   */
  showToast: (message) => {
    Toastify({
      text: message,
      ...APP_UTILS.toastConfig,
    }).showToast();
  },

  /**
   * Обрабатывает ошибку, показывая уведомление и логируя её
   * @param {string} message - Сообщение об ошибке
   * @param {Error} [error=null] - Объект ошибки (необязательный)
   */
  handleError: (message, error = null) => {
    APP_UTILS.showToast(message);
    if (error) console.error(message, error);
  },
};

/**
 * Создает HTML структуру приложения
 */
function createAppHTML() {
  const {
    root,
    selectors: {
      form,
      factDisplay,
      loadingSpinner,
    },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='grid w-full max-w-md gap-4 rounded border bg-white p-3 shadow'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>Number Facts</h1>
      <form ${renderDataAttributes(form)}>
        <input
          class='w-full rounded border-2 bg-slate-50 px-3 py-2.5 focus:border-blue-400 focus:outline-none'
          type='number'
          name='number'
          placeholder='Enter a number'
        >
      </form>
      <p class='hidden' ${renderDataAttributes(factDisplay)}></p>
      <div class='hidden' role='status' ${renderDataAttributes(loadingSpinner)}>
        <div class='flex justify-center'>
          <svg
            aria-hidden='true'
            class='mr-2 h-8 w-8 animate-spin fill-gray-600 text-gray-200 dark:fill-gray-300 dark:text-gray-600'
            viewBox='0 0 100 101'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
              fill='currentColor'
            />
            <path
              d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
              fill='currentFill'
            />
          </svg>
          <span class='sr-only'>Loading...</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Инициализирует DOM элементы в состоянии приложения
 */
function initDOMElements() {
  APP_STATE.elements = {
    form: document.querySelector(APP_CONFIG.selectors.form),
    factDisplay: document.querySelector(APP_CONFIG.selectors.factDisplay),
    loadingSpinner: document.querySelector(APP_CONFIG.selectors.loadingSpinner),
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
 * Обрабатывает отправку формы
 * @param {Event} event - Событие отправки формы
 */
async function handleFormSubmit(event) {
  event.preventDefault();
  const { number } = Object.fromEntries(new FormData(event.target));

  if (!(number && number.trim().length > 0)) {
    APP_UTILS.showToast('Please enter a number');
    return;
  }

  try {
    toggleUIElements(true);
    const { data } = await axios.get(`${APP_CONFIG.apiUrl}${number}`);
    APP_STATE.elements.factDisplay.textContent = data;
    event.target.reset();
    event.target.number.focus();
  } catch (error) {
    APP_UTILS.handleError('An error occurred while fetching the fact', error);
  } finally {
    toggleUIElements(false);
  }
}

/**
 * Переключает видимость UI элементов
 * @param {boolean} isLoading - Флаг, указывающий на состояние загрузки
 */
function toggleUIElements(isLoading) {
  APP_STATE.elements.loadingSpinner.classList.toggle('hidden', !isLoading);
  APP_STATE.elements.factDisplay.classList.toggle('hidden', isLoading);
}

initApp();
