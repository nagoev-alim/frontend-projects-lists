/**
 * Этот файл содержит класс BookList, который реализует функциональность списка книг.
 * Класс позволяет добавлять книги вручную или через поиск по ISBN,
 * отображать список книг, удалять книги и сохранять данные в локальном хранилище.
 */

import './style.css';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

class BookList {
  /**
   * Создает экземпляр класса BookList.
   * Инициализирует конфигурацию, состояние и вспомогательные методы.
   */
  constructor() {
    this.config = {
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

    this.state = {
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

    this.utils = {
      /**
       * Преобразует первую букву строки в заглавную.
       * @param {string} str - Исходная строка.
       * @returns {string} Строка с заглавной первой буквой.
       */
      capitalizeFirstLetter: str => str.charAt(0).toUpperCase() + str.slice(1),

      /**
       * Удаляет квадратные скобки из строки с атрибутами данных.
       * @param {string} element - Строка с атрибутами данных.
       * @returns {string} Строка без квадратных скобок.
       */
      renderDataAttributes: (element) => element.slice(1, -1),

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
      showToast: (message) => {
        Toastify({
          text: message,
          ...this.utils.toastConfig,
        }).showToast();
      },

      /**
       * Обрабатывает ошибки и отображает уведомление.
       * @param {string} message - Сообщение об ошибке.
       * @param {Error} [error] - Объект ошибки (необязательный).
       */
      handleError: (message, error = null) => {
        this.utils.showToast(message);
        if (error) console.error(message, error);
      },

      /**
       * Получает данные из локального хранилища.
       * @returns {Array} Массив книг из локального хранилища или пустой массив.
       */
      getLocalStorageData: () => JSON.parse(localStorage.getItem('books')) || [],

      /**
       * Сохраняет данные в локальное хранилище.
       * @param {Array} items - Массив элементов для сохранения.
       * @param {string} name - Ключ для сохранения в локальном хранилище.
       */
      setLocalStorageData: (items, name) => {
        localStorage.setItem(name, JSON.stringify(items));
      },

      /**
       * Удаляет элемент из локального хранилища по ID.
       * @param {string} id - ID элемента для удаления.
       * @param {Array} target - Целевой массив.
       * @param {string} name - Ключ в локальном хранилище.
       */
      deleteFromLocalStorage: (id, target, name) => {
        const updatedData = target.filter(item => item.id !== id);
        this.utils.setLocalStorageData(updatedData, name);
      },

      /**
       * Возвращает массив уникальных элементов на основе ISBN.
       * @param {Array} array - Исходный массив.
       * @returns {Array} Массив уникальных элементов.
       */
      getUniqueArray: array => array.filter((item, index, self) =>
        index === self.findIndex((t) => t.isbn === item.isbn),
      ),

      /**
       * Фильтрует и преобразует массив полей.
       * @param {Array} fields - Массив полей.
       * @returns {Array} Отфильтрованный и преобразованный массив полей.
       */
      getFields: fields => fields
        .filter(field => field !== '')
        .map(field => field.toLowerCase()),

      /**
       * Проверяет, является ли строка допустимым ISBN.
       * @param {string} query - Строка для проверки.
       * @returns {boolean} true, если строка является допустимым ISBN, иначе false.
       */
      isValidIsbn: query => /^[0-9-]+$/.test(query),
    };

    this.init();
  }

  /**
   * Создает HTML-разметку приложения.
   */
  createAppHTML() {
    const {
      root,
      selectors: {
        isbnSearchForm,
        isbnSearchSpinner,
        isbnSearchResults,
        manualBookForm,
        bookList,
      },
    } = this.config;
    const { renderDataAttributes, getFields, capitalizeFirstLetter } = this.utils;
    const rootElement = document.querySelector(root);

    if (!rootElement) return;

    const fieldsHTML = getFields(this.config.fields);
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
          ${getFields(this.config.fields).map(i => `<li class='border bg-white p-2 font-medium'>${capitalizeFirstLetter(i)}</li>`).join('')}
        </ul>
        <ul ${renderDataAttributes(bookList)}></ul>
      </div>
    </div>
  `;
  }

  /**
   * Инициализирует DOM-элементы.
   */
  initDOMElements() {
    this.state.elements = {
      isbnSearchForm: document.querySelector(this.config.selectors.isbnSearchForm),
      isbnSearchSpinner: document.querySelector(this.config.selectors.isbnSearchSpinner),
      isbnSearchResults: document.querySelector(this.config.selectors.isbnSearchResults),
      manualBookForm: document.querySelector(this.config.selectors.manualBookForm),
      bookList: document.querySelector(this.config.selectors.bookList),
    };
  }

  /**
   * Инициализирует приложение.
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();
    this.state.books = this.utils.getLocalStorageData();
    this.renderBookList(this.state.books);
    this.state.elements.manualBookForm.addEventListener('submit', this.handleManualBookFormSubmit.bind(this));
    this.state.elements.isbnSearchForm.addEventListener('submit', this.handleIsbnSearchFormSubmit.bind(this));
    this.state.elements.bookList.addEventListener('click', this.handleBookListClick.bind(this));
    this.state.elements.isbnSearchResults.addEventListener('click', this.handleIsbnSearchResultsClick.bind(this));
  }

  /**
   * Отображает список книг.
   * @param {Array} items - Массив книг для отображения.
   */
  renderBookList(items) {
    this.state.elements.bookList.innerHTML = items.map((item) => `
    <li class='grid grid-cols-[1.5fr_1.5fr_1.5fr_.5fr]'>
      ${['title', 'author', 'isbn'].map(prop => `
        <div class='bg-white border p-2'><p>${item[prop]}</p></div>
      `).join('')}
      <div class='bg-white border p-2'><button data-id='${item.id}'>&times;</button></div>
    </li>
  `).join('');
  }

  /**
   * Отображает результаты поиска книг по ISBN.
   * @param {Array} items - Массив найденных книг.
   */
  renderBookIsbn(items) {
    this.state.elements.isbnSearchResults.innerHTML = items.map(({ volumeInfo, id }) => {
      const { title, previewLink, authors, imageLinks } = volumeInfo;
      const isBookAdded = this.state.books.some(book => book.id === id);
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

  /**
   * Обрабатывает отправку формы для добавления книги вручную.
   * @param {Event} event - Событие отправки формы.
   */
  handleManualBookFormSubmit(event) {
    event.preventDefault();
    const { title, author, isbn } = Object.fromEntries(new FormData(event.target));

    if (!this.validateFields({ title, author, isbn })) {
      return;
    }

    const newEntry = { title, author, isbn, id: uuidv4() };
    this.state.books = this.utils.getUniqueArray([newEntry, ...this.state.books]);

    this.utils.setLocalStorageData(this.state.books, 'books');
    this.renderBookList(this.state.books);
    event.target.reset();
  }

  /**
   * Переключает видимость индикатора загрузки при поиске.
   * @param {boolean} isVisible - Флаг видимости индикатора.
   */
  toggleSearchSpinner(isVisible) {
    this.state.elements.isbnSearchSpinner.classList.toggle('hidden', !isVisible);
  }

  /**
   * Очищает результаты поиска.
   */
  clearSearchResults() {
    this.state.elements.isbnSearchResults.innerHTML = '';
  }

  /**
   * Выполняет запрос к API для получения данных о книге.
   * @param {string} query - Строка запроса (ISBN).
   * @returns {Promise<Array>} Промис с массивом найденных книг.
   */
  async fetchBookData(query) {
    const { data: { items } } = await axios.get(`${this.config.url}${query}&key=${this.config.apiKey}`);
    return items;
  }

  /**
   * Обрабатывает отправку формы поиска по ISBN.
   * @param {Event} event - Событие отправки формы.
   */
  async handleIsbnSearchFormSubmit(event) {
    event.preventDefault();
    const query = event.target.elements.query.value.trim();

    if (!this.utils.isValidIsbn(query)) {
      this.utils.showToast('Please enter valid ISBN');
      return;
    }

    try {
      this.toggleSearchSpinner(true);
      this.clearSearchResults();
      const items = await this.fetchBookData(query);
      if (items.length === 0) {
        this.utils.showToast('No results found');
        return;
      }
      this.state.booksISBN = items;
      this.renderBookIsbn(this.state.booksISBN);
    } catch (error) {
      this.utils.handleError('An error occurred while fetching data', error);
      this.clearSearchResults();
    } finally {
      this.toggleSearchSpinner(false);
      event.target.reset();
    }
  }

  /**
   * Обрабатывает клик по кнопке удаления книги.
   * @param {Event} event - Событие клика.
   */
  handleBookListClick({ target }) {
    if (!(target.matches('[data-id]') && confirm('Are you sure you want to delete it?'))) return;

    const bookId = target.dataset.id;
    const booksIsbn = this.state.elements.isbnSearchResults.querySelectorAll('[data-isbn-id]');
    target.parentElement.parentElement.remove();

    booksIsbn.forEach(isbn => {
      if (isbn.dataset.isbnId === bookId) {
        isbn.parentElement.classList.remove('added', 'opacity-25', 'pointer-events-none', 'cursor-allowed');
      }
    });

    this.utils.deleteFromLocalStorage(bookId, this.state.books, 'books');
    this.utils.showToast('Book success removed');
  }

  /**
   * Обрабатывает клик по кнопке добавления книги из результатов поиска.
   * @param {Event} event - Событие клика.
   */
  handleIsbnSearchResultsClick({ target }) {
    if (!target.matches('[data-isbn-id]')) return;

    const isbnId = target.dataset.isbnId;
    const selectedBook = this.state.booksISBN.find(({ id }) => id === isbnId);

    if (!selectedBook) return;

    target.closest('li').classList.add('added', 'opacity-25', 'pointer-events-none', 'cursor-allowed');

    const { volumeInfo: { title, authors, industryIdentifiers } } = selectedBook;
    const bookInfo = {
      title,
      author: authors && authors[0] || 'No info',
      isbn: industryIdentifiers[0].identifier,
      id: isbnId,
    };

    this.state.books = [bookInfo, ...this.state.books];
    this.utils.setLocalStorageData(this.state.books, 'books');
    this.renderBookList(this.state.books);
  }

  /**
   * Проверяет корректность заполнения полей формы.
   * @param {Object} fields - Объект с полями формы для проверки.
   * @returns {boolean} Возвращает true, если все поля заполнены корректно, иначе false.
   */
  validateFields(fields) {
    for (const [key, value] of Object.entries(fields)) {
      if (value.trim().length === 0) {
        this.utils.showToast(`Please fill the field "${key}"`);
        return false;
      }
    }
    return true;
  }
}

/**
 * Создает новый экземпляр класса BookList.
 * Инициализирует приложение для управления списком книг.
 */
new BookList();
