/**
 * Этот код представляет собой класс MoviesFinder, который реализует функциональность
 * поиска и отображения информации о фильмах. Он использует API для получения данных
 * о фильмах, отображает их в виде списка, позволяет осуществлять поиск по ключевым
 * словам и просматривать детальную информацию о выбранном фильме.
 */

import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios, { AxiosInstance } from 'axios';
import feather from 'feather-icons';

/**
 * Интерфейс для конфигурации приложения
 */
interface Config {
  /** Корневой элемент приложения */
  root: string;
  /** Селекторы для различных элементов DOM */
  selectors: {
    searchForm: string;
    movieList: string;
    loadMore: string;
    modalOverlay: string;
    modalContent: string;
  };
  /** Запрос для поиска по ключевому слову */
  keywordQuery: string;
  /** Запрос для получения топ фильмов */
  topQuery: string;
  /** Конфигурация для Axios */
  axiosConfig: {
    baseURL: string;
    headers: {
      'X-API-KEY': string;
      'Content-Type': string;
    };
  };
}

/**
 * Интерфейс для состояния приложения
 */
interface State {
  /** Элементы DOM */
  elements: {
    searchForm: HTMLFormElement | null;
    movieList: HTMLUListElement | null;
    loadMore: HTMLButtonElement | null;
    modalOverlay: HTMLDivElement | null;
    modalContent: HTMLElement | null;
  };
  /** Тип текущего запроса */
  queryType: string;
  /** Текущая страница результатов */
  currentPage: number;
  /** Массив фильмов */
  movies: Movie[];
  /** Общее количество страниц */
  countPage: number | null;
}

/**
 * Интерфейс для утилит
 */
interface Utils {
  /** Функция для рендеринга атрибутов данных */
  renderDataAttributes: (element: string) => string;
  /** Конфигурация для уведомлений */
  toastConfig: {
    className: string;
    duration: number;
    gravity: string;
    position: string;
  };
  /** Функция для отображения уведомления */
  showToast: (message: string) => void;
  /** Функция для обработки ошибок */
  handleError: (message: string, error?: Error) => void;
  /** Экземпляр Axios */
  axiosInstance: AxiosInstance;
}

/**
 * Интерфейс для фильма
 */
interface Movie {
  /** Название фильма на английском */
  nameEn: string;
  /** Название фильма на русском */
  nameRu: string;
  /** Рейтинг фильма */
  rating: string;
  /** URL постера фильма */
  posterUrl: string;
  /** ID фильма */
  filmId: string;
}

/**
 * Класс MoviesFinder для поиска и отображения фильмов
 */
class MoviesFinder {
  /** Конфигурация приложения */
  private readonly config: Config;
  /** Состояние приложения */
  private state: State;
  /** Утилиты */
  private readonly utils: Utils;

  /**
   * Конструктор класса MoviesFinder
   */
  constructor() {
    this.config = {
      root: '#app',
      selectors: {
        searchForm: '[data-search-form]',
        movieList: '[data-movie-list]',
        loadMore: '[data-load-more]',
        modalOverlay: '[data-modal-overlay]',
        modalContent: '[data-modal-content]',
      },
      keywordQuery: 'search-by-keyword?keyword=',
      topQuery: 'top?type=TOP_250_BEST_FILMS',
      axiosConfig: {
        baseURL: 'https://kinopoiskapiunofficial.tech/api/v2.1/films/',
        headers: {
          'X-API-KEY': 'acda60f6-b930-4677-b4fe-add4a929410a',
          'Content-Type': 'application/json',
        },
      },
    };

    this.state = {
      elements: {
        searchForm: null,
        movieList: null,
        loadMore: null,
        modalOverlay: null,
        modalContent: null,
      },
      queryType: '',
      currentPage: 1,
      movies: [],
      countPage: null,
    };

    this.utils = {
      renderDataAttributes: (element: string): string => element.slice(1, -1),

      toastConfig: {
        className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
        duration: 3000,
        gravity: 'bottom',
        position: 'center',
      },

      showToast: (message: string): void => {
        // @ts-ignore
        Toastify({
          text: message,
          ...this.utils.toastConfig,
        }).showToast();
      },

      handleError: (message: string, error: Error | null = null): void => {
        this.utils.showToast(message);
        if (error) console.error(message, error);
      },

      axiosInstance: axios.create(this.config.axiosConfig),
    };

    this.init();
  }

  /**
   * Создает HTML структуру приложения
   */
  private createAppHTML(): void {
    const {
      root,
      selectors: {
        searchForm,
        movieList,
        loadMore,
        modalOverlay,
        modalContent,
      },
    } = this.config;
    const { renderDataAttributes } = this.utils;
    const rootElement = document.querySelector(root);

    if (!rootElement) return;

    rootElement.innerHTML = `
      <div class='mx-auto grid w-full max-w-7xl items-start gap-2'>
        <header class='w-full rounded border bg-white p-3 shadow sm:grid-cols-[auto_300px] sm:place-items-baseline grid place-items-center gap-3'>
          <h2>
            <a class='font-bold' href='/'>Cinema Finder</a>
          </h2>
          <form class='w-full' ${renderDataAttributes(searchForm)}>
            <label>
              <input class='w-full rounded border bg-slate-50 px-3 py-2 focus:border-blue-400 focus:outline-none' name='query' placeholder='Enter name' type='search'>
            </label>
          </form>
        </header>
      
        <main class='grid gap-4'>
          <ul class='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4' ${renderDataAttributes(movieList)}></ul>
          <div class='flex justify-center'>
            <button class='hidden border px-3 py-2 hover:bg-slate-50' ${renderDataAttributes(loadMore)}>More</button>
          </div>
        </main>
      
        <div class='fixed left-0 right-0 top-0 bottom-0 grid h-full w-full place-items-center bg-neutral-900/40 p-3 hidden' ${renderDataAttributes(modalOverlay)}>
          <section class='w-full max-w-lg rounded bg-white p-3 grid gap-3' ${renderDataAttributes(modalContent)}></section>
        </div>
      </div>
    `;
  }

  /**
   * Инициализирует DOM элементы
   */
  private initDOMElements(): void {
    this.state.elements = {
      searchForm: document.querySelector<HTMLFormElement>(this.config.selectors.searchForm),
      movieList: document.querySelector<HTMLUListElement>(this.config.selectors.movieList),
      loadMore: document.querySelector<HTMLButtonElement>(this.config.selectors.loadMore),
      modalOverlay: document.querySelector<HTMLDivElement>(this.config.selectors.modalOverlay),
      modalContent: document.querySelector<HTMLElement>(this.config.selectors.modalContent),
    };
  }

  /**
   * Инициализирует приложение
   */
  private init(): void {
    this.createAppHTML();
    this.initDOMElements();
    (async () => {
      this.state.queryType = this.config.topQuery;
      await this.getMovies(this.state.queryType);
      this.state.elements.searchForm?.addEventListener('submit', this.handleSearchFormSubmit.bind(this));
      this.state.elements.movieList?.addEventListener('click', this.handleMovieListClick.bind(this));
      this.state.elements.modalOverlay?.addEventListener('click', this.handleModalOverlayClick.bind(this));
      document.addEventListener('keydown', this.handleModalOverlayClick.bind(this));
      this.state.elements.loadMore?.addEventListener('click', this.handleLoadMoreClick.bind(this));
    })();
  }

  /**
   * Получает фильмы по заданному URL
   * @param {string} url - URL для запроса фильмов
   */
  private async getMovies(url: string): Promise<void> {
    try {
      if (this.state.elements.movieList) {
        this.state.elements.movieList.innerHTML = `<p class='font-medium text-lg'>Loading...</p>`;
      }
      const { films, pagesCount } = await this.fetchTopMoviesData(url);

      if (films.length === 0) {
        this.utils.showToast('Nothing found, you will be redirect to home page');
        setTimeout(() => location.reload(), 4000);
        return;
      }

      this.state.movies = films;
      this.state.countPage = pagesCount;

      this.renderMovies(this.state.movies);
    } catch (error) {
      this.utils.handleError('An error occurred while fetching data.', error as Error);
    }
  }

  /**
   * Получает данные о топовых фильмах
   * @param {string} url - URL для запроса данных
   * @returns {Promise<{films: Movie[], pagesCount: number}>} - Промис с данными о фильмах и количеством страниц
   */
  private async fetchTopMoviesData(url: string): Promise<{ films: Movie[], pagesCount: number }> {
    const { data } = await this.utils.axiosInstance.get(`${url}&page=${this.state.currentPage}`);
    return { films: data.films, pagesCount: data.pagesCount };
  }

  /**
   * Рендерит фильмы на странице
   * @param {Movie[]} movies - Массив фильмов для рендеринга
   */
  private renderMovies(movies: Movie[]): void {
    if (this.state.elements.movieList) {
      this.state.elements.movieList.innerHTML = movies.map(this.createMovieCard).join('');
    }
    if (this.state.elements.loadMore) {
      this.state.elements.loadMore.className = `px-3 py-2 border bg-white hover:bg-slate-50 ${this.state.currentPage < (this.state.countPage || 0) ? '' : 'hidden'}`;
    }
  }

  /**
   * Создает HTML карточку для фильма
   * @param {Movie} param0 - Объект с данными о фильме
   * @returns {string} - HTML строка карточки фильма
   */
  private createMovieCard({ nameEn, nameRu, rating, posterUrl, filmId }: Movie): string {
    const title = nameEn || nameRu;
    const ratingDisplay = rating === 'null' ? '-' : rating;

    return `
      <li class='bg-white overflow-hidden border-2 rounded' data-id='${filmId}'>
        <div>
          <img src='${posterUrl}' alt='${title}'>
        </div>
        <div class='p-3 grid gap-3'>
          <h5 class='font-bold'>${title}</h5>
          <p class='max-w-max bg-gray-400 rounded px-2 py-1 text-white'>${ratingDisplay}</p>
          <button class='px-3 py-2 border hover:bg-slate-50' data-detail>Detail</button>
        </div>
      </li>
    `;
  }

  /**
   * Этот код представляет собой часть класса MoviesFinder, которая отвечает за обработку
   * пользовательских действий, таких как поиск фильмов, просмотр деталей фильма,
   * закрытие модального окна и загрузка дополнительных фильмов.
   */

  /**
   * Обрабатывает отправку формы поиска фильмов
   * @param {Event} event - Событие отправки формы
   */
  private async handleSearchFormSubmit(event: Event): Promise<void> {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const query = (form.query as HTMLInputElement).value.trim();

    if (!query) {
      this.utils.showToast('Please enter a keyword');
      return;
    }

    this.state.currentPage = 1;
    this.state.queryType = `${this.config.keywordQuery}${query}`;
    await this.getMovies(this.state.queryType);
  }

  /**
   * Обрабатывает клик по элементу списка фильмов для отображения деталей фильма
   * @param {MouseEvent} param0 - Объект события клика
   */
  private async handleMovieListClick({ target }: MouseEvent): Promise<void> {
    if (!(target instanceof HTMLElement) || !target.matches('[data-detail]')) return;
    const movieId = target.closest('li')?.getAttribute('data-id');
    if (!movieId) return;

    try {
      const {
        data: { data: { description, filmLength, nameEn, nameRu, posterUrl, posterUrlPreview, webUrl, year } },
      } = await this.utils.axiosInstance.get(movieId);

      if (this.state.elements.modalContent) {
        this.state.elements.modalContent.innerHTML = `
        <button class='justify-self-end max-w-max' data-modal-close>
        <span class='pointer-events-none'>${feather.icons.x.toSvg()}</span>
      </button>
      <div class='flex justify-center'>
        <img 
          class='max-w-[300px]' 
          src='${posterUrl || posterUrlPreview}' 
          alt='${nameEn || nameRu}'
        >
      </div>
      <div class='grid gap-3'>
        <h5 class='font-bold'>${nameEn || nameRu} (${year})</h5>
        <p>${description}</p>
        <p>Duration: ${filmLength}</p>
        <a 
          class='flex items-center justify-center rounded border px-3 py-2 hover:bg-slate-50' 
          href='${webUrl}' 
          target='_blank'
          data-movie-details
        >
          More
        </a>
      </div>
    `;
      }

      this.state.elements.modalOverlay?.classList.remove('hidden');
    } catch (error) {
      this.utils.handleError('An error occurred while fetching movie details.', error as Error);
    }
  }

  /**
   * Обрабатывает клик по оверлею модального окна или нажатие клавиши Escape для закрытия модального окна
   * @param {MouseEvent | KeyboardEvent} event - Объект события клика или нажатия клавиши
   */
  private handleModalOverlayClick(event: MouseEvent | KeyboardEvent): void {
    const target = event.target as HTMLElement;
    const key = 'key' in event ? event.key : undefined;

    if (
      (target instanceof HTMLElement && (target.matches('[data-modal-close]') || target.matches('[data-modal-overlay]'))) ||
      key === 'Escape'
    ) {
      this.state.elements.modalOverlay?.classList.add('hidden');
    }
  }

  /**
   * Обрабатывает клик по кнопке "Загрузить еще" для получения дополнительных фильмов
   */
  private async handleLoadMoreClick(): Promise<void> {
    if (!(this.state.countPage && this.state.currentPage < this.state.countPage)) return;
    try {
      this.state.currentPage++;
      const { data: { films } } = await this.utils.axiosInstance.get(`${this.state.queryType}&page=${this.state.currentPage}`);
      this.state.movies = [...this.state.movies, ...films];
      this.renderMovies(this.state.movies);
    } catch (error) {
      this.utils.handleError('An error occurred while fetching more movies.', error as Error);
      this.state.elements.loadMore?.classList.add('hidden');
    }
  }
}

new MoviesFinder();
