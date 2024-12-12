/**
 * Этот код представляет собой приложение для управления списком книг.
 * Он позволяет пользователям искать книги по ISBN, добавлять книги вручную,
 * отображать список книг и удалять книги из списка.
 * Приложение использует локальное хранилище для сохранения данных и
 * взаимодействует с Google Books API для поиска информации о книгах по ISBN.
 */

import './style.css';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

/**
 * Интерфейс конфигурации приложения
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента приложения
 * @property {Object} selectors - Объект с селекторами элементов DOM
 * @property {string[]} fields - Массив полей для формы добавления книги
 * @property {string} apiKey - Ключ API для Google Books
 * @property {string} url - URL для запросов к Google Books API
 */
interface AppConfig {
  root: string;
  selectors: {
    isbnSearchForm: string;
    isbnSearchSpinner: string;
    isbnSearchResults: string;
    manualBookForm: string;
    bookList: string;
  };
  fields: string[];
  apiKey: string;
  url: string;
}

/**
 * Интерфейс состояния приложения
 * @typedef {Object} AppState
 * @property {Object} elements - Объект с ссылками на элементы DOM
 * @property {Book[]} books - Массив книг
 * @property {GoogleBookItem[]} booksISBN - Массив результатов поиска по ISBN
 */
interface AppState {
  elements: {
    isbnSearchForm: HTMLFormElement | null;
    isbnSearchSpinner: HTMLElement | null;
    isbnSearchResults: HTMLUListElement | null;
    manualBookForm: HTMLFormElement | null;
    bookList: HTMLUListElement | null;
  };
  books: Book[];
  booksISBN: GoogleBookItem[];
}

/**
 * Интерфейс книги
 * @typedef {Object} Book
 * @property {string} title - Название книги
 * @property {string} author - Автор книги
 * @property {string} isbn - ISBN книги
 * @property {string} id - Уникальный идентификатор книги
 */
interface Book {
  title: string;
  author: string;
  isbn: string;
  id: string;
}

/**
 * Интерфейс элемента книги из Google Books API
 * @typedef {Object} GoogleBookItem
 * @property {string} id - Идентификатор книги
 * @property {Object} volumeInfo - Информация о книге
 */
interface GoogleBookItem {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    industryIdentifiers: Array<{ identifier: string }>;
    imageLinks?: {
      thumbnail: string;
    };
    previewLink: string;
  };
}

/**
 * Объект конфигурации приложения
 * @type {AppConfig}
 */
const APP_CONFIG: AppConfig = {
  root: '#app',
  selectors: {
    isbnSearchForm: '[data-isbn-search-form]',
    isbnSearchSpinner: '[data-isbn-search-spinner]',
    isbnSearchResults: '[data-isbn-search-results]',
    manualBookForm: '[data-manual-book-form]',
    bookList: '[data-book-list]',
  },
  fields: ['Title', 'Author', 'ISBN', ''],
  apiKey: 'AIzaSyAB2_GLzHnLIODDfGShsLcScvark6cgMdY',
  url: 'https://www.googleapis.com/books/v1/volumes?q=',
};

/**
 * Объект состояния приложения
 * @type {AppState}
 */
const APP_STATE: AppState = {
  elements: {
    isbnSearchForm: null,
    isbnSearchSpinner: null,
    isbnSearchResults: null,
    manualBookForm: null,
    bookList: null,
  },
  books: [],
  booksISBN: [],
};

/**
 * Объект с утилитарными функциями приложения
 * @type {Object}
 */
const APP_UTILS = {
  /**
   * Делает первую букву строки заглавной
   * @param {string} str - Исходная строка
   * @returns {string} Строка с заглавной первой буквой
   */
  capitalizeFirstLetter: (str: string): string => str.charAt(0).toUpperCase() + str.slice(1),

  /**
   * Преобразует селектор в строку для data-атрибута
   * @param {string} element - Селектор элемента
   * @returns {string} Строка для data-атрибута
   */
  renderDataAttributes: (element: string): string => element.slice(1, -1),

  /**
   * Конфигурация для toast-уведомлений
   * @type {Toastify.Options}
   */
  toastConfig: {
    className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
    duration: 3000,
    gravity: 'bottom',
    position: 'center',
  },

  /**
   * Показывает toast-уведомление
   * @param {string} message - Сообщение для отображения
   */
  showToast: (message: string): void => {
    // @ts-ignore
    Toastify({
      text: message,
      ...APP_UTILS.toastConfig,
    }).showToast();
  },

  /**
   * Обрабатывает ошибки и показывает уведомление
   * @param {string} message - Сообщение об ошибке
   * @param {Error | null} [error] - Объект ошибки (необязательный)
   */
  handleError: (message: string, error: Error | null = null): void => {
    APP_UTILS.showToast(message);
    if (error) console.error(message, error);
  },

  /**
   * Получает данные из локального хранилища
   * @returns {Book[]} Массив книг
   */
  getLocalStorageData: (): Book[] => JSON.parse(localStorage.getItem('books') || '[]'),

  /**
   * Сохраняет данные в локальное хранилище
   * @param {Book[]} items - Массив книг для сохранения
   * @param {string} name - Ключ для сохранения в localStorage
   */
  setLocalStorageData: (items: Book[], name: string): void => {
    localStorage.setItem(name, JSON.stringify(items));
  },

  /**
   * Удаляет книгу из локального хранилища
   * @param {string} id - Идентификатор книги для удаления
   * @param {Book[]} target - Массив книг
   * @param {string} name - Ключ в localStorage
   */
  deleteFromLocalStorage: (id: string, target: Book[], name: string): void => {
    const updatedData = target.filter(item => item.id !== id);
    APP_UTILS.setLocalStorageData(updatedData, name);
  },

  /**
   * Удаляет дубликаты книг по ISBN
   * @param {Book[]} array - Массив книг
   * @returns {Book[]} Массив уникальных книг
   */
  getUniqueArray: (array: Book[]): Book[] => array.filter((item, index, self) =>
    index === self.findIndex((t) => t.isbn === item.isbn),
  ),

  /**
   * Фильтрует и преобразует массив полей
   * @param {string[]} fields - Массив полей
   * @returns {string[]} Отфильтрованный и преобразованный массив полей
   */
  getFields: (fields: string[]): string[] => fields
    .filter(field => field !== '')
    .map(field => field.toLowerCase()),

  /**
   * Проверяет, является ли строка валидным ISBN
   * @param {string} query - Строка для проверки
   * @returns {boolean} true, если строка является валидным ISBN, иначе false
   */
  isValidIsbn: (query: string): boolean => /^[0-9-]+$/.test(query),
};

/**
 * Создает HTML-разметку приложения
 */
function createAppHTML(): void {
  const {
    root,
    selectors: {
      isbnSearchForm,
      isbnSearchSpinner,
      isbnSearchResults,
      manualBookForm,
      bookList,
    },
  } = APP_CONFIG;
  const { renderDataAttributes, getFields, capitalizeFirstLetter } = APP_UTILS;
  const rootElement = document.querySelector<HTMLElement>(root);

  if (!rootElement) return;

  const fieldsHTML = getFields(APP_CONFIG.fields);
  rootElement.innerHTML = `
    <div class='mx-auto grid w-full max-w-7xl gap-3'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>Book List</h1>

      <div class='grid items-start gap-3 lg:grid-cols-2'>
        <div class='grid gap-3 rounded border bg-white p-3'>
          <h3 class='text-lg font-bold lg:text-2xl'>Search use ISBN</h3>
          <form ${renderDataAttributes(isbnSearchForm)}>
            <input class='w-full rounded border bg-slate-50 px-3 py-2 focus:border-blue-400 focus:outline-none' type='text' name='query' placeholder='ISBN'/>
          </form>
          <div class='hidden' role='status' ${renderDataAttributes(isbnSearchSpinner)}>
            <div class='flex justify-center'>
              <svg aria-hidden='true' class='mr-2 h-8 w-8 animate-spin fill-gray-600 text-gray-200 dark:fill-gray-300 dark:text-gray-600' viewBox='0 0 100 101' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <path d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z' fill='currentColor'/>
                <path d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z' fill='currentFill'/>
              </svg>
              <span class='sr-only'>Loading...</span>
            </div>
          </div>
          <ul class='grid grid-cols-2 gap-3' ${renderDataAttributes(isbnSearchResults)}></ul>
        </div>

        <div class='grid gap-3 rounded border bg-white p-3'>
          <h3 class='text-lg font-bold lg:text-2xl'>Fill manually</h3>
          <form class='grid gap-3' ${renderDataAttributes(manualBookForm)}>
            <ul class='grid gap-3'>
              ${fieldsHTML.map(i => `
              <li>
                <label class='grid gap-2'>
                  <span class='font-medium'>${capitalizeFirstLetter(i)}</span>
                  <input class='w-full rounded border bg-slate-50 px-3 py-2 focus:border-blue-400 focus:outline-none' type='text' name='${i}' placeholder='${capitalizeFirstLetter(i)}'>
                </label>
              </li>
              `).join('')}
            </ul>
            <button class='border px-3 py-2 hover:bg-slate-50' type='submit'>Add Book</button>
          </form>
        </div>
      </div>

      <div>
        <ul class='grid grid-cols-[1.5fr_1.5fr_1.5fr_.5fr]'>
          ${getFields(APP_CONFIG.fields).map(i => `<li class='border bg-white p-2 font-medium'>${capitalizeFirstLetter(i)}</li>`).join('')}
        </ul>
        <ul ${renderDataAttributes(bookList)}></ul>
      </div>
    </div>
  `;
}

/**
 * Инициализирует DOM-элементы приложения.
 * Сохраняет ссылки на основные элементы интерфейса в объекте APP_STATE.elements.
 */
function initDOMElements(): void {
  APP_STATE.elements = {
    isbnSearchForm: document.querySelector<HTMLFormElement>(APP_CONFIG.selectors.isbnSearchForm),
    isbnSearchSpinner: document.querySelector<HTMLElement>(APP_CONFIG.selectors.isbnSearchSpinner),
    isbnSearchResults: document.querySelector<HTMLUListElement>(APP_CONFIG.selectors.isbnSearchResults),
    manualBookForm: document.querySelector<HTMLFormElement>(APP_CONFIG.selectors.manualBookForm),
    bookList: document.querySelector<HTMLUListElement>(APP_CONFIG.selectors.bookList),
  };
}

/**
 * Инициализирует приложение.
 * Создает HTML-структуру, инициализирует DOM-элементы, загружает данные из localStorage,
 * отображает список книг и устанавливает обработчики событий.
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();
  APP_STATE.books = APP_UTILS.getLocalStorageData();
  renderBookList(APP_STATE.books);
  APP_STATE.elements.manualBookForm?.addEventListener('submit', handleManualBookFormSubmit);
  APP_STATE.elements.isbnSearchForm?.addEventListener('submit', handleIsbnSearchFormSubmit);
  APP_STATE.elements.bookList?.addEventListener('click', handleBookListClick);
  APP_STATE.elements.isbnSearchResults?.addEventListener('click', handleIsbnSearchResultsClick);
}

/**
 * Отображает список книг на странице.
 * @param {Book[]} items - Массив объектов книг для отображения.
 */
function renderBookList(items: Book[]): void {
  if (APP_STATE.elements.bookList) {
    APP_STATE.elements.bookList.innerHTML = items.map((item) => `
        <li class='grid grid-cols-[1.5fr_1.5fr_1.5fr_.5fr]'>
        ${['title', 'author', 'isbn'].map(prop => `
          <div class='bg-white border p-2'><p>${item[prop as keyof Book]}</p></div>
        `).join('')}
        <div class='bg-white border p-2'><button data-id='${item.id}'>&times;</button></div>
      </li>
    `).join('');
  }
}

/**
 * Отображает результаты поиска книг по ISBN.
 * @param {GoogleBookItem[]} items - Массив объектов книг, полученных по ISBN.
 */
function renderBookIsbn(items: GoogleBookItem[]): void {
  if (APP_STATE.elements.isbnSearchResults) {
    APP_STATE.elements.isbnSearchResults.innerHTML = items.map(({ volumeInfo, id }) => {
      const { title, previewLink, authors, imageLinks } = volumeInfo;
      const isBookAdded = APP_STATE.books.some(book => book.id === id);
      const bookItemClass = isBookAdded ? 'opacity-25 pointer-events-none cursor-allowed' : '';
      const imageUrl = imageLinks?.thumbnail || '#';
      const authorInfo = authors && authors.length ? `<p>${authors[0]}</p>` : '';

      return `
      <li class='grid gap-2 items-end ${bookItemClass}'>
        <img src='${imageUrl}' alt='${title}'>
        <h3><a class='font-bold' href='${previewLink}' target='_blank'>${title}</a></h3>
        ${authorInfo}
        <button class='px-3 py-2 border hover:bg-slate-50' data-isbn-id='${id}'>Add</button>
      </li>
    `;
    }).join('');
  }
}

/**
 * Обрабатывает отправку формы для ручного добавления книги.
 * Валидирует поля, создает новую запись книги и обновляет список.
 * @param {Event} event - Событие отправки формы.
 */
function handleManualBookFormSubmit(event: Event): void {
  event.preventDefault();
  const target = event.target as HTMLFormElement;
  const formData = new FormData(target);
  const { title, author, isbn } = Object.fromEntries(formData) as { [key: string]: string };

  if (!validateFields({ title, author, isbn })) {
    return;
  }

  const newEntry: Book = { title, author, isbn, id: uuidv4() };
  APP_STATE.books = APP_UTILS.getUniqueArray([newEntry, ...APP_STATE.books]);

  APP_UTILS.setLocalStorageData(APP_STATE.books, 'books');
  renderBookList(APP_STATE.books);
  target.reset();
}

/**
 * Переключает видимость спиннера загрузки при поиске по ISBN.
 * @param {boolean} isVisible - Флаг видимости спиннера.
 */
function toggleSearchSpinner(isVisible: boolean): void {
  APP_STATE.elements.isbnSearchSpinner?.classList.toggle('hidden', !isVisible);
}

/**
 * Очищает результаты поиска по ISBN.
 */
function clearSearchResults(): void {
  if (APP_STATE.elements.isbnSearchResults) {
    APP_STATE.elements.isbnSearchResults.innerHTML = '';
  }
}

/**
 * Выполняет запрос к API Google Books для получения данных о книге по ISBN.
 * @param {string} query - Строка запроса (ISBN).
 * @returns {Promise<GoogleBookItem[]>} Промис с массивом найденных книг.
 */
async function fetchBookData(query: string): Promise<GoogleBookItem[]> {
  const { data: { items } } = await axios.get<{
    items: GoogleBookItem[]
  }>(`${APP_CONFIG.url}${query}&key=${APP_CONFIG.apiKey}`);
  return items;
}

/**
 * Обрабатывает отправку формы поиска по ISBN.
 * Выполняет запрос к API, обрабатывает результаты и отображает их.
 * @param {Event} event - Событие отправки формы.
 */
async function handleIsbnSearchFormSubmit(event: Event): Promise<void> {
  event.preventDefault();
  const target = event.target as HTMLFormElement;
  const query = (target.elements.namedItem('query') as HTMLInputElement).value.trim();

  if (!APP_UTILS.isValidIsbn(query)) {
    APP_UTILS.showToast('Please enter valid ISBN');
    return;
  }

  try {
    toggleSearchSpinner(true);
    clearSearchResults();
    const items = await fetchBookData(query);
    if (items.length === 0) {
      APP_UTILS.showToast('No results found');
      return;
    }
    APP_STATE.booksISBN = items;
    renderBookIsbn(APP_STATE.booksISBN);
  } catch (error) {
    APP_UTILS.handleError('An error occurred while fetching data', error as Error);
    clearSearchResults();
  } finally {
    toggleSearchSpinner(false);
    target.reset();
  }
}

/**
 * Обрабатывает клик по кнопке удаления книги в списке.
 * Удаляет книгу из списка и localStorage, обновляет UI.
 * @param {MouseEvent} event - Событие клика.
 */
function handleBookListClick(event: MouseEvent): void {
  const target = event.target as HTMLElement;
  if (!(target.matches('[data-id]') && confirm('Are you sure you want to delete it?'))) return;

  const bookId = target.dataset.id as string;
  const booksIsbn = APP_STATE.elements.isbnSearchResults?.querySelectorAll('[data-isbn-id]');
  target.parentElement?.parentElement?.remove();

  booksIsbn?.forEach(isbn => {
    if ((isbn as HTMLElement).dataset.isbnId === bookId) {
      isbn.parentElement?.classList.remove('added', 'opacity-25', 'pointer-events-none', 'cursor-allowed');
    }
  });

  APP_UTILS.deleteFromLocalStorage(bookId, APP_STATE.books, 'books');
  APP_UTILS.showToast('Book success removed');
}

/**
 * Обрабатывает клик по результатам поиска ISBN для добавления книги.
 * Добавляет выбранную книгу в список и обновляет UI.
 * @param {MouseEvent} event - Событие клика.
 */
function handleIsbnSearchResultsClick(event: MouseEvent): void {
  const target = event.target as HTMLElement;
  if (!target.matches('[data-isbn-id]')) return;

  const isbnId = target.dataset.isbnId as string;
  const selectedBook = APP_STATE.booksISBN.find(({ id }) => id === isbnId);

  if (!selectedBook) return;

  target.closest('li')?.classList.add('added', 'opacity-25', 'pointer-events-none', 'cursor-allowed');

  const { volumeInfo: { title, authors, industryIdentifiers } } = selectedBook;
  const bookInfo: Book = {
    title,
    author: authors && authors[0] || 'No info',
    isbn: industryIdentifiers[0].identifier,
    id: isbnId,
  };

  APP_STATE.books = [bookInfo, ...APP_STATE.books];
  APP_UTILS.setLocalStorageData(APP_STATE.books, 'books');
  renderBookList(APP_STATE.books);
}

/**
 * Проверяет валидность полей формы.
 * @param {Record<string, string>} fields - Объект с полями для проверки.
 * @returns {boolean} Результат валидации.
 */
function validateFields(fields: Record<string, string>): boolean {
  for (const [key, value] of Object.entries(fields)) {
    if (value.trim().length === 0) {
      APP_UTILS.showToast(`Please fill the field "${key}"`);
      return false;
    }
  }
  return true;
}

// Инициализация приложения
initApp();
