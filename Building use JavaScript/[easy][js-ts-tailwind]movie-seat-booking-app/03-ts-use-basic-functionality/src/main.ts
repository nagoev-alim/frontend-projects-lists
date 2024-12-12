/**
 * Этот код реализует функциональность бронирования мест в кинотеатре.
 * Он позволяет пользователю выбирать фильм, места и отображает общую стоимость билетов.
 * Данные о выбранных местах и фильме сохраняются в локальном хранилище браузера.
 */

import './style.css';
import 'toastify-js/src/toastify.css';

/**
 * Интерфейс для конфигурации приложения
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента
 * @property {Object} selectors - Объект с селекторами элементов
 */
interface AppConfig {
  root: string;
  selectors: {
    movieSelect: string;
    seatContainer: string;
    seatCount: string;
    seats: string;
    totalPrice: string;
  };
}

/**
 * Конфигурация приложения
 * @type {AppConfig}
 */
const APP_CONFIG: AppConfig = {
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
 * Интерфейс для состояния приложения
 * @typedef {Object} AppState
 * @property {Object} elements - Объект с DOM элементами
 * @property {number|null} ticketPrice - Цена билета
 */
interface AppState {
  elements: {
    movieSelect: HTMLSelectElement | null;
    seatContainer: HTMLElement | null;
    seatCount: HTMLElement | null;
    seats: HTMLElement[] | null;
    totalPrice: HTMLElement | null;
  };
  ticketPrice: number | null;
}

/**
 * Состояние приложения
 * @type {AppState}
 */
const APP_STATE: AppState = {
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
 * Интерфейс для утилит приложения
 * @typedef {Object} AppUtils
 * @property {Function} renderDataAttributes - Функция для рендеринга data-атрибутов
 */
interface AppUtils {
  renderDataAttributes: (element: string) => string;
}

/**
 * Утилиты приложения
 * @type {AppUtils}
 */
const APP_UTILS: AppUtils = {
  renderDataAttributes: (element: string) => element.slice(1, -1),
};

/**
 * Создает HTML структуру приложения
 */
function createAppHTML(): void {
  const { root, selectors } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector(root);

  if (!rootElement) return;

  const createSeatRow = (row: number) => {
    const createSeat = (index: number) => {
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
        ${Array(6).fill('').map((_, i) => createSeatRow(i)).join('')}
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
function initDOMElements(): void {
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
function initApp(): void {
  createAppHTML();
  initDOMElements();
  APP_STATE.ticketPrice = Number(APP_STATE.elements.movieSelect?.value);
  localStorageGetData();
  updateSelectedSeatsAndPrice();
  APP_STATE.elements.seatContainer?.addEventListener('click', handleSeatContainerClick);
  APP_STATE.elements.movieSelect?.addEventListener('change', handleMovieSelectChange);
}

/**
 * Получает данные из локального хранилища и обновляет состояние приложения
 */
function localStorageGetData(): void {
  const seats = JSON.parse(localStorage.getItem('seats') || '[]');
  const movieIndex = localStorage.getItem('movieIndex');

  if (seats.length) {
    APP_STATE.elements.seats
      ?.filter((_, index) => seats.includes(index))
      .forEach(seat => seat.classList.add('selected'));
  }

  if (movieIndex !== null) {
    APP_STATE.elements.movieSelect!.selectedIndex = Number(movieIndex);
  }
}

/**
 * Обновляет информацию о выбранных местах и общей стоимости
 */
function updateSelectedSeatsAndPrice(): void {
  if (!APP_STATE.ticketPrice) return;

  const selectedSeats: HTMLDivElement[] = Array.from(document.querySelectorAll('.row .seat.selected'));
  const selectedSeatsIndexes: number[] = selectedSeats
    .map(seat => APP_STATE.elements.seats?.indexOf(seat))
    .filter((index): index is number => index !== undefined);

  localStorage.setItem('seats', JSON.stringify(selectedSeatsIndexes));

  const selectedSeatsCount: number = selectedSeats.length;

  if (APP_STATE.elements.seatCount) {
    APP_STATE.elements.seatCount.textContent = selectedSeatsCount.toString();
  }

  if (APP_STATE.elements.totalPrice) {
    APP_STATE.elements.totalPrice.textContent = (selectedSeatsCount * APP_STATE.ticketPrice).toFixed(2);
  }
}

/**
 * Обрабатывает клик по контейнеру с местами
 * @param {Event} event - Событие клика
 */
function handleSeatContainerClick(event: Event): void {
  const target = event.target as HTMLDivElement;
  if (target.matches('.seat:not(.occupied)')) {
    target.classList.toggle('selected');
    updateSelectedSeatsAndPrice();
  }
}

/**
 * Сохраняет индекс выбранного фильма в локальное хранилище
 * @param {string} selectedIndex - Индекс выбранного фильма
 */
function localStorageSetData(selectedIndex: string): void {
  localStorage.setItem('movieIndex', selectedIndex);
}

/**
 * Обрабатывает изменение выбранного фильма
 * @param {Event} event - Событие изменения
 */
function handleMovieSelectChange(event: Event):void {
  const target = event.target as HTMLSelectElement;
  APP_STATE.ticketPrice = Number(target.value);
  localStorageSetData(String(target.selectedIndex));
  updateSelectedSeatsAndPrice();
}

initApp();
