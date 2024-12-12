/**
 * Этот код представляет собой приложение для поиска и отображения информации о фильмах.
 * Он использует API Кинопоиска для получения данных о фильмах, позволяет пользователям
 * искать фильмы по ключевым словам, просматривать детали фильмов и загружать дополнительные
 * результаты. Приложение также включает модальное окно для отображения подробной информации
 * о выбранном фильме.
 */

import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios, { AxiosInstance } from 'axios';
import feather from 'feather-icons';

/**
 * Интерфейс для конфигурации приложения
 */
interface AppConfig {
  root: string;
  selectors: {
    searchForm: string;
    movieList: string;
    loadMore: string;
    modalOverlay: string;
    modalContent: string;
  };
  keywordQuery: string;
  topQuery: string;
  axiosConfig: {
    baseURL: string;
    headers: {
      'X-API-KEY': string;
      'Content-Type': string;
    };
  };
}

/**
 * Объект конфигурации приложения
 */
const APP_CONFIG: AppConfig = {
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

/**
 * Интерфейс для состояния приложения
 */
interface AppState {
  elements: {
    searchForm: HTMLFormElement | null;
    movieList: HTMLUListElement | null;
    loadMore: HTMLButtonElement | null;
    modalOverlay: HTMLDivElement | null;
    modalContent: HTMLElement | null;
  };
  queryType: string;
  currentPage: number;
  movies: Movie[];
  countPage: number | null;
}

/**
 * Объект состояния приложения
 */
const APP_STATE: AppState = {
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

/**
 * Интерфейс для утилит приложения
 */
interface AppUtils {
  renderDataAttributes: (element: string) => string;
  toastConfig: {
    className: string;
    duration: number;
    gravity: string;
    position: string;
  };
  showToast: (message: string) => void;
  handleError: (message: string, error?: any) => void;
  axiosInstance: AxiosInstance;
}

/**
 * Объект утилит приложения
 */
const APP_UTILS: AppUtils = {
  renderDataAttributes: (element) => element.slice(1, -1),
  toastConfig: {
    className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
    duration: 3000,
    gravity: 'bottom',
    position: 'center',
  },
  showToast: (message) => {
    // @ts-ignore
    Toastify({
      text: message,
      ...APP_UTILS.toastConfig,
    }).showToast();
  },
  handleError: (message, error = null) => {
    APP_UTILS.showToast(message);
    if (error) console.error(message, error);
  },
  axiosInstance: axios.create(APP_CONFIG.axiosConfig),
};

/**
 * Создает HTML-структуру приложения
 */
function createAppHTML(): void {
  const {
    root,
    selectors: {
      searchForm,
      movieList,
      loadMore,
      modalOverlay,
      modalContent,
    },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
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
 * Инициализирует DOM-элементы приложения
 */
function initDOMElements(): void {
  APP_STATE.elements = {
    searchForm: document.querySelector<HTMLFormElement>(APP_CONFIG.selectors.searchForm),
    movieList: document.querySelector<HTMLUListElement>(APP_CONFIG.selectors.movieList),
    loadMore: document.querySelector<HTMLButtonElement>(APP_CONFIG.selectors.loadMore),
    modalOverlay: document.querySelector<HTMLDivElement>(APP_CONFIG.selectors.modalOverlay),
    modalContent: document.querySelector<HTMLElement>(APP_CONFIG.selectors.modalContent),
  };
}

/**
 * Инициализирует приложение
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();

  (async () => {
    APP_STATE.queryType = APP_CONFIG.topQuery;
    await getMovies(APP_STATE.queryType);
    APP_STATE.elements.searchForm?.addEventListener('submit', handleSearchFormSubmit);
    APP_STATE.elements.movieList?.addEventListener('click', handleMovieListClick);
    APP_STATE.elements.modalOverlay?.addEventListener('click', handleModalOverlayClick);
    document.addEventListener('keydown', handleModalOverlayClick);
    APP_STATE.elements.loadMore?.addEventListener('click', handleLoadMoreClick);
  })();
}

/**
 * Интерфейс для фильма
 */
interface Movie {
  nameEn: string;
  nameRu: string;
  rating: string;
  posterUrl: string;
  filmId: number;
}

/**
 * Получает фильмы по заданному URL
 * @param url - URL для запроса фильмов
 */
async function getMovies(url: string): Promise<void> {
  try {
    if (APP_STATE.elements.movieList) {
      APP_STATE.elements.movieList.innerHTML = `<p class='font-medium text-lg'>Loading...</p>`;
    }
    const { films, pagesCount } = await fetchTopMoviesData(url);

    if (films.length === 0) {
      APP_UTILS.showToast('Nothing found, you will be redirect to home page');
      setTimeout(() => location.reload(), 4000);
      return;
    }

    APP_STATE.movies = films;
    APP_STATE.countPage = pagesCount;

    renderMovies(APP_STATE.movies);
  } catch (error) {
    APP_UTILS.handleError('An error occurred while fetching data.', error);
  }
}

/**
 * Получает данные о топовых фильмах
 * @param url - URL для запроса данных
 * @returns Объект с фильмами и количеством страниц
 */
async function fetchTopMoviesData(url: string): Promise<{ films: Movie[], pagesCount: number }> {
  const { data } = await APP_UTILS.axiosInstance.get(`${url}&page=${APP_STATE.currentPage}`);
  return { films: data.films, pagesCount: data.pagesCount };
}

/**
 * Отрисовывает фильмы на странице
 * @param movies - Массив фильмов для отрисовки
 */
function renderMovies(movies: Movie[]): void {
  if (APP_STATE.elements.movieList) {
    APP_STATE.elements.movieList.innerHTML = movies.map(createMovieCard).join('');
  }
  if (APP_STATE.elements.loadMore) {
    APP_STATE.elements.loadMore.className = `px-3 py-2 border bg-white hover:bg-slate-50 ${APP_STATE.currentPage < (APP_STATE.countPage || 0) ? '' : 'hidden'}`;
  }
}

/**
 * Создает HTML-карточку для фильма
 * @param param0 - Объект с данными фильма
 * @returns HTML-строка для карточки фильма
 */
function createMovieCard({ nameEn, nameRu, rating, posterUrl, filmId }: Movie): string {
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
 * Обрабатывает отправку формы поиска
 * @param event - Событие отправки формы
 */
async function handleSearchFormSubmit(event: Event): Promise<void> {
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  const query = (form.elements.namedItem('query') as HTMLInputElement).value.trim();

  if (!query) {
    APP_UTILS.showToast('Please enter a keyword');
    return;
  }

  APP_STATE.currentPage = 1;
  APP_STATE.queryType = `${APP_CONFIG.keywordQuery}${query}`;
  await getMovies(APP_STATE.queryType);
}

/**
 * Обрабатывает клик по фильму в списке.
 * @param {MouseEvent} param - Объект события клика.
 */
async function handleMovieListClick({ target }: MouseEvent): Promise<void> {
  if (!(target instanceof HTMLElement) || !target.matches('[data-detail]')) return;
  const movieId = target.closest('li')?.getAttribute('data-id');

  if (!movieId) return;

  try {
    const {
      data: { data: { description, filmLength, nameEn, nameRu, posterUrl, posterUrlPreview, webUrl, year } },
    } = await APP_UTILS.axiosInstance.get(movieId);

    if (APP_STATE.elements.modalContent) {
      APP_STATE.elements.modalContent.innerHTML = `
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

    APP_STATE.elements.modalOverlay?.classList.remove('hidden');
  } catch (error) {
    APP_UTILS.handleError('An error occurred while fetching movie details.', error);
  }
}

/**
 * Обрабатывает закрытие модального окна.
 * @param {MouseEvent | KeyboardEvent} event - Объект события (клик или нажатие клавиши).
 */
function handleModalOverlayClick(event: MouseEvent | KeyboardEvent): void {
  if (event instanceof KeyboardEvent) {
    if (event.key === 'Escape') {
      APP_STATE.elements.modalOverlay?.classList.add('hidden');
    }
  } else if (event instanceof MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.matches('[data-modal-close]') || target.matches('[data-modal-overlay]')) {
      APP_STATE.elements.modalOverlay?.classList.add('hidden');
    }
  }
}

/**
 * Обрабатывает нажатие на кнопку "Загрузить еще".
 */
async function handleLoadMoreClick(): Promise<void> {
  if (!(APP_STATE.countPage && APP_STATE.currentPage < APP_STATE.countPage)) return;
  try {
    APP_STATE.currentPage++;
    const { data: { films } } = await APP_UTILS.axiosInstance.get(`${APP_STATE.queryType}&page=${APP_STATE.currentPage}`);
    APP_STATE.movies = [...APP_STATE.movies, ...films];
    renderMovies(APP_STATE.movies);
  } catch (error) {
    APP_UTILS.handleError('An error occurred while fetching more movies.', error);
    APP_STATE.elements.loadMore?.classList.add('hidden');
  }
}

// Инициализация приложения
initApp();
