/**
 * @fileoverview Приложение для создания и управления заметками.
 * Этот модуль обеспечивает функциональность для создания, редактирования и удаления заметок,
 * а также их сохранения в локальном хранилище браузера.
 */

import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import { icons } from 'feather-icons';
import { v4 as uuidv4 } from 'uuid';

/**
 * @interface AppConfig
 * @description Конфигурация приложения
 * @property {string} root - Селектор корневого элемента приложения
 * @property {Object} selectors - Объект с селекторами DOM-элементов
 * @property {string} selectors.notesContainer - Селектор контейнера для заметок
 * @property {string} selectors.createNoteButton - Селектор кнопки создания новой заметки
 */
interface AppConfig {
  root: string;
  selectors: {
    notesContainer: string;
    createNoteButton: string;
  };
}

/**
 * @interface Note
 * @description Интерфейс заметки
 * @property {string} id - Уникальный идентификатор заметки
 * @property {string} text - Текст заметки
 */
interface Note {
  id: string;
  text: string;
}

/**
 * @interface AppState
 * @description Состояние приложения
 * @property {Object} elements - Объект с DOM-элементами
 * @property {HTMLDivElement} elements.notesContainer - Контейнер для заметок
 * @property {HTMLButtonElement} elements.createNoteButton - Кнопка создания новой заметки
 * @property {Note[]} notes - Массив заметок
 */
interface AppState {
  elements: {
    notesContainer: HTMLDivElement;
    createNoteButton: HTMLButtonElement;
  };
  notes: Note[];
}

/**
 * @interface AppUtils
 * @description Утилиты приложения
 * @property {Function} renderDataAttributes - Функция для рендеринга data-атрибутов
 * @property {Object} toastConfig - Конфигурация для уведомлений
 * @property {string} toastConfig.className - CSS класс для уведомлений
 * @property {number} [toastConfig.duration] - Длительность отображения уведомления
 * @property {('top'|'bottom')} [toastConfig.gravity] - Позиция уведомления по вертикали
 * @property {('left'|'center'|'right')} [toastConfig.position] - Позиция уведомления по горизонтали
 * @property {Function} showToast - Функция для отображения уведомлений
 */
interface AppUtils {
  renderDataAttributes: (element: string) => string;
  toastConfig: {
    className: string;
    duration?: number;
    gravity?: 'top' | 'bottom';
    position?: 'left' | 'center' | 'right';
  };
  showToast: (message: string) => void;
}

/**
 * @const {AppConfig} APP_CONFIG
 * @description Конфигурация приложения
 */
const APP_CONFIG: AppConfig = {
  root: '#app',
  selectors: {
    notesContainer: '[data-notes-container]',
    createNoteButton: '[data-create-note]',
  },
};

/**
 * @const {AppState} APP_STATE
 * @description Состояние приложения
 */
const APP_STATE: AppState = {
  elements: {
    notesContainer: document.createElement('div'),
    createNoteButton: document.createElement('button'),
  },
  notes: [],
};

/**
 * @const {AppUtils} APP_UTILS
 * @description Утилиты приложения
 */
const APP_UTILS: AppUtils = {
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
 * @function createAppHTML
 * @description Создает HTML-структуру приложения
 * @returns {void}
 */
function createAppHTML(): void {
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
 * @function initDOMElements
 * @description Инициализирует DOM-элементы приложения
 * @returns {void}
 */
function initDOMElements(): void {
  APP_STATE.elements = {
    notesContainer: document.querySelector(APP_CONFIG.selectors.notesContainer) as HTMLDivElement,
    createNoteButton: document.querySelector(APP_CONFIG.selectors.createNoteButton) as HTMLButtonElement,
  };
}

/**
 * @function initApp
 * @description Инициализирует приложение
 * @returns {void}
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();
  const storedNotes = localStorage.getItem('notes');
  APP_STATE.notes = storedNotes ? JSON.parse(storedNotes) : [];
  renderNoteUI(APP_STATE.notes);
  APP_STATE.elements.createNoteButton.addEventListener('click', handleCreateNoteClick);
}

/**
 * @function renderNoteUI
 * @description Отображает заметки в пользовательском интерфейсе
 * @param {Note[]} notes - Массив заметок для отображения
 * @returns {void}
 */
function renderNoteUI(notes: Note[]): void {
  const addedNotes = document.querySelectorAll('.item:not(.item--add)');
  addedNotes.forEach((note) => note.remove());

  notes.forEach(({ text, id }) => {
    const note = document.createElement('div');
    note.classList.add('item');
    note.innerHTML = `<textarea class='h-full w-full min-h-[170px] resize-none rounded-md border-2 p-2' data-id='${id}' placeholder='Empty Sticky Note'>${text}</textarea>`;

    const textarea = note.querySelector('textarea') as HTMLTextAreaElement;
    textarea.addEventListener('dblclick', handleTextareaDelete);
    textarea.addEventListener('change', handleTextareaChange);

    APP_STATE.elements.notesContainer.insertBefore(
      note,
      APP_STATE.elements.notesContainer.querySelector('.item--add'),
    );
  });
}

/**
 * @function handleTextareaDelete
 * @description Обрабатывает удаление заметки
 * @param {Event} event - Событие двойного клика
 * @returns {void}
 */
function handleTextareaDelete(event:Event): void {
  const target = event.target as HTMLElement;
  if (!confirm('Are you sure you want to delete the note?')) return;

  const noteElement = target.closest('.item');
  const noteId = noteElement?.querySelector('textarea')?.dataset.id;

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
 * @function handleTextareaChange
 * @description Обрабатывает изменение текста заметки
 * @param {Event} event - Событие изменения
 * @returns {void}
 */
function handleTextareaChange(event: Event): void {
  const target = event.target as HTMLTextAreaElement;
  const noteElement = target.closest('.item');
  if (!noteElement) {
    console.warn('Note element not found');
    return;
  }
  const noteId = noteElement.querySelector('textarea')?.dataset.id;
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
 * @function updateUIAndStorage
 * @description Обновляет пользовательский интерфейс и сохраняет заметки в локальное хранилище
 * @returns {void}
 */
function updateUIAndStorage():void {
  renderNoteUI(APP_STATE.notes);
  localStorage.setItem('notes', JSON.stringify(APP_STATE.notes));
}

/**
 * @function handleCreateNoteClick
 * @description Обрабатывает создание новой заметки
 * @returns {void}
 */
function handleCreateNoteClick():void {
  APP_STATE.notes = [...APP_STATE.notes, { text: '', id: uuidv4() }];
  updateUIAndStorage();
  APP_UTILS.showToast('New note created');
}

// Инициализация приложения
initApp();
