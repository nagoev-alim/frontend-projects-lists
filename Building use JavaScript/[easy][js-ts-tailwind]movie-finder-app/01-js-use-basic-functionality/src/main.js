/**
 * Этот код представляет собой приложение для поиска и просмотра информации о фильмах.
 * Он использует API Кинопоиска для получения данных о фильмах, отображает их в виде
 * списка, позволяет искать фильмы по ключевым словам и просматривать детальную
 * информацию о каждом фильме в модальном окне.
 */

import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';
import feather from 'feather-icons';

/**
 * Конфигурация приложения
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента приложения
 * @property {Object} selectors - Объект с селекторами DOM-элементов
 * @property {string} keywordQuery - Часть URL для поиска по ключевому слову
 * @property {string} topQuery - Часть URL для получения топ-250 фильмов
 * @property {Object} axiosConfig - Конфигурация для Axios
 */
const APP_CONFIG = {
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
 * Состояние приложения
 * @typedef {Object} AppState
 * @property {Object} elements - Объект с DOM-элементами
 * @property {string} queryType - Тип текущего запроса
 * @property {number} currentPage - Текущая страница результатов
 * @property {Array} movies - Массив с данными о фильмах
 * @property {number|null} countPage - Общее количество страниц результатов
 */
const APP_STATE = {
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
 * Утилиты приложения
 * @namespace
 */
const APP_UTILS = {
  /**
   * Обрабатывает строку с data-атрибутом, удаляя квадратные скобки
   * @param {string} element - Строка с data-атрибутом
   * @returns {string} Обработанная строка без квадратных скобок
   */
  renderDataAttributes: (element) => element.slice(1, -1),

  /**
   * Конфигурация для toast-уведомлений
   * @type {Object}
   */
  toastConfig: {
    className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
    duration: 3000,
    gravity: 'bottom',
    position: 'center',
  },

  /**
   * Отображает toast-уведомление с заданным сообщением
   * @param {string} message - Текст уведомления
   */
  showToast: (message) => {
    Toastify({
      text: message,
      ...APP_UTILS.toastConfig,
    }).showToast();
  },

  /**
   * Обрабатывает ошибку, отображая уведомление и, при необходимости, логируя в консоль
   * @param {string} message - Сообщение об ошибке для отображения
   * @param {Error} [error=null] - Объект ошибки для логирования в консоль
   */
  handleError: (message, error = null) => {
    APP_UTILS.showToast(message);
    if (error) console.error(message, error);
  },

  /**
   * Экземпляр Axios с предустановленной конфигурацией
   * @type {AxiosInstance}
   */
  axiosInstance: axios.create(APP_CONFIG.axiosConfig),
};

/**
 * Создает HTML-разметку приложения
 */
function createAppHTML() {
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
 * Инициализирует DOM-элементы в состоянии приложения
 */
function initDOMElements() {
  APP_STATE.elements = {
    searchForm: document.querySelector(APP_CONFIG.selectors.searchForm),
    movieList: document.querySelector(APP_CONFIG.selectors.movieList),
    loadMore: document.querySelector(APP_CONFIG.selectors.loadMore),
    modalOverlay: document.querySelector(APP_CONFIG.selectors.modalOverlay),
    modalContent: document.querySelector(APP_CONFIG.selectors.modalContent),
  };
}

/**
 * Инициализирует приложение
 */
function initApp() {
  createAppHTML();
  initDOMElements();

  (async () => {
    APP_STATE.queryType = APP_CONFIG.topQuery;
    await getMovies(APP_STATE.queryType);
    APP_STATE.elements.searchForm.addEventListener('submit', handleSearchFormSubmit);
    APP_STATE.elements.movieList.addEventListener('click', handleMovieListClick);
    APP_STATE.elements.modalOverlay.addEventListener('click', handleModalOverlayClick);
    document.addEventListener('keydown', handleModalOverlayClick);
    APP_STATE.elements.loadMore.addEventListener('click', handleLoadMoreClick);
  })();
}

/**
 * Получает фильмы по заданному URL и обновляет состояние приложения
 * @async
 * @function getMovies
 * @param {string} url - URL для запроса фильмов
 * @throws {Error} Выбрасывает ошибку, если запрос не удался
 * @returns {Promise<void>}
 */
async function getMovies(url) {
  try {
    APP_STATE.elements.movieList.innerHTML = `<p class='font-medium text-lg'>Loading...</p>`;
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
 * @param {string} url - URL для запроса фильмов
 * @returns {Promise<{films: Array, pagesCount: number}>} - Объект с фильмами и количеством страниц
 */
async function fetchTopMoviesData(url) {
  const { data } = await APP_UTILS.axiosInstance.get(`${url}&page=${APP_STATE.currentPage}`);
  return { films: data.films, pagesCount: data.pagesCount };
}

/**
 * Рендерит фильмы на странице
 * @param {Array} movies - Массив с данными о фильмах
 */
function renderMovies(movies) {
  APP_STATE.elements.movieList.innerHTML = movies.map(createMovieCard).join('');
  APP_STATE.elements.loadMore.className = `px-3 py-2 border bg-white hover:bg-slate-50 ${APP_STATE.currentPage < APP_STATE.countPage ? '' : 'hidden'}`;
}

/**
 * Создает HTML-разметку для карточки фильма
 * @param {Object} movie - Объект с данными о фильме
 * @returns {string} - HTML-разметка карточки фильма
 */
function createMovieCard({ nameEn, nameRu, rating, posterUrl, filmId }) {
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
 * Обработчик отправки формы поиска
 * @param {Event} event - Объект события
 */
async function handleSearchFormSubmit(event) {
  event.preventDefault();
  const query = event.target.query.value.trim();

  if (!query) {
    APP_UTILS.showToast('Please enter a keyword');
    return;
  }

  APP_STATE.currentPage = 1;
  APP_STATE.queryType = `${APP_CONFIG.keywordQuery}${query}`;
  await getMovies(APP_STATE.queryType);
}

/**
 * Обработчик клика по списку фильмов
 * @param {Event} event - Объект события
 */
async function handleMovieListClick({ target }) {
  if (!target.matches('[data-detail]')) return;
  const movieId = target.closest('li').getAttribute('data-id');

  try {
    const {
      data: { data: { description, filmLength, nameEn, nameRu, posterUrl, posterUrlPreview, webUrl, year } },
    } = await APP_UTILS.axiosInstance.get(movieId);

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

    APP_STATE.elements.modalOverlay.classList.remove('hidden');
  } catch (error) {
    APP_UTILS.handleError('An error occurred while fetching movie details.', error);
  }
}

/**
 * Обработчик клика по оверлею модального окна
 * @param {Event} event - Объект события
 */
function handleModalOverlayClick({ target, key }) {
  if (
    target.matches('[data-modal-close]') ||
    target.matches('[data-modal-overlay]') ||
    key === 'Escape'
  ) {
    APP_STATE.elements.modalOverlay.classList.add('hidden');
  }
}

/**
 * Обработчик клика по кнопке "Загрузить еще"
 */
async function handleLoadMoreClick() {
  if (!(APP_STATE.countPage && APP_STATE.currentPage < APP_STATE.countPage)) return;
  try {
    APP_STATE.currentPage++;
    const { data: { films } } = await APP_UTILS.axiosInstance.get(`${APP_STATE.queryType}&page=${APP_STATE.currentPage}`);
    APP_STATE.movies = [...APP_STATE.movies, ...films];
    renderMovies(APP_STATE.movies);
  } catch (error) {
    APP_UTILS.handleError('An error occurred while fetching more movies.', error);
    APP_STATE.elements.loadMore.classList.add('hidden');
  }
}

initApp();
