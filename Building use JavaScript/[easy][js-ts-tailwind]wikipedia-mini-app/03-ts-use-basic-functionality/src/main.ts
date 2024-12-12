/**
 * Это приложение для поиска статей в Wikipedia. Оно позволяет пользователям вводить
 * поисковые запросы и отображает результаты, полученные через API Wikipedia.
 * Приложение использует Toastify для отображения уведомлений и axios для HTTP-запросов.
 */

import './style.css';
import wikiLogo from '/logo.svg';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';

interface AppConfig {
  root: string;
  selectors: {
    searchForm: string;
    searchResults: string;
  };
  url: string;
}

const APP_CONFIG: AppConfig = {
  root: '#app',
  selectors: {
    searchForm: '[data-search-form]',
    searchResults: '[data-search-results]',
  },
  url: 'https://en.wikipedia.org/w/api.php?action=query&list=search&srlimit=20&format=json&origin=*&srsearch=',
};

interface AppState {
  elements: {
    searchForm: HTMLFormElement | null;
    searchFormButton: HTMLButtonElement | null;
    searchResults: HTMLUListElement | null;
  };
}

const APP_STATE: AppState = {
  elements: {
    searchForm: null,
    searchFormButton: null,
    searchResults: null,
  },
};

interface ToastConfig {
  className: string;
  duration: number;
  gravity: string;
  position: string;
}

interface AppUtils {
  renderDataAttributes: (element: string) => string;
  toastConfig: ToastConfig;
  showToast: (message: string) => void;
  handleError: (message: string, error?: Error | null) => void;
}

const APP_UTILS: AppUtils = {
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
      ...APP_UTILS.toastConfig,
    }).showToast();
  },

  handleError: (message: string, error: Error | null = null): void => {
    APP_UTILS.showToast(message);
    if (error) console.error(message, error);
  },
};

function createAppHTML(): void {
  const { root, selectors: { searchForm, searchResults } } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
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

function initDOMElements(): void {
  APP_STATE.elements = {
    searchForm: document.querySelector<HTMLFormElement>(APP_CONFIG.selectors.searchForm),
    searchFormButton: document.querySelector<HTMLButtonElement>(`${APP_CONFIG.selectors.searchForm} button[type="submit"]`),
    searchResults: document.querySelector<HTMLUListElement>(APP_CONFIG.selectors.searchResults),
  };
}

function initApp(): void {
  createAppHTML();
  initDOMElements();
  APP_STATE.elements.searchForm?.addEventListener('submit', handleSearchFormSubmit);
}

interface SearchResult {
  title: string;
  snippet: string;
  pageid: number;
}

function renderSearchResults(search: SearchResult[]): void {
  if (!APP_STATE.elements.searchResults) return;

  APP_STATE.elements.searchResults.classList.remove('hidden');
  APP_STATE.elements.searchResults.innerHTML = search
    .map(({ title, snippet, pageid }) => `
    <li class='rounded border bg-white p-3'>
      <a class='grid gap-2' href='https://en.wikipedia.org/?curid=${pageid}' target='_blank' rel='noopener noreferrer'>
        <h4 class='text-lg font-bold'>${title}</h4>
        <p>${snippet}</p>
      </a>
    </li>
  `).join('');
  const matches = APP_STATE.elements.searchResults.querySelectorAll('.searchmatch');
  matches.forEach((match) => {
    match.classList.add('font-bold', 'text-red-500');
  });
}

async function handleSearchFormSubmit(event: Event): Promise<void> {
  event.preventDefault();
  const target = event.target as HTMLFormElement;
  const query = (target.query as HTMLInputElement).value.trim();
  if (!query) {
    APP_UTILS.showToast('Please enter a search query');
    return;
  }
  try {
    setButtonState('Loading...', true);
    const searchResults = await fetchSearchResults(query);

    if (searchResults.length === 0) {
      APP_UTILS.showToast('No results found');
      return;
    }
    renderSearchResults(searchResults);
  } catch (error) {
    APP_UTILS.handleError('An error occurred while fetching data', error as Error);
  } finally {
    setButtonState('Search', false);
    target.reset();
  }
}

function setButtonState(text: string, disabled: boolean): void {
  if (APP_STATE.elements.searchFormButton) {
    APP_STATE.elements.searchFormButton.textContent = text;
    APP_STATE.elements.searchFormButton.disabled = disabled;
  }
}

async function fetchSearchResults(query: string): Promise<SearchResult[]> {
  const { data: { query: { search } } } = await axios.get<{ query: { search: SearchResult[] } }>(`${APP_CONFIG.url}${query}`);
  return search;
}

initApp();
