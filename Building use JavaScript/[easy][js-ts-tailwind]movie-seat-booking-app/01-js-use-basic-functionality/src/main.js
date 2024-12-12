/**
 * Этот код реализует функциональность бронирования мест в кинотеатре.
 * Он позволяет пользователям выбирать фильм, бронировать места, отображает общую стоимость
 * и сохраняет выбор в локальном хранилище браузера.
 */

import './style.css';
import 'toastify-js/src/toastify.css';

/**
 * Конфигурация приложения
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента
 * @property {Object} selectors - Объект с селекторами элементов
 */
const APP_CONFIG = {
  root: '#app',
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
 * @typedef {Object} AppState
 * @property {Object} elements - Объект с DOM элементами
 * @property {number|null} ticketPrice - Цена билета
 */
const APP_STATE = {
  elements: {
    movieSelect: null,
    seatContainer: null,
    seatCount: null,
    seats: null,
    totalPrice: null,
  },
  ticketPrice: null,
};

/**
 * Утилиты приложения
 * @typedef {Object} AppUtils
 * @property {function} renderDataAttributes - Функция для рендеринга data-атрибутов
 */
const APP_UTILS = {
  /**
   * Удаляет квадратные скобки из строки с data-атрибутом
   * @param {string} element - Строка с data-атрибутом
   * @returns {string} Строка без квадратных скобок
   */
  renderDataAttributes: (element) => element.slice(1, -1),
};

/**
 * Создает HTML структуру приложения
 */
function createAppHTML() {
  const { root, selectors } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector(root);

  if (!rootElement) return;

  /**
   * Создает ряд сидений
   * @param {number} row - Номер ряда
   * @returns {string} HTML строка с рядом сидений
   */
  const createSeatRow = (row) => {
    /**
     * Создает отдельное сиденье
     * @param {number} index - Индекс сиденья в ряду
     * @returns {string} HTML строка с сиденьем
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
 * Инициализирует DOM элементы в состоянии приложения
 */
function initDOMElements() {
  APP_STATE.elements = {
    movieSelect: document.querySelector(APP_CONFIG.selectors.movieSelect),
    seatContainer: document.querySelector(APP_CONFIG.selectors.seatContainer),
    seatCount: document.querySelector(APP_CONFIG.selectors.seatCount),
    seats: Array.from(document.querySelectorAll(APP_CONFIG.selectors.seats)),
    totalPrice: document.querySelector(APP_CONFIG.selectors.totalPrice),
  };
}

/**
 * Инициализирует приложение
 */
function initApp() {
  createAppHTML();
  initDOMElements();
  APP_STATE.ticketPrice = Number(APP_STATE.elements.movieSelect.value);
  localStorageGetData();
  updateSelectedSeatsAndPrice();
  APP_STATE.elements.seatContainer.addEventListener('click', handleSeatContainerClick);
  APP_STATE.elements.movieSelect.addEventListener('change', handleMovieSelectChange);
}

/**
 * Получает данные из локального хранилища и применяет их
 */
function localStorageGetData() {
  const seats = JSON.parse(localStorage.getItem('seats') || '[]');
  const movieIndex = localStorage.getItem('movieIndex');

  if (seats.length) {
    APP_STATE.elements.seats
      .filter((_, index) => seats.includes(index))
      .forEach(seat => seat.classList.add('selected'));
  }

  if (movieIndex !== null) {
    APP_STATE.elements.movieSelect.selectedIndex = Number(movieIndex);
  }
}

/**
 * Обновляет информацию о выбранных местах и общей стоимости
 */
function updateSelectedSeatsAndPrice() {
  const selectedSeats = document.querySelectorAll('.row .seat.selected');
  const selectedSeatsIndexes = Array.from(selectedSeats, seat => APP_STATE.elements.seats.indexOf(seat));
  
  localStorage.setItem('seats', JSON.stringify(selectedSeatsIndexes));
  
  const selectedSeatsCount = selectedSeats.length;
  APP_STATE.elements.seatCount.textContent = selectedSeatsCount;
  APP_STATE.elements.totalPrice.textContent = (selectedSeatsCount * APP_STATE.ticketPrice).toFixed(2);
}

/**
 * Обработчик клика по контейнеру с сиденьями
 * @param {Event} event - Объект события клика
 */
function handleSeatContainerClick({ target }) {
  if (target.matches('.seat:not(.occupied)')) {
    target.classList.toggle('selected');
    updateSelectedSeatsAndPrice();
  }
}

/**
 * Сохраняет индекс выбранного фильма в локальное хранилище
 * @param {number} selectedIndex - Индекс выбранного фильма
 */
function localStorageSetData(selectedIndex) {
  localStorage.setItem('movieIndex', selectedIndex);
}

/**
 * Обработчик изменения выбранного фильма
 * @param {Event} event - Объект события изменения
 */
function handleMovieSelectChange({ target: { selectedIndex, value } }) {
  APP_STATE.ticketPrice = Number(value);
  localStorageSetData(selectedIndex);
  updateSelectedSeatsAndPrice();
}

initApp();
