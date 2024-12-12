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

/**
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента приложения
 * @property {Object} selectors - Селекторы основных элементов приложения
 * @property {string} API_URL - URL API для получения данных об аниме
 */

/**
 * Конфигурация приложения
 * @type {AppConfig}
 */
const APP_CONFIG = {
  root: '#app',
  selectors: {
    searchForm: '[data-search-form]',
    searchResults: '[data-search-results]',
    storedAnime: '[data-stored-anime]',
  },
  API_URL: 'https://api.jikan.moe',
};

/**
 * @typedef {Object} AppState
 * @property {Object} elements - DOM элементы приложения
 * @property {Array} searchResults - Результаты поиска аниме
 * @property {Array} storedResults - Сохраненные аниме
 */

/**
 * Состояние приложения
 * @type {AppState}
 */
const APP_STATE = {
  elements: {},
  searchResults: [],
  storedResults: [],
};

/**
 * Утилиты приложения
 * @namespace
 */
const APP_UTILS = {
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
      ...APP_UTILS.toastConfig,
    }).showToast();
  },

  /**
   * Обрабатывает ошибки и показывает уведомление
   * @param {string} message - Сообщение об ошибке
   * @param {Error} [error] - Объект ошибки (необязательно)
   */
  handleError: (message, error = null) => {
    APP_UTILS.showToast(message);
    if (error) console.error(message, error);
  },
};

/**
 * Создает HTML-структуру приложения
 */
function createAppHTML() {
  const {
    selectors: {
      searchForm,
      searchResults,
      storedAnime,
    },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const { root } = APP_CONFIG;
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
function initDOMElements() {
  APP_STATE.elements = {
    searchForm: document.querySelector(APP_CONFIG.selectors.searchForm),
    searchFormSubmit: document.querySelector(`${APP_CONFIG.selectors.searchForm} button[type='submit']`),
    searchResults: document.querySelector(APP_CONFIG.selectors.searchResults),
    storedAnime: document.querySelector(APP_CONFIG.selectors.storedAnime),
  };
}

/**
 * Инициализирует приложение
 */
function initApp() {
  createAppHTML();
  initDOMElements();
  APP_STATE.storedResults = getLocalStorageData();
  displayLocalStorageData();
  APP_STATE.elements.searchForm.addEventListener('submit', handleSearchFormSubmit);
  APP_STATE.elements.searchResults.addEventListener('click', handleSearchResultClick);
  APP_STATE.elements.storedAnime.addEventListener('click', handleStoredAnimeClick);
}

/**
 * Получает данные из локального хранилища
 * @returns {Array} Массив сохраненных аниме
 */
function getLocalStorageData() {
  return JSON.parse(localStorage.getItem('anime')) || [];
}

/**
 * Сохраняет данные в локальное хранилище
 * @param {Array} items - Массив аниме для сохранения
 */
function setLocalStorageData(items) {
  localStorage.setItem('anime', JSON.stringify(items));
}

/**
 * Отображает данные из локального хранилища
 */
function displayLocalStorageData() {
  const storedList = getLocalStorageData();
  APP_STATE.elements.storedAnime.classList.toggle('hidden', storedList.length === 0);
  if (storedList.length > 0) {
    renderStoredAnime(storedList);
  }
}

/**
 * Отображает сохраненные аниме
 * @param {Array} storedList - Массив сохраненных аниме
 */
const renderStoredAnime = (storedList) => {
  APP_STATE.elements.storedAnime.innerHTML = storedList
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
async function handleSearchFormSubmit(event) {
  event.preventDefault();
  const query = event.target.query.value.trim();
  if (!query?.length) {
    APP_UTILS.showToast('Please enter an anime name');
  }
  await getAnimeData(query);
}

/**
 * Получает данные об аниме по запросу
 * @param {string} query - Поисковый запрос
 */
async function getAnimeData(query) {
  const searchButton = APP_STATE.elements.searchFormSubmit;
  try {
    setSearchButtonState(searchButton, true, 'Loading...');
    const data = await fetchAnimeData(query);
    APP_STATE.searchResults = data;
    renderSearchAnime(APP_STATE.searchResults);
  } catch (error) {
    APP_UTILS.handleError('Failed to fetch anime data', error);
  } finally {
    setSearchButtonState(searchButton, false, 'Search');
  }
}

/**
 * Устанавливает состояние кнопки поиска
 * @param {HTMLButtonElement} button - Кнопка поиска
 * @param {boolean} isDisabled - Флаг блокировки кнопки
 * @param {string} text - Текст кнопки
 */
function setSearchButtonState(button, isDisabled, text) {
  button.disabled = isDisabled;
  button.textContent = text;
}

/**
 * Запрашивает данные об аниме с API
 * @param {string} query - Поисковый запрос
 * @returns {Promise<Array>} Массив найденных аниме
 */
async function fetchAnimeData(query) {
  const response = await axios.get(`${APP_CONFIG.API_URL}/v4/anime`, {
    params: { q: query },
  });
  return response.data.data;
}

/**
 * Отображает результаты поиска аниме
 * @param {Array} searchResults - Массив найденных аниме
 */
function renderSearchAnime(searchResults) {
  APP_STATE.elements.searchResults.classList.remove('hidden');
  APP_STATE.elements.searchResults.innerHTML = searchResults
    .map((anime) => createAnimeListItem(anime))
    .join('');
}

/**
 * Создает HTML-элемент для отдельного аниме в результатах поиска
 * @param {Object} anime - Объект с данными об аниме
 * @returns {string} HTML-строка для элемента списка
 */
function createAnimeListItem({ mal_id, images, title, episodes }) {
  const isDisabled = APP_STATE.storedResults.some(({ id }) => id === mal_id);
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
function handleSearchResultClick({ target }) {
  if (!target.matches('[data-add]')) return;

  const { episodes, title, id, img } = JSON.parse(target.dataset.add);
  APP_STATE.storedResults = [
    ...APP_STATE.storedResults,
    { episodes, title, id, img, episodesFinish: 0 },
  ];
  setLocalStorageData(APP_STATE.storedResults);

  target.disabled = true;
  APP_STATE.elements.storedAnime.classList.remove('hidden');
  renderStoredAnime(APP_STATE.storedResults);
}

/**
 * Обрабатывает клики по сохраненным аниме
 * @param {Event} event - Событие клика
 */
function handleStoredAnimeClick(event) {
  const target = event.target;
  const body = target.closest('.body');
  const animeId = Number(body.dataset.id);

  if (target.matches('[data-plus]')) {
    updateEpisodeCount(body, animeId, 1);
  }

  if (target.matches('[data-minus]')) {
    updateEpisodeCount(body, animeId, -1);
  }

  if (target.matches('[data-trash]')) {
    removeAnime(target, animeId);
  }
}

/**
 * Обновляет количество просмотренных эпизодов аниме
 * @param {HTMLElement} body - Элемент, содержащий информацию об аниме
 * @param {number} animeId - ID аниме
 * @param {number} change - Изменение количества эпизодов (1 или -1)
 */
function updateEpisodeCount(body, animeId, change) {
  const watchedCount = body.querySelector('[data-finished]');
  const totalEpisodes = Number(
    body.querySelector('[data-all-episodes]').textContent,
  );
  const newCount = Math.max(
    0,
    Math.min(totalEpisodes, Number(watchedCount.textContent) + change),
  );

  watchedCount.textContent = newCount;
  updateStoredResults(animeId, newCount);
}

/**
 * Обновляет сохраненные результаты с новым количеством просмотренных эпизодов
 * @param {number} animeId - ID аниме
 * @param {number} newCount - Новое количество просмотренных эпизодов
 */
function updateStoredResults(animeId, newCount) {
  APP_STATE.storedResults = APP_STATE.storedResults.map((anime) =>
    anime.id === animeId ? { ...anime, episodesFinish: newCount } : anime,
  );
  setLocalStorageData(APP_STATE.storedResults);
}

/**
 * Удаляет аниме из списка отслеживания
 * @param {HTMLElement} target - Элемент, на котором произошел клик
 * @param {number} animeId - ID аниме для удаления
 */
function removeAnime(target, animeId) {
  if (!confirm('Remove this anime?')) return;

  target.closest('li').remove();
  APP_STATE.storedResults = APP_STATE.storedResults.filter(({ id }) => id !== animeId);
  setLocalStorageData(APP_STATE.storedResults);
  renderStoredAnime(APP_STATE.storedResults);
  APP_STATE.elements.storedAnime.classList.toggle('hidden', APP_STATE.storedResults.length === 0);

  updateSearchResults(animeId);
}

/**
 * Обновляет результаты поиска после удаления аниме
 * @param {number} animeId - ID удаленного аниме
 */
function updateSearchResults(animeId) {
  const searchItems = Array.from(APP_STATE.elements.searchResults.querySelectorAll('li'));
  searchItems.forEach((li) => {
    if (Number(li.dataset.id) === animeId) {
      li.querySelector('button').disabled = false;
    }
  });
}

initApp();
