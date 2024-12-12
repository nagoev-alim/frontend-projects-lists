/**
 * @fileoverview Этот файл содержит код для двух компонентов рейтинга:
 * 1. Компонент выбора продукта и установки рейтинга
 * 2. Компонент пользовательского рейтинга звездами
 *
 * Код включает в себя конфигурацию приложения, управление состоянием,
 * утилиты, создание HTML, инициализацию DOM элементов и логику компонентов.
 */

import './style.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';


class StarRatings {
  constructor() {
    this.config = {
      root: '#app',
      selectors: {
        APP_ONE: {
          select: '[data-product-select]',
          input: '[data-rating-input]',
        },
        APP_TWO: {
          select: '[data-lib-rating]',
          icon: '[data-star-icon]',
          result: '[data-rating-result]',
        },
      },
    };

    this.state = {
      elements: {},
      APP_ONE_MOCK: {
        description: [
          { name: 'sony', value: 'Sony 4K TV' },
          { name: 'samsung', value: 'Samsung 4K TV' },
          { name: 'vizio', value: 'Vizio 4K TV' },
          { name: 'panasonic', value: 'Panasonic 4K TV' },
          { name: 'phillips', value: 'Phillips 4K TV' },
        ],
        ratings: {
          sony: 3.1,
          samsung: 2.4,
          vizio: 3.3,
          panasonic: 4.6,
          phillips: 1.1,
        },
        starsTotal: 5,
        product: null,
      },
      APP_TWO_MOCK: {
        description: [
          { name: 'Excellent', value: 5 },
          { name: 'Very Good', value: 4 },
          { name: 'Average', value: 3 },
          { name: 'Poor', value: 2 },
          { name: 'Terrible', value: 1 },
        ],
      },
    };

    this.utils = {
      /**
       * Рендерит data-атрибуты
       * @param {string} element - Строка с data-атрибутом
       * @returns {string} Отформатированная строка атрибута
       */
      renderDataAttributes: (element) => element.slice(1, -1),
      toastConfig: {
        className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
        duration: 3000,
        gravity: 'bottom',
        position: 'center',
      },
      /**
       * Отображает уведомление
       * @param {string} message - Текст уведомления
       */
      showToast: (message) => {
        Toastify({
          text: message,
          ...this.utils.toastConfig,
        }).showToast();
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
      selectors: { APP_ONE, APP_TWO },
    } = this.config;
    const { renderDataAttributes } = this.utils;
    const rootElement = document.querySelector(root);

    if (!rootElement) return;

    rootElement.innerHTML = ``;

    const appOneContainer = document.createElement('div');
    const appTwoContainer = document.createElement('div');

    appOneContainer.className = 'rating01';
    appTwoContainer.className = 'rating02';

    appOneContainer.innerHTML = `
    <header>
      <h4 class='text-lg font-bold'>Component #1</h4>
      <select class='w-full rounded border bg-slate-50 px-3 py-2 focus:border-blue-400 focus:outline-none' ${renderDataAttributes(APP_ONE.select)}>
        <option value='0' disabled selected>Select Product</option>
        ${this.state.APP_ONE_MOCK.description.map(({
                                                                                                                                                                                                                                        name,
                                                                                                                                                                                                                                        value,
                                                                                                                                                                                                                                      }) => `<option value='${name}'>${value}</option>`).join('')}
      </select>
      <input class='w-full rounded border bg-slate-50 px-3 py-2 focus:border-blue-400 focus:outline-none' type='number' step='0.1' max='5' placeholder='Rate 1 - 5' ${renderDataAttributes(APP_ONE.input)} disabled>
    </header>
    <table class='table'>
      <thead>
        <tr>
          <th>4K Television</th>
          <th>Rating</th>
        </tr>
      </thead>
      <tbody>
      ${this.state.APP_ONE_MOCK.description
      .map(
        ({ name, value }) => `
        <tr data-product='${name}'>
          <td>${value}</td>
          <td>
            <div class='stars-outer'>
              <div class='stars-inner'></div>
            </div>
            <span class='number-rating'></span>
          </td>
        </tr>
      `,
      )
      .join('')}
      </tbody>
    </table>`;

    appTwoContainer.innerHTML = `
  <h4 class='text-lg font-bold'>Component #2 <br>(Custom Star Ratings)</h4>
  <div>
    ${Array.from({ length: 5 })
      .map(() => `<i ${renderDataAttributes(APP_TWO.icon)} class='fa-regular fa-star'></i>`)
      .join('')}
  </div>
  <span ${renderDataAttributes(APP_TWO.result)}></span>`;

    [appOneContainer, appTwoContainer].forEach((container) =>
      rootElement.append(container),
    );
  }

  /**
   * Инициализирует DOM элементы
   */
  initDOMElements() {
    this.state.elements = {
      APP_ONE: {
        select: document.querySelector(`.rating01 ${this.config.selectors.APP_ONE.select}`),
        input: document.querySelector(`.rating01 ${this.config.selectors.APP_ONE.input}`),
      },
      APP_TWO: {
        icon: Array.from(
          document.querySelectorAll(`.rating02 ${this.config.selectors.APP_TWO.icon}`),
        ),
        result: document.querySelectorAll(`.rating02 ${this.config.selectors.APP_TWO.result}`),
      },
    };
  }

  /**
   * Инициализирует приложение
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();
    this.initAppOne();
    this.initAppTwo();
  }

  /**
   * Инициализирует первый компонент (выбор продукта и установка рейтинга)
   */
  initAppOne() {
    /**
     * Обновляет отображение рейтингов
     */
    const getRatings = () => {
      Object.entries(this.state.APP_ONE_MOCK.ratings).forEach(([rating, value]) => {
        const starPercentage = (value / this.state.APP_ONE_MOCK.starsTotal) * 100;
        const roundedPercentage = Math.round(starPercentage / 10) * 10;
        const productElement = document.querySelector(
          `[data-product="${rating}"]`,
        );

        productElement.querySelector('.stars-inner').style.width =
          `${roundedPercentage}%`;
        productElement.querySelector('.number-rating').textContent = value;
      });
    };

    /**
     * Обрабатывает изменение выбранного продукта
     * @param {Event} event - Событие изменения
     */
    const handleSelectChange = (event) => {
      const selectedProduct = event.target.value;
      const ratingInput = this.state.elements.APP_ONE.input;

      this.state.APP_ONE_MOCK.product = selectedProduct;
      ratingInput.disabled = false;
      ratingInput.value = this.state.APP_ONE_MOCK.ratings[selectedProduct].toFixed(1);
    };

    /**
     * Обрабатывает ввод нового рейтинга
     * @param {Event} event - Событие потери фокуса
     */
    const handleInputBlur = (event) => {
      const value = event.target.value;
      const rating = parseFloat(value);
      if (rating < 1 || rating > 5) {
        this.utils.showToast('Rating must be between 1 and 5');
        return;
      }
      this.state.APP_ONE_MOCK.ratings[this.state.APP_ONE_MOCK.product] = rating;
      getRatings();
    };

    getRatings();
    this.state.elements.APP_ONE.select.addEventListener('change', handleSelectChange);
    this.state.elements.APP_ONE.input.addEventListener('blur', handleInputBlur);
  }

  /**
   * Инициализирует второй компонент (пользовательский рейтинг звездами)
   */
  initAppTwo() {
    /**
     * Отображает результат рейтинга
     * @param {HTMLElement} result - Элемент для отображения результата
     * @param {number} num - Значение рейтинга
     * @returns {string} Текст результата
     */
    const printRatingResult = (result, num = 0) => {
      return (result.textContent = `${num}/5`);
    };

    /**
     * Реализует функционал рейтинга звездами
     * @param {Array<HTMLElement>} stars - Массив элементов звезд
     * @param {HTMLElement} result - Элемент для отображения результата
     */
    const executeRating = (stars, result) => {
      const starClassActive = 'fa-solid fa-star';
      const starClassUnactive = 'fa-regular fa-star';
      const starsLength = stars.length;
      let i;
      stars.forEach((star) => {
        star.addEventListener('click', () => {
          i = stars.indexOf(star);
          if (star.className.indexOf(starClassUnactive) !== -1) {
            printRatingResult(result, i + 1);
            for (i; i >= 0; --i) stars[i].className = starClassActive;
          } else {
            printRatingResult(result, i);
            for (i; i < starsLength; ++i) stars[i].className = starClassUnactive;
          }
        });
      });
    };

    printRatingResult(this.state.elements.APP_TWO.result[0]);
    executeRating(this.state.elements.APP_TWO.icon, this.state.elements.APP_TWO.result[0]);
  }
}

new StarRatings();
