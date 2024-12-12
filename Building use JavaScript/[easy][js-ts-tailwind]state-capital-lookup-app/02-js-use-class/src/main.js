/**
 * Этот код реализует приложение для поиска информации о штатах США.
 * Пользователь может ввести название или аббревиатуру штата,
 * и приложение отобразит соответствующую информацию, включая столицу и координаты.
 */

import './style.css';
import mockData from './mock';

/**
 * Класс, представляющий приложение для поиска информации о столицах штатов.
 */
class StateCapitalLookup {
  /**
   * Создает экземпляр приложения StateCapitalLookup.
   */
  constructor() {
    /**
     * Конфигурация приложения.
     * @type {Object}
     */
    this.config = {
      /** @type {string} Селектор корневого элемента */
      root: '#app',
      /** @type {Object} Селекторы для элементов ввода и списка результатов */
      selectors: {
        stateInput: '[data-state-input]',
        resultsList: '[data-results-list]',
      },
    };

    /**
     * Состояние приложения.
     * @type {Object}
     */
    this.state = {
      /** @type {Object} DOM элементы */
      elements: {
        stateInput: null,
        resultsList: null,
      },
      /** @type {Array} Массив совпадений при поиске */
      matches: [],
    };

    /**
     * Утилиты приложения.
     * @type {Object}
     */
    this.utils = {
      /**
       * Рендерит data-атрибуты.
       * @param {string} element - Строка с data-атрибутом
       * @returns {string} Отрендеренный data-атрибут
       */
      renderDataAttributes: (element) => element.slice(1, -1),

      /**
       * Реализует debounce для функции.
       * @param {Function} func - Функция для debounce
       * @param {number} delay - Задержка в миллисекундах
       * @returns {Function} Функция с debounce
       */
      debounce: (func, delay) => {
        let timeoutId;
        return function(...args) {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
      },
    };

    this.init();
  }

  /**
   * Создает HTML структуру приложения.
   */
  createAppHTML() {
    const { root, selectors: { stateInput, resultsList } } = this.config;
    const { renderDataAttributes } = this.utils;
    const rootElement = document.querySelector(root);

    if (!rootElement) return;

    rootElement.innerHTML = `
    <div class='w-full max-w-md grid gap-4 rounded border bg-white p-3 shadow'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>State Capital Lookup</h1>
      <input
        class='rounded border-2 bg-slate-50 px-3 py-2.5 focus:border-blue-400 focus:outline-none'
        type='text'
        placeholder='Enter state name or abbreviation...'
        ${renderDataAttributes(stateInput)}
      >
      <ul class='grid gap-3' ${renderDataAttributes(resultsList)}></ul>
    </div>
  `;
  }

  /**
   * Инициализирует DOM элементы.
   */
  initDOMElements() {
    this.state.elements = {
      stateInput: document.querySelector(this.config.selectors.stateInput),
      resultsList: document.querySelector(this.config.selectors.resultsList),
    };
  }

  /**
   * Инициализирует приложение.
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();

    this.state.elements.stateInput.addEventListener('input', this.utils.debounce(this.handleStateInputChange.bind(this), 300));
  }

  /**
   * Обрабатывает изменение ввода в поле поиска.
   * @param {Event} event - Событие ввода
   */
  handleStateInputChange({ target: { value } }) {
    const searchValue = value.toLowerCase();
    this.state.matches = searchValue
      ? mockData.filter(({ name, abbr }) => {
        const regex = new RegExp(`^${searchValue}`, 'i');
        return regex.test(name.toLowerCase()) || regex.test(abbr.toLowerCase());
      })
      : [];

    this.updateResultsList(searchValue);
  }

  /**
   * Обновляет список результатов.
   * @param {string} searchValue - Введенное значение поиска
   */
  updateResultsList(searchValue) {
    if (this.state.matches.length > 0) {
      this.state.elements.resultsList.innerHTML = this.state.matches.map(this.createListItem).join('');
    } else {
      this.state.elements.resultsList.innerHTML = searchValue
        ? `<li class='text-center font-bold'>No matches</li>`
        : '';
    }
  }

  /**
   * Создает элемент списка для отображения информации о штате.
   * @param {Object} state - Объект с информацией о штате
   * @returns {string} HTML строка для элемента списка
   */
  createListItem({ name, abbr, capital, lat, long }) {
    return `
    <li class='border-2 bg-gray-50 rounded grid place-items-center p-3 text-center gap-1.5'>
      <h5 class='font-bold'>${name} (${abbr}):</h5>
      <div class='grid gap-1.5'>
        <p>${capital}</p>
        <p>Lat: ${lat} / Long: ${long}</p>
      </div>
    </li>`;
  }
}

new StateCapitalLookup();