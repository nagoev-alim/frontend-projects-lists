/**
 * Этот код представляет собой приложение для поиска статей в Wikipedia.
 * Оно позволяет пользователям вводить поисковые запросы и отображает результаты,
 * полученные через API Wikipedia. Приложение использует Toastify для отображения
 * уведомлений и axios для выполнения HTTP-запросов.
 */

import './style.css';
import wikiLogo from '/logo.svg';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';

/**
 * Интерфейс для конфигурации приложения
 */
interface Config {
  /** Селектор корневого элемента */
  root: string;
  /** Селекторы для форм поиска и результатов */
  selectors: {
    searchForm: string;
    searchResults: string;
  };
  /** URL API Wikipedia для поиска */
  url: string;
}

/**
 * Интерфейс для состояния приложения
 */
interface State {
  /** Ссылки на DOM-элементы */
  elements: {
    searchForm: HTMLFormElement | null;
    searchFormButton: HTMLButtonElement | null;
    searchResults: HTMLUListElement | null;
  };
}

/**
 * Интерфейс для вспомогательных утилит
 */
interface Utils {
  /** Функция для рендеринга data-атрибутов */
  renderDataAttributes: (element: string) => string;
  /** Конфигурация для Toastify */
  toastConfig: Toastify.Options;
  /** Функция для отображения уведомлений */
  showToast: (message: string) => void;
  /** Функция для обработки ошибок */
  handleError: (message: string, error?: Error | null) => void;
}

/**
 * Интерфейс для результата поиска
 */
interface SearchResult {
  /** Заголовок статьи */
  title: string;
  /** Фрагмент текста статьи */
  snippet: string;
  /** Идентификатор страницы */
  pageid: number;
}

/**
 * Класс Wikipedia представляет основную функциональность приложения для поиска в Wikipedia
 */
class Wikipedia {
  /** Конфигурация приложения */
  private readonly config: Config;
  /** Состояние приложения */
  private state: State;
  /** Вспомогательные утилиты */
  private readonly utils: Utils;

  /**
   * Создает экземпляр класса Wikipedia и инициализирует приложение
   */
  constructor() {
    this.config = {
      root: '#app',
      selectors: {
        searchForm: '[data-search-form]',
        searchResults: '[data-search-results]',
      },
      url: 'https://en.wikipedia.org/w/api.php?action=query&list=search&srlimit=20&format=json&origin=*&srsearch=',
    };

    this.state = {
      elements: {
        searchForm: null,
        searchFormButton: null,
        searchResults: null,
      },
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
        Toastify({
          text: message,
          ...this.utils.toastConfig,
        }).showToast();
      },

      handleError: (message: string, error: Error | null = null): void => {
        this.utils.showToast(message);
        if (error) console.error(message, error);
      },
    };

    this.init();
  }

  /**
   * Создает HTML-структуру приложения
   */
  private createAppHTML(): void {
    const { root, selectors: { searchForm, searchResults } } = this.config;
    const { renderDataAttributes } = this.utils;
    const rootElement = document.querySelector<HTMLElement>(root);

    if (!rootElement) return;

    rootElement.innerHTML = `
    <div class='mx-auto grid w-full max-w-4xl items-start gap-4'>
      <div class='mx-auto grid w-full max-w-xl place-items-center gap-3 rounded border bg-white p-3'>
        <img src='${wikiLogo}' alt='Wikipedia'>
        <h1 class='text-center text-2xl font-bold md:text-4xl'>Search Wikipedia</h1>
        <form class='grid w-full gap-3' ${renderDataAttributes(searchForm)}>
          <label>
            <input class='w-full rounded border bg-slate-50 px-3 py-2 focus:border-blue-400 focus:outline-none' 
                   type='text' 
                   name='query' 
                   placeholder='Enter something'/>
          </label>
          <button class='border px-3 py-2 hover:bg-slate-50' type='submit'>Search</button>
        </form>
      </div>
      <ul class='hidden grid gap-3 sm:grid-cols-2 md:grid-cols-3' ${renderDataAttributes(searchResults)}></ul>
    </div>
  `;
  }

  /**
   * Инициализирует DOM-элементы
   */
  private initDOMElements(): void {
    this.state.elements = {
      searchForm: document.querySelector<HTMLFormElement>(this.config.selectors.searchForm),
      searchFormButton: document.querySelector<HTMLButtonElement>(`${this.config.selectors.searchForm} button[type="submit"]`),
      searchResults: document.querySelector<HTMLUListElement>(this.config.selectors.searchResults),
    };
  }

  /**
   * Инициализирует приложение
   */
  private init(): void {
    this.createAppHTML();
    this.initDOMElements();
    this.state.elements.searchForm?.addEventListener('submit', this.handleSearchFormSubmit.bind(this));
  }

  /**
   * Отображает результаты поиска
   * @param search - Массив результатов поиска
   */
  private renderSearchResults(search: SearchResult[]): void {
    if (!this.state.elements.searchResults) return;

    this.state.elements.searchResults.classList.remove('hidden');
    this.state.elements.searchResults.innerHTML = search
      .map(({ title, snippet, pageid }) => `
    <li class='rounded border bg-white p-3'>
      <a class='grid gap-2' href='https://en.wikipedia.org/?curid=${pageid}' target='_blank' rel='noopener noreferrer'>
        <h4 class='text-lg font-bold'>${title}</h4>
        <p>${snippet}</p>
      </a>
    </li>
  `).join('');
    const matches = this.state.elements.searchResults.querySelectorAll('.searchmatch');
    matches.forEach((match) => {
      match.classList.add('font-bold', 'text-red-500');
    });
  }

  /**
   * Обрабатывает отправку формы поиска
   * @param event - Событие отправки формы
   */
  private async handleSearchFormSubmit(event: Event): Promise<void> {
    event.preventDefault();
    const target = event.target as HTMLFormElement;
    const query = (target.query as HTMLInputElement).value.trim();
    if (!query) {
      this.utils.showToast('Please enter a search query');
      return;
    }
    try {
      this.setButtonState('Loading...', true);
      const searchResults = await this.fetchSearchResults(query);

      if (searchResults.length === 0) {
        this.utils.showToast('No results found');
        return;
      }
      this.renderSearchResults(searchResults);
    } catch (error) {
      this.utils.handleError('An error occurred while fetching data', error as Error);
    } finally {
      this.setButtonState('Search', false);
      target.reset();
    }
  }

  /**
   * Устанавливает состояние кнопки поиска
   * @param text - Текст кнопки
   * @param disabled - Флаг отключения кнопки
   */
  private setButtonState(text: string, disabled: boolean): void {
    if (this.state.elements.searchFormButton) {
      this.state.elements.searchFormButton.textContent = text;
      this.state.elements.searchFormButton.disabled = disabled;
    }
  }

  /**
   * Выполняет запрос к API Wikipedia для получения результатов поиска
   * @param query - Поисковый запрос
   * @returns Массив результатов поиска
   */
  private async fetchSearchResults(query: string): Promise<SearchResult[]> {
    const { data: { query: { search } } } = await axios.get<{ query: { search: SearchResult[] } }>(`${this.config.url}${query}`);
    return search;
  }
}

new Wikipedia();
