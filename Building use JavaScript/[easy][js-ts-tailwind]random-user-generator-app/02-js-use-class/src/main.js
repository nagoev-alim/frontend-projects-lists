/**
 * Этот код реализует генератор случайных пользователей с использованием API randomuser.me.
 * Он создает веб-интерфейс, который позволяет пользователю генерировать случайные профили
 * и просматривать различную информацию о сгенерированном пользователе (имя, email, возраст и т.д.).
 * Код использует классовый подход для организации логики приложения.
 */

import './style.css';
import { icons } from 'feather-icons';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';

/**
 * Класс, реализующий функциональность генератора случайных пользователей
 */
class RandomUserGenerator {
  /**
   * Создает экземпляр генератора случайных пользователей
   */
  constructor() {
    /**
     * Конфигурация приложения
     * @type {Object}
     */
    this.config = {
      /** @type {string} Селектор корневого элемента */
      root: '#app',
      /** @type {Object} Селекторы DOM-элементов */
      selectors: {
        userImage: '[data-user-image]',
        userInfoLabel: '[data-user-info-label]',
        userInfoValue: '[data-user-info-value]',
        userInfoType: '[data-user-info-type]',
        generateUser: '[data-generate-user]',
      },
      /** @type {Array} Массив иконок для типов информации пользователя */
      icons: [
        { name: 'name', src: icons.user.toSvg() },
        { name: 'email', src: icons['at-sign'].toSvg() },
        { name: 'age', src: icons.calendar.toSvg() },
        { name: 'street', src: icons.map.toSvg() },
        { name: 'phone', src: icons.phone.toSvg() },
        { name: 'password', src: icons.lock.toSvg() },
      ],
      /** @type {string} URL API для получения данных случайного пользователя */
      url: 'https://randomuser.me/api/',
    };

    /**
     * Состояние приложения
     * @type {Object}
     */
    this.state = {
      /** @type {Object} Ссылки на DOM-элементы */
      elements: {
        userImage: null,
        userInfoLabel: null,
        userInfoValue: null,
        userInfoType: null,
        generateUser: null,
      },
      /** @type {Object} Данные пользователя */
      userData: {},
    };

    /**
     * Утилиты приложения
     * @type {Object}
     */
    this.utils = {
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
          ...this.utils.toastConfig,
        }).showToast();
      },
      /**
       * Обрабатывает ошибку, показывая уведомление и логируя её
       * @param {string} message - Сообщение об ошибке
       * @param {Error} [error=null] - Объект ошибки (необязательный)
       */
      handleError: (message, error = null) => {
        this.utils.showToast(message);
        if (error) console.error(message, error);
      },
    };

    this.init();
  }

  /**
   * Создает HTML структуру приложения
   */
  createAppHTML() {
    const {
      root,
      selectors: {
        userImage,
        userInfoLabel,
        userInfoValue,
        userInfoType,
        generateUser,
      },
    } = this.config;
    const { renderDataAttributes } = this.utils;
    const rootElement = document.querySelector(root);

    if (!rootElement) return;

    rootElement.innerHTML = `
    <div class='grid w-full max-w-md gap-4 rounded border bg-white p-3 shadow'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>Random User Generator</h1>
      <img class='mx-auto h-[132px] w-[132px] rounded-full border-2 border-black' src='#' alt='User' ${renderDataAttributes(userImage)}>
      <p class='flex flex-wrap justify-center gap-1'>
        <span ${renderDataAttributes(userInfoLabel)}></span>
        <span class='break-all font-medium' ${renderDataAttributes(userInfoValue)}></span>
      </p>
      <ul class='flex flex-wrap items-center justify-center gap-2'>
        ${this.config.icons.map(
      ({ name, src }) => `
          <li>
            <button class='border bg-white px-3 py-3 hover:bg-slate-300 transition-colors' ${renderDataAttributes(userInfoType)}='${name}'>
              <span class='pointer-events-none'>${src}</span>
            </button>
          </li>
        `,
    ).join('')}
      </ul>
      <button class='border px-3 py-2.5 hover:bg-slate-50' ${renderDataAttributes(generateUser)}>Generate</button>
    </div>
  `;
  }

  /**
   * Инициализирует DOM-элементы
   */
  initDOMElements() {
    this.state.elements = {
      userImage: document.querySelector(this.config.selectors.userImage),
      userInfoLabel: document.querySelector(this.config.selectors.userInfoLabel),
      userInfoValue: document.querySelector(this.config.selectors.userInfoValue),
      userInfoType: document.querySelectorAll(this.config.selectors.userInfoType),
      generateUser: document.querySelector(this.config.selectors.generateUser),
    };
  }

  /**
   * Инициализирует приложение
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();

    (async () => {
      await this.getUser();
      [...this.state.elements.userInfoType].forEach((button) =>
        button.addEventListener('click', this.handleUserInfoTypeClick.bind(this)),
      );
      this.state.elements.generateUser.addEventListener('click', this.getUser.bind(this));
    })();
  }

  /**
   * Получает данные случайного пользователя с API
   */
  async getUser() {
    try {
      const {
        data: {
          results: [user],
        },
      } = await axios.get(this.config.url);
      this.state.userData = {
        phone: user.phone,
        email: user.email,
        image: user.picture.large,
        street: `${user.location.street.number} ${user.location.street.name}`,
        password: user.login.password,
        name: `${user.name.first} ${user.name.last}`,
        age: user.dob.age,
      };
      this.renderUI();
    } catch (error) {
      this.utils.handleError('Failed to fetch user data.', error);
    }
  }

  /**
   * Обрабатывает клик по кнопке типа информации пользователя
   * @param {Event} event - Объект события клика
   */
  handleUserInfoTypeClick({ currentTarget }) {
    const type = currentTarget.dataset.userInfoType;
    this.state.elements.userInfoLabel.textContent = `My ${type} is`;
    this.state.elements.userInfoValue.textContent = this.state.userData[type];
    this.state.elements.userImage.src = this.state.userData.image;
    this.state.elements.userInfoType.forEach((button) => {
      button.classList.remove('bg-white');
      button.classList.toggle('bg-slate-200', button === currentTarget);
    });
  }

  /**
   * Обновляет UI с данными пользователя
   */
  renderUI() {
    this.state.elements.userImage.src = this.state.userData.image;
    this.state.elements.userInfoLabel.textContent = `My ${Object.keys(this.state.userData)[0]} is`;
    this.state.elements.userInfoValue.textContent = this.state.userData[Object.keys(this.state.userData)[0]];
    this.state.elements.userInfoType.forEach((button) => {
      button.classList.remove('bg-white');
      button.classList.toggle(
        'bg-slate-200',
        button === this.state.elements.userInfoType[0],
      );
    });
  }
}

new RandomUserGenerator();
