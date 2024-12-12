/**
 * Этот код реализует функционал бронирования мест в кинотеатре.
 * Он позволяет пользователю выбирать фильм, места и отображает общую стоимость билетов.
 * Данные о выбранных местах и фильме сохраняются в локальном хранилище браузера.
 */

import './style.css';
import 'toastify-js/src/toastify.css';

/**
 * Интерфейс для конфигурации приложения
 */
interface AppConfig {
  /** Корневой элемент приложения */
  root: string;
  /** Селекторы для различных элементов DOM */
  selectors: {
    /** Селектор для выбора фильма */
    movieSelect: string;
    /** Селектор для контейнера мест */
    seatContainer: string;
    /** Селектор для отображения количества выбранных мест */
    seatCount: string;
    /** Селектор для всех мест */
    seats: string;
    /** Селектор для отображения общей стоимости */
    totalPrice: string;
  };
}

/**
 * Интерфейс для состояния приложения
 */
interface AppState {
  /** Элементы DOM */
  elements: {
    /** Элемент выбора фильма */
    movieSelect: HTMLSelectElement | null;
    /** Контейнер мест */
    seatContainer: HTMLElement | null;
    /** Элемент отображения количества выбранных мест */
    seatCount: HTMLElement | null;
    /** Массив всех мест */
    seats: HTMLElement[] | null;
    /** Элемент отображения общей стоимости */
    totalPrice: HTMLElement | null;
  };
  /** Цена билета */
  ticketPrice: number | null;
}

/**
 * Интерфейс для утилит приложения
 */
interface AppUtils {
  /** Функция для рендеринга data-атрибутов */
  renderDataAttributes: (element: string) => string;
}

/**
 * Класс для управления бронированием мест в кинотеатре
 */
class MovieSeatBooking {
  /** Конфигурация приложения */
  private readonly config: AppConfig;
  /** Состояние приложения */
  private state: AppState;
  /** Утилиты приложения */
  private readonly utils: AppUtils;

  /**
   * Конструктор класса MovieSeatBooking
   */
  constructor() {
    this.config = {
      root: '#app',
      selectors: {
        movieSelect: '[data-movie-select]',
        seatContainer: '[data-seat-container]',
        seatCount: '[data-seat-count]',
        seats: '.row .seat:not(.occupied)',
        totalPrice: '[data-total-price]',
      },
    };

    this.state = {
      elements: {
        movieSelect: null,
        seatContainer: null,
        seatCount: null,
        seats: null,
        totalPrice: null,
      },
      ticketPrice: null,
    };

    this.utils = {
      renderDataAttributes: (element) => element.slice(1, -1),
    };

    this.init();
  }

  /**
   * Создает HTML структуру приложения
   */
  private createAppHTML(): void {
    const { root, selectors } = this.config;
    const { renderDataAttributes } = this.utils;
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
      return `<div class='row grid grid-cols-8 gap-2.5 justify-items-center'>${Array(8).fill('').map((_, i) => createSeat(i)).join('')}</div>`;
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
   * Инициализирует DOM элементы
   */
  private initDOMElements(): void {
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
  private init(): void {
    this.createAppHTML();
    this.initDOMElements();
    this.state.ticketPrice = Number(this.state.elements.movieSelect?.value);
    this.localStorageGetData();
    this.updateSelectedSeatsAndPrice();
    this.state.elements.seatContainer?.addEventListener('click', this.handleSeatContainerClick.bind(this));
    this.state.elements.movieSelect?.addEventListener('change', this.handleMovieSelectChange.bind(this));
  }

  /**
   * Получает данные из локального хранилища
   */
  private localStorageGetData(): void {
    const seats = JSON.parse(localStorage.getItem('seats') || '[]');
    const movieIndex = localStorage.getItem('movieIndex');

    if (seats.length && this.state.elements.seats) {
      this.state.elements.seats
        .filter((_, index) => seats.includes(index))
        .forEach(seat => seat.classList.add('selected'));
    }

    if (movieIndex !== null && this.state.elements.movieSelect) {
      this.state.elements.movieSelect.selectedIndex = Number(movieIndex);
    }
  }

  /**
   * Обновляет информацию о выбранных местах и общей стоимости
   */
  private updateSelectedSeatsAndPrice(): void {
    const selectedSeats: HTMLElement[] = Array.from(document.querySelectorAll('.row .seat.selected')) as HTMLElement[];
    const selectedSeatsIndexes: number[] = Array.from(selectedSeats, (seat: Element) =>
      this.state.elements.seats?.indexOf(seat as HTMLElement) ?? -1,
    );

    localStorage.setItem('seats', JSON.stringify(selectedSeatsIndexes));

    const selectedSeatsCount: number = selectedSeats.length;

    if (this.state.elements.seatCount) {
      this.state.elements.seatCount.textContent = selectedSeatsCount.toString();
    }

    if (this.state.elements.totalPrice && this.state.ticketPrice !== null) {
      this.state.elements.totalPrice.textContent = (selectedSeatsCount * this.state.ticketPrice).toFixed(2);
    }
  }

  /**
   * Обрабатывает клик по контейнеру мест
   * @param event - Событие клика
   */
  private handleSeatContainerClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (target.matches('.seat:not(.occupied)')) {
      target.classList.toggle('selected');
      this.updateSelectedSeatsAndPrice();
    }
  }

  /**
   * Сохраняет индекс выбранного фильма в локальное хранилище
   * @param selectedIndex - Индекс выбранного фильма
   */
  private localStorageSetData(selectedIndex: string): void {
    localStorage.setItem('movieIndex', selectedIndex);
  }

  /**
   * Обрабатывает изменение выбранного фильма
   * @param event - Событие изменения
   */
  private handleMovieSelectChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.state.ticketPrice = Number(target.value);
    this.localStorageSetData(target.selectedIndex.toString());
    this.updateSelectedSeatsAndPrice();
  }
}

new MovieSeatBooking();
