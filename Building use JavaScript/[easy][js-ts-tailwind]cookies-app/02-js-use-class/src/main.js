/**
 * @fileoverview Этот модуль реализует функциональность управления согласием на использование куков на веб-сайте.
 * Он создает интерфейс для запроса согласия пользователя, управляет состоянием согласия через куки,
 * и предоставляет возможность принять или отклонить использование куков.
 */

import './style.css';

/**
 * Класс для управления согласием на использование куков.
 */
class Cookies {
  /**
   * Создает экземпляр класса Cookies.
   */
  constructor() {
    /**
     * @typedef {Object} Config
     * @property {string} root - Селектор корневого элемента приложения
     * @property {Object} selectors - Объект с селекторами элементов
     * @property {string} selectors.cookieConsent - Селектор элемента согласия на куки
     * @property {string} selectors.cookieAccept - Селектор кнопки принятия куков
     * @property {string} selectors.cookieDecline - Селектор кнопки отклонения куков
     */
    this.config = {
      root: '#app',
      selectors: {
        cookieConsent: '[data-cookie-consent]',
        cookieAccept: '[data-cookie-accept]',
        cookieDecline: '[data-cookie-decline]',
      },
    };

    /**
     * @typedef {Object} State
     * @property {Object} elements - Объект с ссылками на DOM элементы
     * @property {HTMLElement|null} elements.cookieConsent - Элемент согласия на куки
     * @property {HTMLElement|null} elements.cookieAccept - Кнопка принятия куков
     * @property {HTMLElement|null} elements.cookieDecline - Кнопка отклонения куков
     */
    this.state = {
      elements: {
        cookieConsent: null,
        cookieAccept: null,
        cookieDecline: null,
      },
    };

    /**
     * Объект с утилитарными функциями
     * @type {Object}
     */
    this.utils = {
      /**
       * Преобразует селектор атрибута данных в строку атрибута
       * @param {string} element - Селектор атрибута данных (например, '[data-example]')
       * @returns {string} Строка атрибута данных без квадратных скобок (например, 'data-example')
       * @example
       * renderDataAttributes('[data-example]') // Возвращает 'data-example'
       */
      renderDataAttributes: (element) => element.slice(1, -1),
    };

    this.init();
  }

  /**
   * Создает HTML-разметку для приложения
   */
  createAppHTML() {
    const {
      root,
      selectors: {
        cookieConsent,
        cookieAccept,
        cookieDecline,
      },
    } = this.config;
    const { renderDataAttributes } = this.utils;
    const rootElement = document.querySelector(root);

    if (!rootElement) return;

    rootElement.innerHTML = `
    <div class='fixed bottom-5 left-5 grid max-w-md gap-3 rounded-lg bg-white p-3 shadow' ${renderDataAttributes(cookieConsent)}>
      <h3 class='flex items-center gap-3 text-lg font-bold'>
        <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='none' stroke-width='1.5'>
          <path stroke='currentColor' stroke-linecap='round' stroke-linejoin='round' d='M21.8 14c-.927 4.564-4.962 8-9.8 8-5.523 0-10-4.477-10-10 0-5.185 3.947-9.449 9-9.95'/>
          <path stroke='currentColor' stroke-linecap='round' stroke-linejoin='round' d='M6.5 10a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1ZM20.5 4a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1ZM12 19a1 1 0 1 1 0-2 1 1 0 0 1 0 2ZM7 15.01l.01-.011M17 15.01l.01-.011M11 12.01l.01-.011M21 9.01l.01-.011M17 6.01l.01-.011M11 2c-.5 1.5.5 3 2.085 3C11 8.5 13 12 18 11.5c0 2.5 2.5 3 3.7 2.514'/>
        </svg>
        Cookies Consent
      </h3>
      <p>This website use cookies to help you have a superior and more relevant browsing experience on the website.</p>
      <a class='text-purple-500' href='#'>Read more</a>
      <div class='flex items-center gap-2'>
        <button class='border bg-purple-500 px-3 py-2 text-white hover:bg-purple-400' ${renderDataAttributes(cookieAccept)}>Accept</button>
        <button class='border px-3 py-2 hover:bg-slate-50' ${renderDataAttributes(cookieDecline)}>Decline</button>
      </div>
    </div>
  `;
  }

  /**
   * Инициализирует DOM элементы и сохраняет их в состоянии приложения
   */
  initDOMElements() {
    this.state.elements = {
      cookieConsent: document.querySelector(this.config.selectors.cookieConsent),
      cookieAccept: document.querySelector(this.config.selectors.cookieAccept),
      cookieDecline: document.querySelector(this.config.selectors.cookieDecline),
    };
  }

  /**
   * Инициализирует приложение
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();
    window.addEventListener('load', this.initCookies.bind(this));
  }

  /**
   * Инициализирует функциональность куков
   */
  initCookies() {
    const { cookieConsent } = this.state.elements;
    const hasConsent = document.cookie.includes('customCookies');

    cookieConsent.classList.toggle('hidden', hasConsent);

    if (!hasConsent) {
      [this.state.elements.cookieAccept, this.state.elements.cookieDecline].forEach(button =>
        button.addEventListener('click', ({ target }) => {
          cookieConsent.classList.add('hidden');
          if (target.matches(this.config.selectors.cookieAccept)) {
            document.cookie = `cookieBy=customCookies; max-age=${30 * 24 * 60 * 60}`;
          }
        }),
      );
    }
  }
}

new Cookies();
