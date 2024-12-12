/**
 * Этот код реализует пагинацию для отображения списка пользователей GitHub.
 * Он загружает данные пользователей с API GitHub, разбивает их на страницы
 * и предоставляет интерфейс для навигации по этим страницам.
 */

import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';

/**
 * Интерфейс для конфигурации приложения.
 */
interface Config {
  /** Корневой элемент приложения */
  root: string;
  /** Селекторы для элементов DOM */
  selectors: {
    /** Селектор для списка пользователей */
    userList: string;
    /** Селектор для элементов управления пагинацией */
    paginationControls: string;
  };
  /** URL для получения данных пользователей GitHub */
  url: string;
}

/**
 * Интерфейс для состояния приложения.
 */
interface State {
  /** Элементы DOM */
  elements: {
    /** Элемент списка пользователей */
    userList: HTMLElement | null;
    /** Элемент управления пагинацией */
    paginationControls: HTMLElement | null;
  };
  /** Текущий индекс страницы */
  index: number;
  /** Массив страниц с данными пользователей */
  pages: User[][];
}

/**
 * Интерфейс для данных пользователя GitHub.
 */
interface User {
  /** URL аватара пользователя */
  avatar_url: string;
  /** Логин пользователя */
  login: string;
  /** URL профиля пользователя на GitHub */
  html_url: string;
}

/**
 * Класс, реализующий функционал пагинации.
 */
class Pagination {
  /** Конфигурация приложения */
  private readonly config: Config;
  /** Состояние приложения */
  private state: State;
  /** Вспомогательные утилиты */
  private readonly utils: {
    /** Функция для обработки атрибутов данных */
    renderDataAttributes: (element: string) => string;
    /** Функция для обработки ошибок */
    handleError: (message: string, error?: Error) => void;
  };

  /**
   * Создает экземпляр класса Pagination.
   */
  constructor() {
    this.config = {
      root: '#app',
      selectors: {
        userList: '[data-user-list]',
        paginationControls: '[data-pagination-controls]',
      },
      url: 'https://api.github.com/users?since=1&per_page=40',
    };

    this.state = {
      elements: {
        userList: null,
        paginationControls: null,
      },
      index: 0,
      pages: [],
    };

    this.utils = {
      renderDataAttributes: (element: string): string => element.slice(1, -1),
      handleError: (message: string, error: Error | null = null): void => {
        Toastify({
          text: message,
          className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
          duration: 3000,
          gravity: 'bottom',
          position: 'center',
        }).showToast();
        if (error) console.error(message, error);
      },
    };

    this.init();
  }

  /**
   * Создает HTML-разметку приложения.
   */
  private createAppHTML(): void {
    const { root, selectors: { userList, paginationControls } } = this.config;
    const { renderDataAttributes } = this.utils;
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
   * Инициализирует DOM-элементы.
   */
  private initDOMElements(): void {
    this.state.elements = {
      userList: document.querySelector(this.config.selectors.userList),
      paginationControls: document.querySelector(this.config.selectors.paginationControls),
    };
  }

  /**
   * Инициализирует приложение.
   */
  private async init(): Promise<void> {
    this.createAppHTML();
    this.initDOMElements();

    this.state.pages = this.paginate(await this.getGithubUsers());
    this.renderUserList();
    this.state.elements.paginationControls?.addEventListener('click', this.handlePaginationControlsClick.bind(this));
  }

  /**
   * Получает данные пользователей GitHub.
   * @returns Массив пользователей
   */
  private async getGithubUsers(): Promise<User[]> {
    try {
      const { data } = await axios.get<User[]>(this.config.url);
      return data;
    } catch (error) {
      this.utils.handleError('Error fetching users:', error as Error);
      return [];
    }
  }

  /**
   * Разбивает массив пользователей на страницы.
   * @param data Массив пользователей
   * @param itemsPerPage Количество элементов на странице
   * @returns Массив страниц с пользователями
   */
  private paginate(data: User[], itemsPerPage: number = 10): User[][] {
    return data.reduce((pages: User[][], item: User, index: number) => {
      const pageIndex = Math.floor(index / itemsPerPage);
      pages[pageIndex] = pages[pageIndex] || [];
      pages[pageIndex].push(item);
      return pages;
    }, []);
  }

  /**
   * Отрисовывает список пользователей.
   * @param items Массив пользователей для отображения
   */
  private renderUsers(items: User[]): void {
    if (this.state.elements.userList) {
      this.state.elements.userList.innerHTML = `
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
   * Отрисовывает элементы управления пагинацией.
   * @param container Контейнер для элементов управления
   * @param pages Массив страниц
   * @param activeIndex Индекс активной страницы
   */
  private renderPagination(container: HTMLElement | null, pages: User[][], activeIndex: number): void {
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
   * Отрисовывает список пользователей и элементы управления пагинацией.
   */
  private renderUserList(): void {
    this.renderUsers(this.state.pages[this.state.index]);
    this.renderPagination(this.state.elements.paginationControls, this.state.pages, this.state.index);
  }

  /**
   * Обрабатывает клик по элементам управления пагинацией.
   * @param event Событие клика
   */
  private handlePaginationControlsClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const dataset = target.dataset;

    if (!dataset || dataset.paginationControls !== undefined) return;

    if (dataset.index) {
      this.state.index = parseInt(dataset.index);
    } else if (dataset.type) {
      this.state.index += dataset.type === 'next' ? 1 : -1;
    }
    this.renderUserList();
  }
}

new Pagination();
