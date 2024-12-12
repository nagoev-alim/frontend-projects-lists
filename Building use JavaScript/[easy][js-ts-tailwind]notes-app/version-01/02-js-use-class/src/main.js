import './style.css';
import { icons } from 'feather-icons';
import { marked } from 'marked';

/**
 * Класс Notes представляет приложение для создания и управления заметками.
 * Он позволяет пользователям добавлять, редактировать и удалять заметки,
 * а также сохранять их в локальном хранилище браузера.
 */
class Notes {
  /**
   * Создает экземпляр класса Notes и инициализирует приложение.
   */
  constructor() {
    this.config = {
      root: '#app',
      selectors: {
        add: '[data-note-add]',
        list: '[data-note-list]',
      },
    };

    this.state = {
      elements: {
        add: null,
        list: null,
      },
    };

    this.utils = {
      renderDataAttributes: (element) => element.slice(1, -1),
    };

    this.init();
  }

  /**
   * Создает HTML-разметку для приложения.
   */
  createAppHTML() {
    const { root, selectors: { add, list } } = this.config;
    const { renderDataAttributes } = this.utils;
    const rootElement = document.querySelector(root);

    if (!rootElement) return;

    rootElement.innerHTML = `
    <div class='grid gap-4'>
      <div class='flex gap-2 justify-between'>
        <h1 class='text-2xl font-bold md:text-4xl'>Notes</h1>
        <button class='border bg-white p-2 hover:bg-slate-50' ${renderDataAttributes(add)}>
          ${icons.plus.toSvg()}
        </button>
      </div>
      <div class='grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' ${renderDataAttributes(list)}></div>
    </div>
  `;
  }

  /**
   * Инициализирует DOM-элементы.
   */
  initDOMElements() {
    this.state.elements = {
      add: document.querySelector(this.config.selectors.add),
      list: document.querySelector(this.config.selectors.list),
    };
  }

  /**
   * Инициализирует приложение.
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();
    this.displayLocalStorage();
    this.state.elements.add.addEventListener('click', () => this.createNoteUI());
  }

  /**
   * Отображает заметки из локального хранилища.
   */
  displayLocalStorage() {
    const notes = this.getLocalStorageData();
    notes.forEach(note => this.createNoteUI(note));
  }

  /**
   * Получает данные из локального хранилища.
   * @returns {Array} Массив заметок.
   */
  getLocalStorageData() {
    return JSON.parse(localStorage.getItem('notes')) || [];
  }

  /**
   * Создает UI для новой заметки.
   * @param {string} note - Текст заметки.
   */
  createNoteUI(note = '') {
    const noteElement = this.createNoteElement(note);
    const { btnEdit, btnDelete, content, textarea } = this.getNoteElements(noteElement);

    this.initializeNoteContent(note, content, textarea);
    this.attachEventListeners(noteElement, btnEdit, btnDelete, content, textarea);
    this.state.elements.list.appendChild(noteElement);
  }

  /**
   * Создает DOM-элемент для заметки.
   * @param {string} note - Текст заметки.
   * @returns {HTMLElement} DOM-элемент заметки.
   */
  createNoteElement(note) {
    const noteElement = document.createElement('div');
    noteElement.classList.add('border', 'bg-white', 'rounded');
    noteElement.innerHTML = this.generateNoteHTML(note);
    return noteElement;
  }

  /**
   * Генерирует HTML для заметки.
   * @param {string} note - Текст заметки.
   * @returns {string} HTML-разметка заметки.
   */
  generateNoteHTML(note) {
    return `
    <div class='flex border-b bg-neutral-100 gap-2 justify-end p-1'>
      <button class='border bg-white hover:bg-slate-50 p-1.5' data-note-edit>${icons.edit.toSvg()}</button>
      <button class='border bg-white hover:bg-slate-50 p-1.5' data-note-delete>${icons.trash.toSvg()}</button>
    </div>
    <div class='markdown-body min-h-[150px] ${note ? '' : 'hidden'}'></div>
    <textarea class='bg-slate-50 border focus:border-blue-400 focus:outline-none min-h-[150px] px-3 py-2 resize-none rounded w-full ${note ? 'hidden' : ''}'></textarea>`;
  }

  /**
   * Получает элементы заметки.
   * @param {HTMLElement} noteElement - DOM-элемент заметки.
   * @returns {Object} Объект с элементами заметки.
   */
  getNoteElements(noteElement) {
    return {
      btnEdit: noteElement.querySelector('[data-note-edit]'),
      btnDelete: noteElement.querySelector('[data-note-delete]'),
      content: noteElement.querySelector('.markdown-body'),
      textarea: noteElement.querySelector('textarea'),
    };
  }

  /**
   * Инициализирует содержимое заметки.
   * @param {string} note - Текст заметки.
   * @param {HTMLElement} content - Элемент для отображения содержимого.
   * @param {HTMLTextAreaElement} textarea - Текстовое поле для редактирования.
   */
  initializeNoteContent(note, content, textarea) {
    textarea.value = note;
    content.innerHTML = marked(note);
    textarea.focus();
  }

  /**
   * Прикрепляет обработчики событий к элементам заметки.
   * @param {HTMLElement} noteElement - DOM-элемент заметки.
   * @param {HTMLElement} btnEdit - Кнопка редактирования.
   * @param {HTMLElement} btnDelete - Кнопка удаления.
   * @param {HTMLElement} content - Элемент для отображения содержимого.
   * @param {HTMLTextAreaElement} textarea - Текстовое поле для редактирования.
   */
  attachEventListeners(noteElement, btnEdit, btnDelete, content, textarea) {
    btnDelete.addEventListener('click', () => this.handleDelete(noteElement));
    btnEdit.addEventListener('click', () => this.handleEdit(content, textarea));
    textarea.addEventListener('input', ({ target: { value } }) => this.handleInput(value, content));
  }

  /**
   * Обрабатывает удаление заметки.
   * @param {HTMLElement} noteElement - DOM-элемент заметки.
   */
  handleDelete(noteElement) {
    if (!confirm('Вы уверены?')) return;
    noteElement.remove();
    this.setLocalStorageData();
  }

  /**
   * Обрабатывает редактирование заметки.
   * @param {HTMLElement} content - Элемент для отображения содержимого.
   * @param {HTMLTextAreaElement} textarea - Текстовое поле для редактирования.
   */
  handleEdit(content, textarea) {
    content.classList.toggle('hidden');
    textarea.classList.toggle('hidden');
  }

  /**
   * Обрабатывает ввод текста в заметку.
   * @param {string} value - Введенный текст.
   * @param {HTMLElement} content - Элемент для отображения содержимого.
   */
  handleInput(value, content) {
    this.setLocalStorageData();
    content.innerHTML = marked(value);
  }

  /**
   * Сохраняет данные в локальное хранилище.
   */
  setLocalStorageData() {
    const notes = Array.from(document.querySelectorAll('textarea')).map(textarea => textarea.value);
    localStorage.setItem('notes', JSON.stringify(notes));
  }
}

new Notes();
