import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';

/**
 * @file Anime Tracker - приложение для отслеживания аниме
 * @description Это приложение позволяет пользователям искать аниме,
 * добавлять их в список отслеживания, обновлять количество просмотренных эпизодов
 * и удалять аниме из списка. Данные сохраняются в локальном хранилище браузера.
 */

class AnimeTracker {
  constructor() {
    /**
     * @type {Object} Конфигурация приложения
     * @property {string} root - Селектор корневого элемента приложения
     * @property {Object} selectors - Объект с селекторами для основных элементов
     * @property {string} selectors.searchForm - Селектор формы поиска
     * @property {string} selectors.searchResults - Селектор контейнера результатов поиска
     * @property {string} selectors.storedAnime - Селектор контейнера сохраненных аниме
     * @property {string} API_URL - Базовый URL API для запросов
     */
    this.config = {
      root: '#app',
      selectors: {
        searchForm: '[data-search-form]',
        searchResults: '[data-search-results]',
        storedAnime: '[data-stored-anime]',
      },
      API_URL: 'https://api.jikan.moe',
    };

    /**
     * @type {Object} Состояние приложения
     * @property {Object} elements - Объект для хранения ссылок на DOM-элементы
     * @property {Array} searchResults - Массив для хранения результатов поиска
     * @property {Array} storedResults - Массив для хранения сохраненных аниме
     */
    this.state = {
      elements: {},
      searchResults: [],
      storedResults: [],
    };

    this.utils = {
      /**
       * Обрабатывает строку с data-атрибутами
       * @param {string} element - Строка с data-атрибутами
       * @returns {string} Обработанная строка
       */
      renderDataAttributes: (element) => element.slice(1, -1),

      /**
       * Конфигурация для Toast-уведомлений
       * @type {Object}
       */
      toastConfig: {
        className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
        duration: 3000,
        gravity: 'bottom',
        position: 'center',
      },

      /**
       * Показывает Toast-уведомление
       * @param {string} message - Сообщение для отображения
       */
      showToast: (message) => {
        Toastify({
          text: message,
          ...this.utils.toastConfig,
        }).showToast();
      },

      /**
       * Обрабатывает ошибки и показывает уведомление
       * @param {string} message - Сообщение об ошибке
       * @param {Error} [error] - Объект ошибки (необязательно)
       */
      handleError: (message, error = null) => {
        this.utils.showToast(message);
        if (error) console.error(message, error);
      },
    };

    this.init();
  }

  /**
   * Создает HTML-структуру приложения
   */
  createAppHTML() {
    const {
      selectors: {
        searchForm,
        searchResults,
        storedAnime,
      },
    } = this.config;
    const { renderDataAttributes } = this.utils;
    const { root } = this.config;
    const rootElement = document.querySelector(root);

    if (!rootElement) return;

    rootElement.innerHTML = `
    <div class='grid w-full max-w-2xl gap-4 p-3'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>Anime Tracker</h1>
      <div class='grid gap-3'>
        <form ${renderDataAttributes(searchForm)} class='grid gap-3 rounded border bg-white p-3'>
          <input class='w-full rounded border bg-slate-50 px-3 py-2 focus:border-blue-400 focus:outline-none' type='text' name='query' placeholder='Enter anime name'>
          <button class='border px-3 py-2 hover:bg-slate-50' type='submit'>Search</button>
        </form>
        <ul ${renderDataAttributes(searchResults)} class='hidden grid max-h-[500px] grid-cols-2 items-start gap-2 overflow-auto rounded border bg-white p-3 sm:grid-cols-3 md:grid-cols-4'></ul>
        <ul ${renderDataAttributes(storedAnime)} class='hidden grid gap-3 rounded border bg-white p-3'></ul>
      </div>
    </div>
  `;
  }

  /**
   * Инициализирует DOM-элементы приложения
   */
  initDOMElements() {
    this.state.elements = {
      searchForm: document.querySelector(this.config.selectors.searchForm),
      searchFormSubmit: document.querySelector(`${this.config.selectors.searchForm} button[type='submit']`),
      searchResults: document.querySelector(this.config.selectors.searchResults),
      storedAnime: document.querySelector(this.config.selectors.storedAnime),
    };
  }

  /**
   * Инициализирует приложение
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();
    this.state.storedResults = this.getLocalStorageData();
    this.displayLocalStorageData();
    this.state.elements.searchForm.addEventListener('submit', this.handleSearchFormSubmit.bind(this));
    this.state.elements.searchResults.addEventListener('click', this.handleSearchResultClick.bind(this));
    this.state.elements.storedAnime.addEventListener('click', this.handleStoredAnimeClick.bind(this));
  }


  /**
   * Получает данные из локального хранилища
   * @returns {Array} Массив сохраненных аниме
   */
  getLocalStorageData() {
    return JSON.parse(localStorage.getItem('anime')) || [];
  }

  /**
   * Сохраняет данные в локальное хранилище
   * @param {Array} items - Массив аниме для сохранения
   */
  setLocalStorageData(items) {
    localStorage.setItem('anime', JSON.stringify(items));
  }

  /**
   * Отображает данные из локального хранилища
   */
  displayLocalStorageData() {
    const storedList = this.getLocalStorageData();
    this.state.elements.storedAnime.classList.toggle('hidden', storedList.length === 0);
    if (storedList.length > 0) {
      this.renderStoredAnime(storedList);
    }
  }

  /**
   * Отображает сохраненные аниме
   * @param {Array} storedList - Массив сохраненных аниме
   */
  renderStoredAnime = (storedList) => {
    this.state.elements.storedAnime.innerHTML = storedList
      .map(
        ({ img, title, id, episodes, episodesFinish }) => `
    <li class='grid gap-3 p-3 border rounded sm:grid-cols-[auto_auto]'>
      <div class='grid grid-cols-[100px_auto] items-center gap-2'>
        <img src='${img}' alt='${title}'>
        <h3 class='font-bold'><a href='https://myanimelist.net/anime/${id}/${title}' target='_blank'>${title}</a></h3>
      </div>
      <div class='body grid grid-cols-[auto_auto] items-center gap-3 sm:justify-end' data-id='${id}'>
        <div class='flex'>
          ${!episodes ? '' : `<span data-finished>${episodesFinish}</span>/<span data-all-episodes>${episodes}</span>`}
        </div>
        <div class='flex gap-2'>
          <button class='px-3 border hover:bg-slate-50' data-plus>+</button>
          <button class='px-3 border hover:bg-slate-50' data-minus>-</button>
          <button class='px-3 py-2 border hover:bg-slate-50' data-trash='${id}'>Remove</button>
        </div>
      </div>
    </li>
  `,
      )
      .join('');
  };

  /**
   * Обрабатывает отправку формы поиска
   * @param {Event} event - Событие отправки формы
   */
  async handleSearchFormSubmit(event) {
    event.preventDefault();
    const query = event.target.query.value.trim();
    if (!query?.length) {
      this.utils.showToast('Please enter an anime name');
    }
    await this.getAnimeData(query);
  }

  /**
   * Получает данные об аниме по запросу
   * @param {string} query - Поисковый запрос
   */
  async getAnimeData(query) {
    const searchButton = this.state.elements.searchFormSubmit;
    try {
      this.setSearchButtonState(searchButton, true, 'Loading...');
      const data = await this.fetchAnimeData(query);
      this.state.searchResults = data;
      this.renderSearchAnime(this.state.searchResults);
    } catch (error) {
      this.utils.handleError('Failed to fetch anime data', error);
    } finally {
      this.setSearchButtonState(searchButton, false, 'Search');
    }
  }

  /**
   * Устанавливает состояние кнопки поиска
   * @param {HTMLButtonElement} button - Кнопка поиска
   * @param {boolean} isDisabled - Флаг блокировки кнопки
   * @param {string} text - Текст кнопки
   */
  setSearchButtonState(button, isDisabled, text) {
    button.disabled = isDisabled;
    button.textContent = text;
  }

  /**
   * Запрашивает данные об аниме с API
   * @param {string} query - Поисковый запрос
   * @returns {Promise<Array>} Массив найденных аниме
   */
  async fetchAnimeData(query) {
    const response = await axios.get(`${this.config.API_URL}/v4/anime`, {
      params: { q: query },
    });
    return response.data.data;
  }

  /**
   * Отображает результаты поиска аниме
   * @param {Array} searchResults - Массив найденных аниме
   */
  renderSearchAnime(searchResults) {
    this.state.elements.searchResults.classList.remove('hidden');
    this.state.elements.searchResults.innerHTML = searchResults
      .map((anime) => this.createAnimeListItem(anime))
      .join('');
  }

  /**
   * Создает HTML-элемент для отдельного аниме в результатах поиска
   * @param {Object} anime - Объект с данными об аниме
   * @returns {string} HTML-строка для элемента списка
   */
  createAnimeListItem({ mal_id, images, title, episodes }) {
    const isDisabled = this.state.storedResults.some(({ id }) => id === mal_id);
    const animeData = JSON.stringify({
      episodes,
      title,
      id: mal_id,
      img: images.jpg.image_url,
    });

    return `
    <li data-id="${mal_id}" class="p-1 border rounded grid gap-2 items-start">
      <img src="${images.jpg.image_url}" alt="${title}">
      <a class="font-medium text-sm" href="https://myanimelist.net/anime/${mal_id}/${title}" target="_blank">
        ${title}
      </a>
      <button class="px-3 py-2 border hover:bg-slate-50" data-add='${animeData}' ${isDisabled ? 'disabled' : ''}>
        Add To List
      </button>
    </li>
  `;
  }

  /**
   * Обрабатывает клик по результатам поиска
   * @param {Event} event - Событие клика
   */

  handleSearchResultClick({ target }) {
    if (!target.matches('[data-add]')) return;

    const { episodes, title, id, img } = JSON.parse(target.dataset.add);
    this.state.storedResults = [
      ...this.state.storedResults,
      { episodes, title, id, img, episodesFinish: 0 },
    ];
    this.setLocalStorageData(this.state.storedResults);

    target.disabled = true;
    this.state.elements.storedAnime.classList.remove('hidden');
    this.renderStoredAnime(this.state.storedResults);
  }

  /**
   * Обрабатывает клики по сохраненным аниме
   * @param {Event} event - Событие клика
   */
  handleStoredAnimeClick(event) {
    const target = event.target;
    const body = target.closest('.body');
    const animeId = Number(body.dataset.id);

    if (target.matches('[data-plus]')) {
      this.updateEpisodeCount(body, animeId, 1);
    }

    if (target.matches('[data-minus]')) {
      this.updateEpisodeCount(body, animeId, -1);
    }

    if (target.matches('[data-trash]')) {
      this.removeAnime(target, animeId);
    }
  }

  /**
   * Обновляет количество просмотренных эпизодов аниме
   * @param {HTMLElement} body - Элемент, содержащий информацию об аниме
   * @param {number} animeId - ID аниме
   * @param {number} change - Изменение количества эпизодов (1 или -1)
   */
  updateEpisodeCount(body, animeId, change) {
    const watchedCount = body.querySelector('[data-finished]');
    const totalEpisodes = Number(
      body.querySelector('[data-all-episodes]').textContent,
    );
    const newCount = Math.max(
      0,
      Math.min(totalEpisodes, Number(watchedCount.textContent) + change),
    );

    watchedCount.textContent = newCount;
    this.updateStoredResults(animeId, newCount);
  }

  /**
   * Обновляет сохраненные результаты с новым количеством просмотренных эпизодов
   * @param {number} animeId - ID аниме
   * @param {number} newCount - Новое количество просмотренных эпизодов
   */
  updateStoredResults(animeId, newCount) {
    this.state.storedResults = this.state.storedResults.map((anime) =>
      anime.id === animeId ? { ...anime, episodesFinish: newCount } : anime,
    );
    this.setLocalStorageData(this.state.storedResults);
  }

  /**
   * Удаляет аниме из списка отслеживания
   * @param {HTMLElement} target - Элемент, на котором произошел клик
   * @param {number} animeId - ID аниме для удаления
   */
  removeAnime(target, animeId) {
    if (!confirm('Remove this anime?')) return;

    target.closest('li').remove();
    this.state.storedResults = this.state.storedResults.filter(({ id }) => id !== animeId);
    this.setLocalStorageData(this.state.storedResults);
    this.renderStoredAnime(this.state.storedResults);
    this.state.elements.storedAnime.classList.toggle('hidden', this.state.storedResults.length === 0);

    this.updateSearchResults(animeId);
  }

  /**
   * Обновляет результаты поиска после удаления аниме
   * @param {number} animeId - ID удаленного аниме
   */
  updateSearchResults(animeId) {
    const searchItems = Array.from(this.state.elements.searchResults.querySelectorAll('li'));
    searchItems.forEach((li) => {
      if (Number(li.dataset.id) === animeId) {
        li.querySelector('button').disabled = false;
      }
    });
  }
}

new AnimeTracker();
