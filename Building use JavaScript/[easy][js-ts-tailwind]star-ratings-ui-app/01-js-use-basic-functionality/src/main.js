/**
 * @fileoverview Этот файл содержит код для двух компонентов рейтинга:
 * 1. Компонент выбора продукта и установки рейтинга
 * 2. Компонент пользовательского рейтинга звездами
 *
 * Код включает в себя конфигурацию приложения, управление состоянием,
 * утилиты, создание HTML, инициализацию DOM элементов и логику компонентов.
 */

// Импорты стилей и библиотек
import './style.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

/**
 * Конфигурация приложения
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента
 * @property {Object} selectors - Селекторы для компонентов
 */
const APP_CONFIG = {
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

/**
 * Состояние приложения
 * @typedef {Object} AppState
 * @property {Object} elements - DOM элементы
 * @property {Object} APP_ONE_MOCK - Данные для первого компонента
 * @property {Object} APP_TWO_MOCK - Данные для второго компонента
 */
const APP_STATE = {
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

/**
 * Утилиты приложения
 * @typedef {Object} AppUtils
 * @property {Function} renderDataAttributes - Функция для рендеринга data-атрибутов
 * @property {Object} toastConfig - Конфигурация для уведомлений
 * @property {Function} showToast - Функция для отображения уведомлений
 */
const APP_UTILS = {
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
      ...APP_UTILS.toastConfig,
    }).showToast();
  },
};

/**
 * Создает HTML структуру приложения
 */
function createAppHTML() {
  const {
    root,
    selectors: { APP_ONE, APP_TWO },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
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
        ${APP_STATE.APP_ONE_MOCK.description.map(({
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
      ${APP_STATE.APP_ONE_MOCK.description
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
function initDOMElements() {
  APP_STATE.elements = {
    APP_ONE: {
      select: document.querySelector(`.rating01 ${APP_CONFIG.selectors.APP_ONE.select}`),
      input: document.querySelector(`.rating01 ${APP_CONFIG.selectors.APP_ONE.input}`),
    },
    APP_TWO: {
      icon: Array.from(
        document.querySelectorAll(`.rating02 ${APP_CONFIG.selectors.APP_TWO.icon}`),
      ),
      result: document.querySelectorAll(`.rating02 ${APP_CONFIG.selectors.APP_TWO.result}`),
    },
  };
}

/**
 * Инициализирует приложение
 */
function initApp() {
  createAppHTML();
  initDOMElements();
  initAppOne();
  initAppTwo();
}

/**
 * Инициализирует первый компонент (выбор продукта и установка рейтинга)
 */
function initAppOne() {
  /**
   * Обновляет отображение рейтингов
   */
  function getRatings() {
    Object.entries(APP_STATE.APP_ONE_MOCK.ratings).forEach(([rating, value]) => {
      const starPercentage = (value / APP_STATE.APP_ONE_MOCK.starsTotal) * 100;
      const roundedPercentage = Math.round(starPercentage / 10) * 10;
      const productElement = document.querySelector(
        `[data-product="${rating}"]`,
      );

      productElement.querySelector('.stars-inner').style.width =
        `${roundedPercentage}%`;
      productElement.querySelector('.number-rating').textContent = value;
    });
  }

  /**
   * Обрабатывает изменение выбранного продукта
   * @param {Event} event - Событие изменения
   */
  function handleSelectChange(event) {
    const selectedProduct = event.target.value;
    const ratingInput = APP_STATE.elements.APP_ONE.input;

    APP_STATE.APP_ONE_MOCK.product = selectedProduct;
    ratingInput.disabled = false;
    ratingInput.value = APP_STATE.APP_ONE_MOCK.ratings[selectedProduct].toFixed(1);
  }

  /**
   * Обрабатывает ввод нового рейтинга
   * @param {Event} event - Событие потери фокуса
   */
  function handleInputBlur(event) {
    const value = event.target.value;
    const rating = parseFloat(value);
    if (rating < 1 || rating > 5) {
      APP_UTILS.showToast('Rating must be between 1 and 5');
      return;
    }
    APP_STATE.APP_ONE_MOCK.ratings[APP_STATE.APP_ONE_MOCK.product] = rating;
    getRatings();
  }

  getRatings();
  APP_STATE.elements.APP_ONE.select.addEventListener('change', handleSelectChange);
  APP_STATE.elements.APP_ONE.input.addEventListener('blur', handleInputBlur);
}

/**
 * Инициализирует второй компонент (пользовательский рейтинг звездами)
 */
function initAppTwo() {
  /**
   * Отображает результат рейтинга
   * @param {HTMLElement} result - Элемент для отображения результата
   * @param {number} num - Значение рейтинга
   * @returns {string} Текст результата
   */
  function printRatingResult(result, num = 0) {
    return (result.textContent = `${num}/5`);
  }

  /**
   * Реализует функционал рейтинга звездами
   * @param {Array<HTMLElement>} stars - Массив элементов звезд
   * @param {HTMLElement} result - Элемент для отображения результата
   */
  function executeRating(stars, result) {
    const starClassActive = 'fa-solid fa-star';
    const starClassUnactive = 'fa-regular fa-star';
    const starsLength = stars.length;
    let i;
    stars.map((star) => {
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
  }

  printRatingResult(APP_STATE.elements.APP_TWO.result);
  executeRating(APP_STATE.elements.APP_TWO.icon, APP_STATE.elements.APP_TWO.result);
}

initApp();
