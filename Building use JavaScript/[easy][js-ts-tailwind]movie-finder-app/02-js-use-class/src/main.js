/**
 * Этот код представляет собой класс MoviesFinder, который реализует функциональность поиска и отображения фильмов.
 * Он использует API Кинопоиска для получения информации о фильмах, позволяет искать фильмы по ключевым словам,
 * отображать список фильмов, загружать дополнительные фильмы и просматривать детальную информацию о каждом фильме.
 */

import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';
import feather from 'feather-icons';

class MoviesFinder {
  /**
   * Создает экземпляр класса MoviesFinder.
   * Инициализирует конфигурацию, состояние и утилиты.
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
      /**
       * Удаляет первый и последний символ из строки.
       * @param {string} element - Строка для обработки.
       * @returns {string} Обработанная строка.
       */
      renderDataAttributes: (element) => element.slice(1, -1),

      toastConfig: {
        className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
        duration: 3000,
        gravity: 'bottom',
        position: 'center',
      },

      /**
       * Отображает уведомление с заданным сообщением.
       * @param {string} message - Сообщение для отображения.
       */
      showToast: (message) => {
        Toastify({
          text: message,
          ...this.utils.toastConfig,
        }).showToast();
      },

      /**
       * Обрабатывает ошибку, отображая уведомление и логируя ошибку в консоль.
       * @param {string} message - Сообщение об ошибке.
       * @param {Error} [error] - Объект ошибки (необязательный).
       */
      handleError: (message, error = null) => {
        this.utils.showToast(message);
        if (error) console.error(message, error);
      },

      axiosInstance: axios.create(this.config.axiosConfig),
    };

    this.init();
  }

  /**
   * Создает HTML-структуру приложения.
   */
  createAppHTML() {
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
   * Инициализирует DOM-элементы, сохраняя их в состоянии.
   */
  initDOMElements() {
    this.state.elements = {
      searchForm: document.querySelector(this.config.selectors.searchForm),
      movieList: document.querySelector(this.config.selectors.movieList),
      loadMore: document.querySelector(this.config.selectors.loadMore),
      modalOverlay: document.querySelector(this.config.selectors.modalOverlay),
      modalContent: document.querySelector(this.config.selectors.modalContent),
    };
  }

  /**
   * Инициализирует приложение, создавая HTML-структуру, инициализируя DOM-элементы
   * и устанавливая обработчики событий.
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();
    (async () => {
      this.state.queryType = this.config.topQuery;
      await this.getMovies(this.state.queryType);
      this.state.elements.searchForm.addEventListener('submit', this.handleSearchFormSubmit.bind(this));
      this.state.elements.movieList.addEventListener('click', this.handleMovieListClick.bind(this));
      this.state.elements.modalOverlay.addEventListener('click', this.handleModalOverlayClick.bind(this));
      document.addEventListener('keydown', this.handleModalOverlayClick.bind(this));
      this.state.elements.loadMore.addEventListener('click', this.handleLoadMoreClick.bind(this));
    })();
  }

  /**
   * Получает фильмы по заданному URL и отображает их.
   * @param {string} url - URL для запроса фильмов.
   */
  async getMovies(url) {
    try {
      this.state.elements.movieList.innerHTML = `<p class='font-medium text-lg'>Loading...</p>`;
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
      this.utils.handleError('An error occurred while fetching data.', error);
    }
  }

  /**
   * Выполняет запрос к API для получения данных о фильмах.
   * @param {string} url - URL для запроса.
   * @returns {Promise<Object>} Объект с данными о фильмах и количеством страниц.
   */
  async fetchTopMoviesData(url) {
    const { data } = await this.utils.axiosInstance.get(`${url}&page=${this.state.currentPage}`);
    return { films: data.films, pagesCount: data.pagesCount };
  }

  /**
   * Отображает список фильмов и обновляет видимость кнопки "Загрузить еще".
   * @param {Array} movies - Массив объектов с информацией о фильмах.
   */
  renderMovies(movies) {
    this.state.elements.movieList.innerHTML = movies.map(this.createMovieCard).join('');
    this.state.elements.loadMore.className = `px-3 py-2 border bg-white hover:bg-slate-50 ${this.state.currentPage < this.state.countPage ? '' : 'hidden'}`;
  }

  /**
   * Создает HTML-разметку для карточки фильма.
   * @param {Object} param0 - Объект с информацией о фильме.
   * @param {string} param0.nameEn - Название фильма на английском.
   * @param {string} param0.nameRu - Название фильма на русском.
   * @param {string} param0.rating - Рейтинг фильма.
   * @param {string} param0.posterUrl - URL постера фильма.
   * @param {string} param0.filmId - ID фильма.
   * @returns {string} HTML-разметка карточки фильма.
   */
  createMovieCard({ nameEn, nameRu, rating, posterUrl, filmId }) {
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
   * Обрабатывает отправку формы поиска.
   * @param {Event} event - Объект события отправки формы.
   */
  async handleSearchFormSubmit(event) {
    event.preventDefault();
    const query = event.target.query.value.trim();

    if (!query) {
      this.utils.showToast('Please enter a keyword');
      return;
    }

    this.state.currentPage = 1;
    this.state.queryType = `${this.config.keywordQuery}${query}`;
    await this.getMovies(this.state.queryType);
  }

  /**
   * Обрабатывает клик по кнопке "Detail" в списке фильмов.
   * @param {Event} param0 - Объект события клика.
   */
  async handleMovieListClick({ target }) {
    if (!target.matches('[data-detail]')) return;
    const movieId = target.closest('li').getAttribute('data-id');

    try {
      const {
        data: { data: { description, filmLength, nameEn, nameRu, posterUrl, posterUrlPreview, webUrl, year } },
      } = await this.utils.axiosInstance.get(movieId);

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

      this.state.elements.modalOverlay.classList.remove('hidden');
    } catch (error) {
      this.utils.handleError('An error occurred while fetching movie details.', error);
    }
  }

  /**
   * Обрабатывает клик по оверлею модального окна или нажатие клавиши Escape.
   * @param {Event} param0 - Объект события клика или нажатия клавиши.
   */
  handleModalOverlayClick({ target, key }) {
    if (
      target.matches('[data-modal-close]') ||
      target.matches('[data-modal-overlay]') ||
      key === 'Escape'
    ) {
      this.state.elements.modalOverlay.classList.add('hidden');
    }
  }

  /**
   * Обрабатывает клик по кнопке "Загрузить еще".
   */
  async handleLoadMoreClick() {
    if (!(this.state.countPage && this.state.currentPage < this.state.countPage)) return;
    try {
      this.state.currentPage++;
      const { data: { films } } = await this.utils.axiosInstance.get(`${this.state.queryType}&page=${this.state.currentPage}`);
      this.state.movies = [...this.state.movies, ...films];
      this.renderMovies(this.state.movies);
    } catch (error) {
      this.utils.handleError('An error occurred while fetching more movies.', error);
      this.state.elements.loadMore.classList.add('hidden');
    }
  }
}

new MoviesFinder();
