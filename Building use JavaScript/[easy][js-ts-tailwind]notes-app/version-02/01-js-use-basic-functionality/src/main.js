/**
 * @fileoverview Приложение для управления заметками с возможностью создания, редактирования и удаления.
 * Использует локальное хранилище для сохранения данных и Toastify для уведомлений.
 */
import './style.css';
import { icons } from 'feather-icons';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import { v4 as uuidv4 } from 'uuid';

/**
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента приложения.
 * @property {Object} selectors - Объект с селекторами для различных элементов интерфейса.
 */

/**
 * Конфигурация приложения.
 * @type {AppConfig}
 */
const APP_CONFIG = {
  root: '#app',
  selectors: {
    notesList: '[data-notes-list]',
    addNoteBtn: '[data-add-note]',
    modal: '[data-modal]',
    modalTitle: '[data-modal-title]',
    modalCloseBtn: '[data-modal-close]',
    noteForm: '[data-note-form]',
  },
};

/**
 * @typedef {Object} AppState
 * @property {Object} elements - Объект для хранения DOM элементов.
 * @property {Array} notesCollection - Массив для хранения заметок.
 * @property {boolean} isEditMode - Флаг режима редактирования.
 * @property {Object|null} currentEditNote - Текущая редактируемая заметка.
 */

/**
 * Состояние приложения.
 * @type {AppState}
 */
const APP_STATE = {
  elements: {},
  notesCollection: [],
  isEditMode: false,
  currentEditNote: null,
};

/**
 * @typedef {Object} AppUtils
 * @property {Function} renderDataAttributes - Функция для обработки data-атрибутов.
 * @property {Object} toastConfig - Конфигурация для уведомлений Toastify.
 * @property {Function} showToast - Функция для отображения уведомлений.
 */

/**
 * Утилиты приложения.
 * @type {AppUtils}
 */
const APP_UTILS = {
  /**
   * Обрабатывает строку data-атрибута, удаляя квадратные скобки.
   * @param {string} element - Строка data-атрибута.
   * @returns {string} Обработанная строка.
   */
  renderDataAttributes: (element) => element.slice(1, -1),

  /**
   * Конфигурация для уведомлений Toastify.
   */
  toastConfig: {
    className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
    duration: 3000,
    gravity: 'bottom',
    position: 'center',
  },

  /**
   * Отображает уведомление с заданным сообщением.
   * @param {string} message - Текст уведомления.
   */
  showToast: (message) => {
    Toastify({
      text: message,
      ...APP_UTILS.toastConfig,
    }).showToast();
  },
};
/**
 * Создает HTML структуру слайдера.
 */
function createAppHTML() {
  const {
    root,
    selectors: {
      notesList,
      addNoteBtn,
      modal,
      modalTitle,
      modalCloseBtn,
      noteForm,
    },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='grid gap-4 notes'>
      <h1 class='font-bold text-2xl md:text-4xl'>Notes</h1>
      <div class='grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' ${renderDataAttributes(notesList)}>
        <div class='bg-white border-2 grid gap-3 item item--add min-h-[175px] p-2 place-content-center rounded-md'>
          <button class='flex items-center justify-center mx-auto h-[68px] w-[68px] rounded-full border-2 border-dashed border-black' ${renderDataAttributes(addNoteBtn)}>
            <span class="pointer-events-none">
              ${icons.plus.toSvg()}
            </span>
          </button>
          <p class='font-medium'>Add new note</p>
        </div>
      </div>
      <div class='fixed left-0 top-0 z-[99] grid h-full w-full place-items-center bg-neutral-900/40 p-3 hidden' ${renderDataAttributes(modal)}>
        <div class='w-full max-w-md rounded-md border-2 bg-white p-3'>
          <div class='mb-3 flex justify-between gap-3'>
            <h2 class='text-lg font-medium' ${renderDataAttributes(modalTitle)}>Add new note</h2>
            <button ${renderDataAttributes(modalCloseBtn)}>
              <span class="pointer-events-none">${icons.x.toSvg()}</span>
            </button>
          </div>
          <form class='grid gap-3' ${renderDataAttributes(noteForm)}>
            <label class='grid gap-1.5'>
              <span class='cursor-pointer text-sm font-medium'>Title</span>
              <input class='w-full rounded border bg-slate-50 px-3 py-2 focus:border-blue-400 focus:outline-none' type='text' name='title'>
            </label>
            <label class='grid gap-1.5'>
              <span class='cursor-pointer text-sm font-medium'>Description</span>
              <textarea class='min-h-[150px] w-full resize-none rounded border bg-slate-50 px-3 py-2 focus:border-blue-400 focus:outline-none' name='description'></textarea>
            </label>
            <button class='border px-3 py-2 hover:bg-slate-50' type='submit'>Add Note</button>
          </form>
        </div>
      </div>
    </div>
  `;
}

/**
 * Инициализирует DOM элементы и сохраняет их в состоянии.
 */
function initDOMElements() {
  APP_STATE.elements = {
    notesList: document.querySelector(APP_CONFIG.selectors.notesList),
    addNoteBtn: document.querySelector(APP_CONFIG.selectors.addNoteBtn),
    modal: document.querySelector(APP_CONFIG.selectors.modal),
    modalTitle: document.querySelector(APP_CONFIG.selectors.modalTitle),
    modalCloseBtn: document.querySelector(APP_CONFIG.selectors.modalCloseBtn),
    noteForm: document.querySelector(APP_CONFIG.selectors.noteForm),
  };
}

/**
 * Инициализирует приложение
 */
function initApp() {
  createAppHTML();
  initDOMElements();

  displayLocalStorageData();
  APP_STATE.elements.addNoteBtn.addEventListener('click', handleCallNoteModal);
  APP_STATE.elements.modal.addEventListener('click', handleCallNoteModal);
  document.addEventListener('keydown', handleCallNoteModal);
  APP_STATE.elements.noteForm.addEventListener('submit', handleNoteFormSubmit);
  APP_STATE.elements.notesList.addEventListener('click', handleNotesListClick);
}
/**
 * Получает данные заметок из локального хранилища.
 * @returns {Array} Массив заметок или пустой массив, если данных нет.
 */
function getLocalStorageData() {
  return JSON.parse(localStorage.getItem('notes')) || [];
}

/**
 * Отображает заметки на странице.
 * @param {Array} notes - Массив заметок для отображения.
 */
function renderNotes(notes = []) {
  document
    .querySelectorAll('.item:not(.item--add)')
    .forEach((note) => note.remove());
  for (const { title, description, date, id } of notes) {
    const html = `
      <div class='item grid min-h-[175px] max-h-[300px] gap-1 grid-rows-[auto_1fr_auto] rounded-md border-2 bg-white p-2'>
        <h4 class='text-lg font-bold'>${title}</h4>
        <p class='overflow-auto'>${description}</p>
        <div class='flex items-center justify-between border-t pt-2'>
          <p class='text-sm font-bold'>${date}</p>
          <div class='relative flex items-center justify-center'>
            <button data-note-options>${icons['more-horizontal'].toSvg()}</button>
            <div class='absolute bottom-8 right-0 z-10 hidden w-[100px] grid gap-2 rounded border bg-white p-1'>
              <button class='flex gap-2 justify-start' data-note-edit='${id}'>${icons.edit.toSvg()}Edit</button>
              <button class='flex gap-2 justify-start' data-note-delete='${id}'>${icons.trash.toSvg()}Delete</button>
            </div>
          </div>
        </div>
      </div>`;

    APP_STATE.elements.notesList
      .querySelector('.item--add')
      .insertAdjacentHTML('afterend', html);
  }
}

/**
 * Отображает данные из локального хранилища на странице.
 */
function displayLocalStorageData() {
  APP_STATE.notesCollection = getLocalStorageData();
  renderNotes(APP_STATE.notesCollection);
}

/**
 * Обрабатывает вызов модального окна для создания/редактирования заметки.
 * @param {Event} event - Событие, вызвавшее функцию.
 */
function handleCallNoteModal({ target, key }) {
  const toggleModal = (action) =>
    APP_STATE.elements.modal.classList.toggle('hidden', action === 'close');

  if (target.matches(APP_CONFIG.selectors.addNoteBtn)) {
    toggleModal('open');
  }
  if (
    key === 'Escape' ||
    target.matches(APP_CONFIG.selectors.modalCloseBtn) ||
    target === APP_STATE.elements.modal
  ) {
    toggleModal('close');
  }
}

/**
 * Добавляет новую заметку в коллекцию.
 * @param {string} title - Заголовок заметки.
 * @param {string} description - Описание заметки.
 */
function addNewNote(title, description) {
  const newNote = {
    title,
    description,
    date: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: '2-digit',
    }),
    id: uuidv4(),
  };
  APP_STATE.notesCollection = [...APP_STATE.notesCollection, newNote];
  APP_UTILS.showToast('The note has been successfully created');
}

/**
 * Редактирует существующую заметку.
 * @param {string} title - Новый заголовок заметки.
 * @param {string} description - Новое описание заметки.
 */
function editExistingNote(title, description) {
  APP_STATE.notesCollection = APP_STATE.notesCollection.map((note) =>
    note.id === APP_STATE.currentEditNote?.id
      ? {
        title,
        description,
        id: APP_STATE.currentEditNote.id,
        date: APP_STATE.currentEditNote.date,
      }
      : note,
  );

  APP_STATE.elements.noteForm.querySelector('button').textContent = 'Add new note';
  APP_STATE.elements.modalTitle.textContent = 'Add note';

  APP_STATE.isEditMode = false;
  APP_STATE.currentEditNote = null;

  APP_UTILS.showToast('The note has been successfully updated');
}

/**
 * Сохраняет данные в локальное хранилище.
 * @param {Array} items - Массив заметок для сохранения.
 */
function setLocalStorageData(items) {
  return localStorage.setItem('notes', JSON.stringify(items));
}

/**
 * Обрабатывает отправку формы создания/редактирования заметки.
 * @param {Event} event - Событие отправки формы.
 */
function handleNoteFormSubmit(event) {
  event.preventDefault();
  const { title, description } = Object.fromEntries(new FormData(event.target));
  const isEmptyString = (string) => string.trim() === '';

  if (isEmptyString(title) || isEmptyString(description)) {
    APP_UTILS.showToast('Please fill in all required fields');
    return;
  }

  !APP_STATE.isEditMode
    ? addNewNote(title, description)
    : editExistingNote(title, description);

  renderNotes(APP_STATE.notesCollection);
  setLocalStorageData(APP_STATE.notesCollection);
  event.target.reset();
  APP_STATE.elements.modal.classList.add('hidden');
}

/**
 * Обрабатывает клики по элементам списка заметок.
 * @param {Event} event - Событие клика.
 */
function handleNotesListClick({ target }) {
  const handleOptionsClick = () =>
    target.nextElementSibling.classList.toggle('hidden');

  const handleDeleteClick = () => {
    target.parentElement.classList.toggle('hidden');

    if (!confirm('Are you sure you want to delete this note?')) return;

    APP_STATE.notesCollection = APP_STATE.notesCollection.filter(
      (note) => note.id !== target.dataset.noteDelete,
    );
    renderNotes(APP_STATE.notesCollection);
    setLocalStorageData(APP_STATE.notesCollection);
    APP_UTILS.showToast('The note has been successfully deleted');
  };

  const handleEditClick = () => {
    target.parentElement.classList.toggle('hidden');
    APP_STATE.isEditMode = true;
    APP_STATE.currentEditNote = APP_STATE.notesCollection.find(
      (note) => note.id === target.dataset.noteEdit,
    );

    APP_STATE.elements.modal.classList.remove('hidden');
    APP_STATE.elements.noteForm.elements.title.value = APP_STATE.currentEditNote.title;
    APP_STATE.elements.noteForm.elements.description.value = APP_STATE.currentEditNote.description;
    APP_STATE.elements.noteForm.querySelector('button').textContent = 'Update note';
    APP_STATE.elements.modalTitle.textContent = 'Update note';
  };

  const actions = {
    '[data-note-options]': handleOptionsClick,
    '[data-note-delete]': handleDeleteClick,
    '[data-note-edit]': handleEditClick,
  };

  Object.entries(actions).forEach(([selector, action]) => {
    if (target.matches(selector)) action();
  });
}

initApp();
