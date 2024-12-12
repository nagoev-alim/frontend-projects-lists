/**
 * Этот код реализует функциональность бронирования мест в кинотеатре.
 * Он позволяет пользователям выбирать фильм, места и отображает общую стоимость билетов.
 * Данные о выбранных местах и фильме сохраняются в локальном хранилище браузера.
 */

import './style.css';

/**
 * Класс, представляющий систему бронирования мест в кинотеатре
 */
class MovieSeatBooking {
  /**
   * Создает экземпляр MovieSeatBooking
   */
  constructor() {
    /**
     * Конфигурация приложения
     * @type {Object}
     */
    this.config = {
      /** @type {string} Корневой элемент приложения */
      root: '#app',
      /** @type {Object} Селекторы для различных элементов DOM */
      selectors: {
        movieSelect: '[data-movie-select]',
        seatContainer: '[data-seat-container]',
        seatCount: '[data-seat-count]',
        seats: '.row .seat:not(.occupied)',
        totalPrice: '[data-total-price]',
      },
    };

    /**
     * Состояние приложения
     * @type {Object}
     */
    this.state = {
      /** @type {Object} Элементы DOM */
      elements: {
        movieSelect: null,
        seatContainer: null,
        seatCount: null,
        seats: null,
        totalPrice: null,
      },
      /** @type {number|null} Цена билета */
      ticketPrice: null,
    };

    /**
     * Вспомогательные функции
     * @type {Object}
     */
    this.utils = {
      /**
       * Обрабатывает строку с data-атрибутами
       * @param {string} element - Строка с data-атрибутом
       * @returns {string} Обработанная строка
       */
      renderDataAttributes: (element) => element.slice(1, -1),
    };

    this.init();
  }

  /**
   * Создает HTML-структуру приложения
   */
  createAppHTML() {
    const { root, selectors } = this.config;
    const { renderDataAttributes } = this.utils;
    const rootElement = document.querySelector(root);

    if (!rootElement) return;

    /**
     * Создает ряд сидений
     * @param {number} row - Номер ряда
     * @returns {string} HTML-разметка ряда сидений
     */
    const createSeatRow = (row) => {
      /**
       * Создает отдельное сиденье
       * @param {number} index - Индекс сиденья в ряду
       * @returns {string} HTML-разметка сиденья
       */
      const createSeat = (index) => {
        const isOccupied = (row === 1 && (index === 3 || index === 4)) ||
          (row === 2 && (index === 6 || index === 7)) ||
          (row === 4 && (index === 3 || index === 4)) ||
          (row === 5 && (index === 4 || index === 5 || index === 6));
        return `<button class='seat${isOccupied ? ' occupied' : ''}'></button>`;
      };
      return `<div class='row grid grid-cols-8 gap-2.5 justify-items-center'>${Array(8).fill().map((_, i) => createSeat(i)).join('')}</div>`;
    };

    rootElement.innerHTML = `
    <div class='seat-booking grid max-w-md gap-4 rounded border bg-white p-3 shadow w-full'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>Movie Seat Booking</h1>

      <div class='header'>
        <label class='grid gap-1'>
          <span class='text-sm font-medium'>Pick a movie:</span>
          <select class='w-full rounded border bg-slate-50 px-3 py-2 focus:border-blue-400 focus:outline-none' ${renderDataAttributes(selectors.movieSelect)}>
            ${['The Guard ($10)', 'Harry Potter ($12)', 'Detachment ($8)', 'Sing Street ($9)']
      .map((movie, i) => `<option value='${[10, 12, 8, 9][i]}'>${movie}</option>`).join('')}
          </select>
        </label>
      </div>

      <ul class='grid grid-cols-3 gap-2'>
        ${['N/A', 'Selected', 'Occupied'].map((text, i) => `
          <li class='flex items-center gap-2'>
            <div class='seat ${i === 1 ? 'selected' : ''} ${i === 2 ? 'occupied' : ''}'></div>
            <small>${text}</small>
          </li>
        `).join('')}
      </ul>

      <div class='container grid justify-center gap-3' ${renderDataAttributes(selectors.seatContainer)}>
        <div class='screen'></div>
        ${Array(6).fill().map((_, i) => createSeatRow(i)).join('')}
      </div>

      <p class='text-center'>
        You have selected <span class='font-bold' ${renderDataAttributes(selectors.seatCount)}>0</span> seats for a price of $<span class='font-bold' ${renderDataAttributes(selectors.totalPrice)}>0</span>
      </p>
    </div>
  `;
  }

  /**
   * Инициализирует DOM-элементы
   */
  initDOMElements() {
    this.state.elements = {
      movieSelect: document.querySelector(this.config.selectors.movieSelect),
      seatContainer: document.querySelector(this.config.selectors.seatContainer),
      seatCount: document.querySelector(this.config.selectors.seatCount),
      seats: Array.from(document.querySelectorAll(this.config.selectors.seats)),
      totalPrice: document.querySelector(this.config.selectors.totalPrice),
    };
  }

  /**
   * Инициализирует приложение
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();
    this.state.ticketPrice = Number(this.state.elements.movieSelect.value);
    this.localStorageGetData();
    this.updateSelectedSeatsAndPrice();
    this.state.elements.seatContainer.addEventListener('click', this.handleSeatContainerClick.bind(this));
    this.state.elements.movieSelect.addEventListener('change', this.handleMovieSelectChange.bind(this));
  }

  /**
   * Получает данные из локального хранилища
   */
  localStorageGetData() {
    const seats = JSON.parse(localStorage.getItem('seats') || '[]');
    const movieIndex = localStorage.getItem('movieIndex');

    if (seats.length) {
      this.state.elements.seats
        .filter((_, index) => seats.includes(index))
        .forEach(seat => seat.classList.add('selected'));
    }

    if (movieIndex !== null) {
      this.state.elements.movieSelect.selectedIndex = Number(movieIndex);
    }
  }

  /**
   * Обновляет информацию о выбранных местах и общей стоимости
   */
  updateSelectedSeatsAndPrice() {
    const selectedSeats = document.querySelectorAll('.row .seat.selected');
    const selectedSeatsIndexes = Array.from(selectedSeats, seat => this.state.elements.seats.indexOf(seat));

    localStorage.setItem('seats', JSON.stringify(selectedSeatsIndexes));

    const selectedSeatsCount = selectedSeats.length;
    this.state.elements.seatCount.textContent = selectedSeatsCount;
    this.state.elements.totalPrice.textContent = (selectedSeatsCount * this.state.ticketPrice).toFixed(2);
  }

  /**
   * Обрабатывает клик по контейнеру с сиденьями
   * @param {Event} event - Событие клика
   */
  handleSeatContainerClick({ target }) {
    if (target.matches('.seat:not(.occupied)')) {
      target.classList.toggle('selected');
      this.updateSelectedSeatsAndPrice();
    }
  }

  /**
   * Сохраняет индекс выбранного фильма в локальное хранилище
   * @param {number} selectedIndex - Индекс выбранного фильма
   */
  localStorageSetData(selectedIndex) {
    localStorage.setItem('movieIndex', selectedIndex);
  }

  /**
   * Обрабатывает изменение выбранного фильма
   * @param {Event} event - Событие изменения
   */
  handleMovieSelectChange({ target: { selectedIndex, value } }) {
    this.state.ticketPrice = Number(value);
    this.localStorageSetData(selectedIndex);
    this.updateSelectedSeatsAndPrice();
  }
}

new MovieSeatBooking();
