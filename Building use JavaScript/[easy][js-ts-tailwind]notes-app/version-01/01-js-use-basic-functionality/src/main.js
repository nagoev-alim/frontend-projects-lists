import './style.css';
import { icons } from 'feather-icons';
import { marked } from 'marked';

/**
 * Приложение для создания и управления заметками.
 * Функциональность включает:
 * - Создание новых заметок
 * - Редактирование существующих заметок
 * - Удаление заметок
 * - Сохранение заметок в локальном хранилище
 * - Отображение заметок в формате Markdown
 */

/**
 * Конфигурация приложения
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента
 * @property {Object} selectors - Селекторы для элементов приложения
 */
const APP_CONFIG = {
  root: '#app',
  selectors: {
    add: '[data-note-add]',
    list: '[data-note-list]',
  },
};

/**
 * Состояние приложения
 * @typedef {Object} AppState
 * @property {Object} elements - DOM элементы приложения
 */
const APP_STATE = {
  elements: {
    add: null,
    list: null,
  },
};

/**
 * Утилиты приложения
 * @typedef {Object} AppUtils
 * @property {Function} renderDataAttributes - Функция для рендеринга data-атрибутов
 */
const APP_UTILS = {
  renderDataAttributes: (element) => element.slice(1, -1),
};

/**
 * Создает HTML структуру приложения
 */
function createAppHTML() {
  const { root, selectors: { add, list } } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
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
 * Инициализирует DOM элементы приложения
 */
function initDOMElements() {
  APP_STATE.elements = {
    add: document.querySelector(APP_CONFIG.selectors.add),
    list: document.querySelector(APP_CONFIG.selectors.list),
  };
}

/**
 * Инициализирует приложение
 */
function initApp() {
  createAppHTML();
  initDOMElements();
  displayLocalStorage();
  APP_STATE.elements.add.addEventListener('click', () => createNoteUI());
}

/**
 * Отображает заметки из локального хранилища
 */
function displayLocalStorage() {
  const notes = getLocalStorageData();
  notes.forEach(createNoteUI);
}

/**
 * Получает данные из локального хранилища
 * @returns {Array} Массив заметок
 */
function getLocalStorageData() {
  return JSON.parse(localStorage.getItem('notes')) || [];
}

/**
 * Создает UI для новой заметки
 * @param {string} note - Текст заметки
 */
function createNoteUI(note = '') {
  const noteElement = createNoteElement(note);
  const { btnEdit, btnDelete, content, textarea } = getNoteElements(noteElement);

  initializeNoteContent(note, content, textarea);
  attachEventListeners(noteElement, btnEdit, btnDelete, content, textarea);
  APP_STATE.elements.list.appendChild(noteElement);
}

/**
 * Создает DOM элемент для заметки
 * @param {string} note - Текст заметки
 * @returns {HTMLElement} DOM элемент заметки
 */
function createNoteElement(note) {
  const noteElement = document.createElement('div');
  noteElement.classList.add('border', 'bg-white', 'rounded');
  noteElement.innerHTML = generateNoteHTML(note);
  return noteElement;
}

/**
 * Генерирует HTML для заметки
 * @param {string} note - Текст заметки
 * @returns {string} HTML строка
 */
function generateNoteHTML(note) {
  return `
    <div class='flex border-b bg-neutral-100 gap-2 justify-end p-1'>
      <button class='border bg-white hover:bg-slate-50 p-1.5' data-note-edit>${icons.edit.toSvg()}</button>
      <button class='border bg-white hover:bg-slate-50 p-1.5' data-note-delete>${icons.trash.toSvg()}</button>
    </div>
    <div class='markdown-body min-h-[150px] ${note ? '' : 'hidden'}'></div>
    <textarea class='bg-slate-50 border focus:border-blue-400 focus:outline-none min-h-[150px] px-3 py-2 resize-none rounded w-full ${note ? 'hidden' : ''}'></textarea>`;
}

/**
 * Получает элементы заметки
 * @param {HTMLElement} noteElement - DOM элемент заметки
 * @returns {Object} Объект с элементами заметки
 */
function getNoteElements(noteElement) {
  return {
    btnEdit: noteElement.querySelector('[data-note-edit]'),
    btnDelete: noteElement.querySelector('[data-note-delete]'),
    content: noteElement.querySelector('.markdown-body'),
    textarea: noteElement.querySelector('textarea'),
  };
}

/**
 * Инициализирует содержимое заметки
 * @param {string} note - Текст заметки
 * @param {HTMLElement} content - Элемент для отображения Markdown
 * @param {HTMLTextAreaElement} textarea - Текстовое поле для редактирования
 */
function initializeNoteContent(note, content, textarea) {
  textarea.value = note;
  content.innerHTML = marked(note);
  textarea.focus();
}

/**
 * Прикрепляет обработчики событий к элементам заметки
 * @param {HTMLElement} noteElement - DOM элемент заметки
 * @param {HTMLButtonElement} btnEdit - Кнопка редактирования
 * @param {HTMLButtonElement} btnDelete - Кнопка удаления
 * @param {HTMLElement} content - Элемент для отображения Markdown
 * @param {HTMLTextAreaElement} textarea - Текстовое поле для редактирования
 */
function attachEventListeners(noteElement, btnEdit, btnDelete, content, textarea) {
  btnDelete.addEventListener('click', () => handleDelete(noteElement));
  btnEdit.addEventListener('click', () => handleEdit(content, textarea));
  textarea.addEventListener('input', ({ target: { value } }) => handleInput(value, content));
}

/**
 * Обрабатывает удаление заметки
 * @param {HTMLElement} noteElement - DOM элемент заметки
 */
function handleDelete(noteElement) {
  if (!confirm('Are you sure?')) return;
  noteElement.remove();
  setLocalStorageData();
}

/**
 * Обрабатывает редактирование заметки
 * @param {HTMLElement} content - Элемент для отображения Markdown
 * @param {HTMLTextAreaElement} textarea - Текстовое поле для редактирования
 */
function handleEdit(content, textarea) {
  content.classList.toggle('hidden');
  textarea.classList.toggle('hidden');
}

/**
 * Обрабатывает ввод текста в заметку
 * @param {string} value - Введенный текст
 * @param {HTMLElement} content - Элемент для отображения Markdown
 */
function handleInput(value, content) {
  setLocalStorageData();
  content.innerHTML = marked(value);
}

/**
 * Сохраняет данные в локальное хранилище
 */
function setLocalStorageData() {
  const notes = Array.from(document.querySelectorAll('textarea')).map(textarea => textarea.value);
  localStorage.setItem('notes', JSON.stringify(notes));
}

// Инициализация приложения
initApp();
