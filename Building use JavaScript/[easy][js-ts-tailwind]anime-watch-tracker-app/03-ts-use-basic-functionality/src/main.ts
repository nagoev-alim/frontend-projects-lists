/**
 * @description
 * Этот файл содержит основную логику приложения для отслеживания аниме.
 * Приложение позволяет пользователям искать аниме, добавлять их в список отслеживания,
 * отмечать просмотренные эпизоды и удалять аниме из списка.
 *
 * Основные функции:
 * - Поиск аниме через API Jikan
 * - Добавление аниме в список отслеживания
 * - Отображение сохраненных аниме
 * - Обновление количества просмотренных эпизодов
 * - Удаление аниме из списка отслеживания
 * - Сохранение данных в локальное хранилище браузера
 *
 * Приложение использует TypeScript для типизации, Axios для HTTP-запросов,
 * и Toastify для отображения уведомлений.
 */
import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';

/**
 * @interface AppConfig
 * @description Конфигурация приложения.
 */
interface AppConfig {
  /** Корневой элемент приложения */
  root: string;
  /** Селекторы для различных элементов DOM */
  selectors: {
    /** Селектор формы поиска */
    searchForm: string;
    /** Селектор результатов поиска */
    searchResults: string;
    /** Селектор сохраненных аниме */
    storedAnime: string;
  };
  /** URL API для получения данных об аниме */
  API_URL: string;
}

/**
 * @interface AppState
 * @description Состояние приложения.
 */
interface AppState {
  /** DOM элементы приложения */
  elements: {
    [key: string]: HTMLElement | HTMLFormElement | HTMLButtonElement | HTMLUListElement | null;
  };
  /** Результаты поиска аниме */
  searchResults: AnimeData[];
  /** Сохраненные аниме */
  storedResults: StoredAnime[];
}

/**
 * @interface AnimeData
 * @description Данные об аниме, получаемые от API.
 */
interface AnimeData {
  /** Уникальный идентификатор аниме на MyAnimeList */
  mal_id: number;
  /** Изображения аниме */
  images: {
    jpg: {
      /** URL изображения в формате JPG */
      image_url: string;
    };
  };
  /** Название аниме */
  title: string;
  /** Количество эпизодов */
  episodes: number;
}

/**
 * @interface StoredAnime
 * @description Структура данных для сохраненного аниме.
 */
interface StoredAnime {
  /** Общее количество эпизодов */
  episodes: number;
  /** Название аниме */
  title: string;
  /** Уникальный идентификатор аниме */
  id: number;
  /** URL изображения аниме */
  img: string;
  /** Количество просмотренных эпизодов */
  episodesFinish: number;
}

/**
 * @interface AppUtils
 * @description Утилиты приложения.
 */
interface AppUtils {
  /** Функция для рендеринга data-атрибутов */
  renderDataAttributes: (element: string) => string;
  /** Конфигурация для всплывающих уведомлений */
  toastConfig: {
    className: string;
    duration: number;
    gravity: string;
    position: string;
  };
  /** Функция для отображения всплывающего уведомления */
  showToast: (message: string) => void;
  /** Функция для обработки ошибок */
  handleError: (message: string, error?: unknown) => void;
}

/**
 * @constant APP_CONFIG
 * @description Конфигурация приложения.
 */
const APP_CONFIG: AppConfig = {
  root: '#app',
  selectors: {
    searchForm: '[data-search-form]',
    searchResults: '[data-search-results]',
    storedAnime: '[data-stored-anime]',
  },
  API_URL: 'https://api.jikan.moe',
};

/**
 * @constant APP_STATE
 * @description Состояние приложения.
 */
const APP_STATE: AppState = {
  elements: {},
  searchResults: [],
  storedResults: [],
};

/**
 * @constant APP_UTILS
 * @description Утилиты приложения.
 */
const APP_UTILS: AppUtils = {
  /**
   * Преобразует строку селектора в data-атрибут.
   * @param {string} element - Строка селектора.
   * @returns {string} Data-атрибут.
   */
  renderDataAttributes: (element: string): string => element.slice(1, -1),

  /**
   * Конфигурация для всплывающих уведомлений.
   */
  toastConfig: {
    className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
    duration: 3000,
    gravity: 'bottom',
    position: 'center',
  },

  /**
   * Отображает всплывающее уведомление.
   * @param {string} message - Текст уведомления.
   */
  showToast: (message: string): void => {
    // @ts-ignore
    Toastify({
      text: message,
      ...APP_UTILS.toastConfig,
    }).showToast();
  },

  /**
   * Обрабатывает ошибки и отображает уведомление.
   * @param {string} message - Сообщение об ошибке.
   * @param {unknown} [error] - Объект ошибки (опционально).
   */
  handleError: (message: string, error: unknown = null): void => {
    APP_UTILS.showToast(message);
    if (error) console.error(message, error);
  },
};

/**
 * Создает HTML-структуру приложения.
 * @returns {void}
 */
function createAppHTML(): void {
  const {
    selectors: {
      searchForm,
      searchResults,
      storedAnime,
    },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const { root } = APP_CONFIG;
  const rootElement = document.querySelector<HTMLElement>(root);

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
 * Инициализирует DOM-элементы приложения.
 * @returns {void}
 */
function initDOMElements(): void {
  APP_STATE.elements = {
    searchForm: document.querySelector<HTMLFormElement>(APP_CONFIG.selectors.searchForm),
    searchFormSubmit: document.querySelector<HTMLButtonElement>(`${APP_CONFIG.selectors.searchForm} button[type='submit']`),
    searchResults: document.querySelector<HTMLUListElement>(APP_CONFIG.selectors.searchResults),
    storedAnime: document.querySelector<HTMLUListElement>(APP_CONFIG.selectors.storedAnime),
  };
}

/**
 * Инициализирует приложение.
 * @returns {void}
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();
  APP_STATE.storedResults = getLocalStorageData();
  displayLocalStorageData();
  APP_STATE.elements.searchForm?.addEventListener('submit', handleSearchFormSubmit);
  APP_STATE.elements.searchResults?.addEventListener('click', handleSearchResultClick);
  APP_STATE.elements.storedAnime?.addEventListener('click', handleStoredAnimeClick);
}

/**
 * Получает данные из локального хранилища.
 * @returns {StoredAnime[]} Массив сохраненных аниме.
 */
function getLocalStorageData(): StoredAnime[] {
  return JSON.parse(localStorage.getItem('anime') || '[]');
}

/**
 * Сохраняет данные в локальное хранилище.
 * @param {StoredAnime[]} items - Массив аниме для сохранения.
 * @returns {void}
 */
function setLocalStorageData(items: StoredAnime[]): void {
  localStorage.setItem('anime', JSON.stringify(items));
}

/**
 * Отображает данные из локального хранилища.
 * @returns {void}
 */
function displayLocalStorageData(): void {
  const storedList = getLocalStorageData();
  APP_STATE.elements.storedAnime?.classList.toggle('hidden', storedList.length === 0);
  if (storedList.length > 0) {
    renderStoredAnime(storedList);
  }
}

/**
 * Рендерит список сохраненных аниме.
 * @param {StoredAnime[]} storedList - Массив сохраненных аниме.
 * @returns {void}
 */
const renderStoredAnime = (storedList: StoredAnime[]): void => {
  if (APP_STATE.elements.storedAnime) {
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
  }
};

/**
 * Обрабатывает отправку формы поиска.
 * @param {Event} event - Событие отправки формы.
 * @returns {Promise<void>}
 */
async function handleSearchFormSubmit(event: Event): Promise<void> {
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  const query = (form.query as HTMLInputElement).value.trim();
  if (!query?.length) {
    APP_UTILS.showToast('Please enter an anime name');
  }
  await getAnimeData(query);
}

/**
 * Получает данные об аниме по запросу.
 * @param {string} query - Поисковый запрос.
 * @returns {Promise<void>}
 */
async function getAnimeData(query: string): Promise<void> {
  const searchButton = APP_STATE.elements.searchFormSubmit;
  if (!searchButton || !(searchButton instanceof HTMLButtonElement)) return;

  try {
    setSearchButtonState(searchButton, true, 'Loading...');
    APP_STATE.searchResults = await fetchAnimeData(query);
    renderSearchAnime(APP_STATE.searchResults);
  } catch (error) {
    APP_UTILS.handleError('Failed to fetch anime data', error);
  } finally {
    setSearchButtonState(searchButton, false, 'Search');
  }
}

/**
 * Устанавливает состояние кнопки поиска.
 * @param {HTMLButtonElement} button - Кнопка поиска.
 * @param {boolean} isDisabled - Флаг отключения кнопки.
 * @param {string} text - Текст кнопки.
 * @returns {void}
 */
function setSearchButtonState(button: HTMLButtonElement, isDisabled: boolean, text: string): void {
  button.disabled = isDisabled;
  button.textContent = text;
}

/**
 * Выполняет запрос к API для получения данных об аниме.
 * @param {string} query - Поисковый запрос.
 * @returns {Promise<AnimeData[]>} Массив данных об аниме.
 */
async function fetchAnimeData(query: string): Promise<AnimeData[]> {
  const response = await axios.get(`${APP_CONFIG.API_URL}/v4/anime`, {
    params: { q: query },
  });
  return response.data.data;
}

/**
 * Рендерит результаты поиска аниме.
 * @param {AnimeData[]} searchResults - Массив результатов поиска.
 * @returns {void}
 */
function renderSearchAnime(searchResults: AnimeData[]): void {
  if (APP_STATE.elements.searchResults) {
    APP_STATE.elements.searchResults.classList.remove('hidden');
    APP_STATE.elements.searchResults.innerHTML = searchResults
      .map((anime) => createAnimeListItem(anime))
      .join('');
  }
}

/**
 * Создает элемент списка для аниме.
 * @param {AnimeData} анимеData - Данные об аниме.
 * @returns {string} HTML-строка, представляющая элемент списка аниме.
 */
function createAnimeListItem({ mal_id, images, title, episodes }: AnimeData): string {
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
 * Обрабатывает клик по результатам поиска.
 * @param {MouseEvent} event - Событие клика.
 * @returns {void}
 */
function handleSearchResultClick(event: Event): void {
  const target = event.target as HTMLElement;
  if (!target.matches('[data-add]')) return;

  const animeData = JSON.parse((target as HTMLButtonElement).dataset.add || '{}');
  const { episodes, title, id, img } = animeData;
  APP_STATE.storedResults = [
    ...APP_STATE.storedResults,
    { episodes, title, id, img, episodesFinish: 0 },
  ];
  setLocalStorageData(APP_STATE.storedResults);

  (target as HTMLButtonElement).disabled = true;
  APP_STATE.elements.storedAnime?.classList.remove('hidden');
  renderStoredAnime(APP_STATE.storedResults);
}

/**
 * Обрабатывает клик по сохраненному аниме.
 * @param {MouseEvent} event - Событие клика.
 * @returns {void}
 */
function handleStoredAnimeClick(event: Event): void {
  const target = event.target as HTMLElement;
  const body = target.closest('.body') as HTMLElement;
  if (!body) return;
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
 * Обновляет количество просмотренных эпизодов.
 * @param {HTMLElement} body - Элемент, содержащий информацию об аниме.
 * @param {number} animeId - ID аниме.
 * @param {number} change - Изменение количества эпизодов.
 * @returns {void}
 */
function updateEpisodeCount(body: HTMLElement, animeId: number, change: number): void {
  const watchedCount = body.querySelector('[data-finished]') as HTMLElement;
  const totalEpisodes = Number(
    (body.querySelector('[data-all-episodes]') as HTMLElement).textContent,
  );
  const newCount = Math.max(
    0,
    Math.min(totalEpisodes, Number(watchedCount.textContent) + change),
  );

  watchedCount.textContent = newCount.toString();
  updateStoredResults(animeId, newCount);
}

/**
 * Обновляет сохраненные результаты.
 * @param {number} animeId - ID аниме.
 * @param {number} newCount - Новое количество просмотренных эпизодов.
 * @returns {void}
 */
function updateStoredResults(animeId: number, newCount: number): void {
  APP_STATE.storedResults = APP_STATE.storedResults.map((anime) =>
    anime.id === animeId ? { ...anime, episodesFinish: newCount } : anime,
  );
  setLocalStorageData(APP_STATE.storedResults);
}

/**
 * Удаляет аниме из сохраненного списка.
 * @param {HTMLElement} target - Элемент, инициировавший удаление.
 * @param {number} animeId - ID аниме для удаления.
 * @returns {void}
 */
function removeAnime(target: HTMLElement, animeId: number): void {
  if (!confirm('Remove this anime?')) return;

  target.closest('li')?.remove();
  APP_STATE.storedResults = APP_STATE.storedResults.filter(({ id }) => id !== animeId);
  setLocalStorageData(APP_STATE.storedResults);
  renderStoredAnime(APP_STATE.storedResults);
  APP_STATE.elements.storedAnime?.classList.toggle('hidden', APP_STATE.storedResults.length === 0);

  updateSearchResults(animeId);
}

/**
 * Обновляет результаты поиска после удаления аниме.
 * @param {number} animeId - ID удаленного аниме.
 * @returns {void}
 */
function updateSearchResults(animeId: number): void {
  const searchItems = Array.from(APP_STATE.elements.searchResults?.querySelectorAll('li') || []);
  searchItems.forEach((li) => {
    if (Number(li.dataset.id) === animeId) {
      (li.querySelector('button') as HTMLButtonElement).disabled = false;
    }
  });
}

initApp();
