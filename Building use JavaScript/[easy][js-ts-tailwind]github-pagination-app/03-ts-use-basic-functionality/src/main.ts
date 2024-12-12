/**
 * Этот код представляет собой веб-приложение для отображения списка пользователей GitHub с пагинацией.
 * Приложение загружает данные пользователей через API GitHub, разбивает их на страницы и отображает
 * в виде списка с возможностью переключения между страницами.
 */

import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';

/**
 * Интерфейс для конфигурации приложения
 * @interface
 */
interface AppConfig {
  /** Селектор корневого элемента */
  root: string;
  /** Объект с селекторами элементов */
  selectors: {
    /** Селектор списка пользователей */
    userList: string;
    /** Селектор элементов управления пагинацией */
    paginationControls: string;
  };
  /** URL для запроса данных пользователей GitHub */
  url: string;
}

/**
 * Конфигурация приложения
 * @constant
 */
const APP_CONFIG: AppConfig = {
  root: '#app',
  selectors: {
    userList: '[data-user-list]',
    paginationControls: '[data-pagination-controls]',
  },
  url: 'https://api.github.com/users?since=1&per_page=40',
};

/**
 * Интерфейс для состояния приложения
 * @interface
 */
interface AppState {
  /** Объект с элементами DOM */
  elements: {
    /** Элемент списка пользователей */
    userList: HTMLElement | null;
    /** Элемент управления пагинацией */
    paginationControls: HTMLElement | null;
  };
  /** Индекс текущей страницы */
  index: number;
  /** Массив страниц с пользователями */
  pages: GithubUser[][];
}

/**
 * Состояние приложения
 * @constant
 */
const APP_STATE: AppState = {
  elements: {
    userList: null,
    paginationControls: null,
  },
  index: 0,
  pages: [],
};

/**
 * Интерфейс для конфигурации уведомлений
 * @interface
 */
interface ToastConfig {
  /** CSS класс для уведомления */
  className: string;
  /** Продолжительность отображения уведомления в миллисекундах */
  duration: number;
  /** Гравитация (положение) уведомления */
  gravity: string;
  /** Позиция уведомления */
  position: string;
}

/**
 * Объект с утилитами приложения
 * @constant
 */
const APP_UTILS = {
  /**
   * Форматирует строку с data-атрибутами
   * @param {string} element - Строка с data-атрибутом
   * @returns {string} Отформатированная строка
   */
  renderDataAttributes: (element: string): string => element.slice(1, -1),

  /**
   * Конфигурация для уведомлений
   */
  toastConfig: {
    className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
    duration: 3000,
    gravity: 'bottom',
    position: 'center',
  } as ToastConfig,

  /**
   * Отображает уведомление
   * @param {string} message - Текст уведомления
   */
  showToast: (message: string): void => {
    // @ts-ignore
    Toastify({
      text: message,
      ...APP_UTILS.toastConfig,
    }).showToast();
  },

  /**
   * Обрабатывает ошибки и отображает уведомление
   * @param {string} message - Сообщение об ошибке
   * @param {Error | null} error - Объект ошибки (опционально)
   */
  handleError: (message: string, error: Error | null = null): void => {
    APP_UTILS.showToast(message);
    if (error) console.error(message, error);
  },
};

/**
 * Создает HTML-разметку приложения
 */
function createAppHTML(): void {
  const { root, selectors: { userList, paginationControls } } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='grid max-w-3xl w-full gap-4 mx-auto p-3'>
      <h1 class='text-2xl md:text-4xl font-bold text-center'>Custom Pagination</h1>
      <ul class='grid gap-3 sm:grid-cols-2 md:grid-cols-3' ${renderDataAttributes(userList)}></ul>
      <ul class='flex flex-wrap items-center justify-center gap-3' ${renderDataAttributes(paginationControls)}></ul>
    </div>
  `;
}

/**
 * Инициализирует DOM-элементы
 */
function initDOMElements(): void {
  APP_STATE.elements = {
    userList: document.querySelector(APP_CONFIG.selectors.userList),
    paginationControls: document.querySelector(APP_CONFIG.selectors.paginationControls),
  };
}

/**
 * Инициализирует приложение
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();

  (async () => {
    APP_STATE.pages = paginate(await getGithubUsers());
    renderUserList();
    APP_STATE.elements.paginationControls?.addEventListener('click', handlePaginationControlsClick);
  })();
}

/**
 * Интерфейс для пользователя GitHub
 * @interface
 */
interface GithubUser {
  /** URL аватара пользователя */
  avatar_url: string;
  /** Логин пользователя */
  login: string;
  /** URL профиля пользователя */
  html_url: string;
}

/**
 * Получает данные пользователей GitHub
 * @returns {Promise<GithubUser[]>} Массив пользователей GitHub
 */
async function getGithubUsers(): Promise<GithubUser[]> {
  try {
    const { data } = await axios.get<GithubUser[]>(APP_CONFIG.url);
    return data;
  } catch (error) {
    APP_UTILS.handleError('Error fetching users:', error as Error);
    return [];
  }
}

/**
 * Разбивает массив пользователей на страницы
 * @param {GithubUser[]} data - Массив пользователей
 * @param {number} itemsPerPage - Количество элементов на странице
 * @returns {GithubUser[][]} Массив страниц с пользователями
 */
function paginate(data: GithubUser[], itemsPerPage: number = 10): GithubUser[][] {
  return data.reduce((pages: GithubUser[][], item: GithubUser, index: number) => {
    const pageIndex = Math.floor(index / itemsPerPage);
    pages[pageIndex] = pages[pageIndex] || [];
    pages[pageIndex].push(item);
    return pages;
  }, []);
}

/**
 * Отрисовывает список пользователей
 * @param {GithubUser[]} items - Массив пользователей для отображения
 */
function renderUsers(items: GithubUser[]): void {
  if (APP_STATE.elements.userList) {
    APP_STATE.elements.userList.innerHTML = `
      ${items.map(({ avatar_url, login, html_url }) => `
        <li class='border bg-white min-h-[324px] overflow-hidden rounded'>
          <img class='object-cover w-full' src='${avatar_url}' alt='${login}'>
          <div class='gap-2 grid p-4 place-items-center'>
            <h4 class='font-bold text-lg'>${login}</h4>
            <a class='border hover:bg-gray-100 px-3 py-2.5 rounded transition-colors' href='${html_url}' target='_blank'>View profile</a>
          </div>
        </li>
      `).join('')}
    `;
  }
}

/**
 * Отрисовывает элементы управления пагинацией
 * @param {HTMLElement | null} container - Контейнер для элементов пагинации
 * @param {GithubUser[][]} pages - Массив страниц с пользователями
 * @param {number} activeIndex - Индекс активной страницы
 */
function renderPagination(container: HTMLElement | null, pages: GithubUser[][], activeIndex: number): void {
  if (!container) return;
  const createButton = (text: string, type: string, disabled: boolean): string => `
    <button class='px-2 py-1.5 border rounded ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:bg-slate-50'}' 
            data-type='${type}' ${disabled ? 'disabled' : ''}>
      ${text}
    </button>
  `;

  const pageButtons = pages.map((_, pageIndex) => `
    <li>
      <button class='px-4 py-1.5 border rounded hover:bg-slate-50 ${activeIndex === pageIndex ? 'bg-slate-100' : 'bg-white'}' 
              data-index='${pageIndex}'>
        ${pageIndex + 1}
      </button>
    </li>
  `);

  const prevButton = `<li>${createButton('Prev', 'prev', activeIndex <= 0)}</li>`;
  const nextButton = `<li>${createButton('Next', 'next', activeIndex >= pages.length - 1)}</li>`;

  container.innerHTML = [prevButton, ...pageButtons, nextButton].join('');
}

/**
 * Отрисовывает список пользователей и элементы управления пагинацией
 */
function renderUserList(): void {
  renderUsers(APP_STATE.pages[APP_STATE.index]);
  renderPagination(APP_STATE.elements.paginationControls, APP_STATE.pages, APP_STATE.index);
}

/**
 * Обрабатывает клики по элементам управления пагинацией
 * @param {MouseEvent} event - Событие клика
 */
function handlePaginationControlsClick(event: MouseEvent): void {
  const target = event.target as HTMLElement;
  const dataset = target.dataset;

  if (dataset.paginationControls) return;

  if (dataset.index) {
    APP_STATE.index = parseInt(dataset.index);
  } else if (dataset.type) {
    APP_STATE.index += dataset.type === 'next' ? 1 : -1;
  }
  renderUserList();
}

initApp();
