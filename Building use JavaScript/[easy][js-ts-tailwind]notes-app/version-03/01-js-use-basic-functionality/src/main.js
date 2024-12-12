import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import { icons } from 'feather-icons';
import { v4 as uuidv4 } from 'uuid';

/**
 * @fileoverview
 * Этот файл содержит реализацию приложения для создания и управления заметками.
 * Приложение позволяет пользователям создавать, редактировать и удалять заметки,
 * которые сохраняются в локальном хранилище браузера.
 */

/**
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента приложения
 * @property {Object} selectors - Объект с селекторами для различных элементов приложения
 */

/**
 * @type {AppConfig}
 */
const APP_CONFIG = {
  root: '#app',
  selectors: {
    notesContainer: '[data-notes-container]',
    createNoteButton: '[data-create-note]',
  },
};

/**
 * @typedef {Object} AppState
 * @property {Object} elements - Объект для хранения DOM элементов
 * @property {Array} notes - Массив для хранения заметок
 */

/**
 * @type {AppState}
 */
const APP_STATE = {
  elements: {},
  notes: [],
};

/**
 * @typedef {Object} AppUtils
 * @property {Function} renderDataAttributes - Функция для обработки data-атрибутов
 * @property {Object} toastConfig - Конфигурация для уведомлений
 * @property {Function} showToast - Функция для отображения уведомлений
 */

/**
 * @type {AppUtils}
 */
const APP_UTILS = {
  renderDataAttributes: (element) => element.slice(1, -1),
  toastConfig: {
    className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
    duration: 3000,
    gravity: 'bottom',
    position: 'center',
  },
  showToast: (message) => {
    Toastify({
      text: message,
      ...APP_UTILS.toastConfig,
    }).showToast();
  },
};

/**
 * Создает HTML структуру приложения
 */
function createAppHTML() {
  const { root, selectors: { notesContainer, createNoteButton } } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='grid gap-4'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>Notes</h1>
      <div class='grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4' ${renderDataAttributes(notesContainer)}>
        <div class='grid place-items-center min-h-[170px] rounded-md border-2 bg-white'>
          <div class='grid place-items-center gap-2'>
            <button class='rounded-full border-2 border-dashed border-black p-5' ${renderDataAttributes(createNoteButton)}>${icons.plus.toSvg()}</button>
            <p class='font-medium'>Add new note</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Инициализирует DOM элементы приложения
 */
function initDOMElements() {
  APP_STATE.elements = {
    notesContainer: document.querySelector(APP_CONFIG.selectors.notesContainer),
    createNoteButton: document.querySelector(APP_CONFIG.selectors.createNoteButton),
  };
}

/**
 * Инициализирует приложение
 */
function initApp() {
  createAppHTML();
  initDOMElements();
  APP_STATE.notes = JSON.parse(localStorage.getItem('notes')) || [];
  renderNoteUI(APP_STATE.notes);
  APP_STATE.elements.createNoteButton.addEventListener('click', handleCreateNoteClick);
}

/**
 * Отображает заметки в пользовательском интерфейсе
 * @param {Array} notes - Массив заметок для отображения
 */
function renderNoteUI(notes) {
  const addedNotes = document.querySelectorAll('.item:not(.item--add)');
  addedNotes.forEach((note) => note.remove());

  notes.forEach(({ text, id }) => {
    const note = document.createElement('div');
    note.classList.add('item');
    note.innerHTML = `<textarea class='h-full w-full min-h-[170px] resize-none rounded-md border-2 p-2' data-id='${id}' placeholder='Empty Sticky Note'>${text}</textarea>`;

    const textarea = note.querySelector('textarea');
    textarea.addEventListener('dblclick', handleTextareaDelete);
    textarea.addEventListener('change', handleTextareaChange);

    APP_STATE.elements.notesContainer.insertBefore(
      note,
      APP_STATE.elements.notesContainer.querySelector('.item--add'),
    );
  });
}

/**
 * Обрабатывает удаление заметки
 * @param {Event} event - Событие двойного клика
 */
function handleTextareaDelete(event) {
  const target = event.target;
  if (!confirm('Are you sure you want to delete the note?')) return;

  const noteElement = target.closest('.item');
  const noteId = noteElement.querySelector('textarea')?.dataset.id;

  if (!noteId) {
    console.warn('Note ID is missing');
    return;
  }

  APP_STATE.notes = APP_STATE.notes.filter(({ id }) => id !== noteId);
  updateUIAndStorage();
  noteElement.remove();
  APP_UTILS.showToast('Note deleted');
}

/**
 * Обрабатывает изменение содержимого заметки
 * @param {Event} event - Событие изменения
 */
function handleTextareaChange(event) {
  const target = event.target;
  const noteId = target.closest('.item').querySelector('textarea')?.dataset.id;
  if (!noteId) {
    console.warn('Note ID is missing');
    return;
  }

  APP_STATE.notes = APP_STATE.notes.map((note) =>
    note.id === noteId ? { ...note, text: target.value } : note,
  );
  updateUIAndStorage();
}

/**
 * Обновляет пользовательский интерфейс и сохраняет данные в локальном хранилище
 */
function updateUIAndStorage() {
  renderNoteUI(APP_STATE.notes);
  localStorage.setItem('notes', JSON.stringify(APP_STATE.notes));
}

/**
 * Обрабатывает создание новой заметки
 */
function handleCreateNoteClick() {
  APP_STATE.notes = [...APP_STATE.notes, { text: '', id: uuidv4() }];
  updateUIAndStorage();
  APP_UTILS.showToast('New note created');
}

// Инициализация приложения
initApp();
