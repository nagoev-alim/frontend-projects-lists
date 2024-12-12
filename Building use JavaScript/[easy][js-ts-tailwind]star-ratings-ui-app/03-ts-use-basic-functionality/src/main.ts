/**
 * @fileoverview Модуль рейтинговой системы
 *
 * Этот модуль реализует две рейтинговые системы:
 * 1. Рейтинг продуктов с возможностью выбора и оценки.
 * 2. Пользовательская система рейтинга со звездами.
 *
 * Модуль использует TypeScript для типизации и включает в себя
 * конфигурацию приложения, управление состоянием и утилиты.
 */

import './style.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

/**
 * Интерфейс конфигурации приложения
 */
interface AppConfig {
  /** Корневой элемент приложения */
  root: string;
  /** Селекторы для различных элементов приложения */
  selectors: {
    [key: string]: {
      [key: string]: string;
    }
  };
}

/**
 * Конфигурация приложения
 */
const APP_CONFIG: AppConfig = {
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
 * Интерфейс состояния приложения
 */
interface AppState {
  /** DOM элементы */
  elements: {
    APP_ONE?: {
      select: HTMLSelectElement | null;
      input: HTMLInputElement | null;
    };
    APP_TWO?: {
      icon: HTMLElement[] | null;
      result: NodeListOf<Element>;
    };
  };
  /** Данные для первого приложения */
  APP_ONE_MOCK: {
    description: Array<{ name: string; value: string }>;
    ratings: { [key: string]: number };
    starsTotal: number;
    product: string | null;
  };
  /** Данные для второго приложения */
  APP_TWO_MOCK: {
    description: Array<{ name: string; value: number }>;
  };
}

/**
 * Состояние приложения
 */
const APP_STATE: AppState = {
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
 */
const APP_UTILS = {
  /**
   * Рендерит data-атрибуты для элемента
   * @param {string} element - Строка с data-атрибутом
   * @returns {string} Строка без квадратных скобок
   */
  renderDataAttributes: (element: string): string => element.slice(1, -1),

  /**
   * Конфигурация для всплывающих уведомлений
   */
  toastConfig: {
    className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
    duration: 3000,
    gravity: 'bottom',
    position: 'center',
  },

  /**
   * Показывает всплывающее уведомление
   * @param {string} message - Текст уведомления
   */
  showToast: (message: string): void => {
    // @ts-ignore
    Toastify({
      text: message,
      ...APP_UTILS.toastConfig,
    }).showToast();
  },
};

/**
 * Создает HTML-структуру приложения
 */
function createAppHTML(): void {
  const {
    root,
    selectors: { APP_ONE, APP_TWO },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector<HTMLElement>(root);

  if (!rootElement) return;

  rootElement.innerHTML = '';

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
 * Инициализирует DOM-элементы
 */
function initDOMElements(): void {
  APP_STATE.elements = {
    APP_ONE: {
      select: document.querySelector<HTMLSelectElement>(`.rating01 ${APP_CONFIG.selectors.APP_ONE.select}`),
      input: document.querySelector<HTMLInputElement>(`.rating01 ${APP_CONFIG.selectors.APP_ONE.input}`),
    },
    APP_TWO: {
      icon: Array.from(document.querySelectorAll<HTMLElement>(`.rating02 ${APP_CONFIG.selectors.APP_TWO.icon}`)),
      result: document.querySelectorAll(`.rating02 ${APP_CONFIG.selectors.APP_TWO.result}`),
    },
  };
}

/**
 * Инициализирует приложение
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();
  initAppOne();
  initAppTwo();
}

/**
 * Инициализирует первое приложение (рейтинг продуктов)
 */
function initAppOne(): void {
  /**
   * Обновляет рейтинги на странице
   */
  function getRatings(): void {
    Object.entries(APP_STATE.APP_ONE_MOCK.ratings).forEach(([rating, value]) => {
      const starPercentage = (value / APP_STATE.APP_ONE_MOCK.starsTotal) * 100;
      const roundedPercentage = Math.round(starPercentage / 10) * 10;
      const productElement = document.querySelector<HTMLElement>(`[data-product="${rating}"]`);

      if (productElement) {
        const starsInner = productElement.querySelector<HTMLElement>('.stars-inner');
        const numberRating = productElement.querySelector<HTMLElement>('.number-rating');

        if (starsInner) {
          starsInner.style.width = `${roundedPercentage}%`;
        }
        if (numberRating) {
          numberRating.textContent = value.toString();
        }
      }
    });
  }

  /**
   * Обрабатывает изменение выбора продукта
   * @param {Event} event - Событие изменения
   */
  function handleSelectChange(event: Event): void {
    const selectedProduct = (event.target as HTMLSelectElement).value;
    const ratingInput = APP_STATE.elements.APP_ONE?.input;

    if (ratingInput) {
      APP_STATE.APP_ONE_MOCK.product = selectedProduct;
      ratingInput.disabled = false;
      ratingInput.value = APP_STATE.APP_ONE_MOCK.ratings[selectedProduct].toFixed(1);
    }
  }

  /**
   * Обрабатывает потерю фокуса на поле ввода рейтинга
   * @param {Event} event - Событие потери фокуса
   */
  function handleInputBlur(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const rating = parseFloat(value);
    if (rating < 1 || rating > 5) {
      APP_UTILS.showToast('Rating must be between 1 and 5');
      return;
    }
    if (APP_STATE.APP_ONE_MOCK.product) {
      APP_STATE.APP_ONE_MOCK.ratings[APP_STATE.APP_ONE_MOCK.product] = rating;
      getRatings();
    }
  }

  getRatings();
  APP_STATE.elements.APP_ONE?.select?.addEventListener('change', handleSelectChange);
  APP_STATE.elements.APP_ONE?.input?.addEventListener('blur', handleInputBlur);
}

/**
 * Инициализирует второе приложение (пользовательская система рейтинга со звездами)
 *
 * Эта функция настраивает интерактивную систему рейтинга, позволяющую пользователям
 * выбирать оценку от 1 до 5 звезд. Она также отображает текущий выбранный рейтинг.
 */
function initAppTwo(): void {
  /**
   * Выводит результат рейтинга
   *
   * @param {Element} result - DOM элемент, в котором будет отображен результат
   * @param {number} num - Значение рейтинга (по умолчанию 0)
   * @returns {string} Строка с результатом рейтинга в формате "X/5"
   */
  function printRatingResult(result: Element, num: number = 0): string {
    return (result.textContent = `${num}/5`);
  }

  /**
   * Обрабатывает выставление рейтинга
   *
   * Эта функция добавляет обработчики событий для каждой звезды,
   * позволяя пользователю выбирать рейтинг. При клике на звезду,
   * все звезды до нее (включительно) становятся активными, а остальные неактивными.
   *
   * @param {HTMLElement[]} stars - Массив DOM элементов, представляющих звезды
   * @param {Element} result - DOM элемент для отображения текущего рейтинга
   */
  function executeRating(stars: HTMLElement[], result: Element): void {
    const starClassActive = 'fa-solid fa-star';
    const starClassUnactive = 'fa-regular fa-star';
    const starsLength = stars.length;
    let i: number;

    stars.forEach((star) => {
      star.addEventListener('click', () => {
        i = stars.indexOf(star);
        if (star.className.indexOf(starClassUnactive) !== -1) {
          // Если кликнули на неактивную звезду, активируем все до нее
          printRatingResult(result, i + 1);
          for (i; i >= 0; --i) stars[i].className = starClassActive;
        } else {
          // Если кликнули на активную звезду, деактивируем все после нее
          printRatingResult(result, i);
          for (i; i < starsLength; ++i) stars[i].className = starClassUnactive;
        }
      });
    });
  }

  // Инициализация рейтинговой системы, если элементы доступны
  if (APP_STATE.elements.APP_TWO?.result[0]) {
    printRatingResult(APP_STATE.elements.APP_TWO.result[0]);
    executeRating(APP_STATE.elements.APP_TWO.icon!, APP_STATE.elements.APP_TWO.result[0]);
  }
}

// Запуск приложения
initApp();
