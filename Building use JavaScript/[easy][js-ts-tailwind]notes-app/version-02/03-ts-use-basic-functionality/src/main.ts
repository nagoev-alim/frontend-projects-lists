/**
 * Приложение для управления заметками
 *
 * Этот модуль реализует функциональность для создания, редактирования, удаления и отображения заметок.
 * Он использует локальное хранилище для сохранения данных и предоставляет пользовательский интерфейс
 * для взаимодействия с заметками.
 */
import './style.css';
import { icons } from 'feather-icons';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import { v4 as uuidv4 } from 'uuid';

/**
 * @interface AppConfig
 * @description Конфигурация приложения
 */
interface AppConfig {
  /** Корневой элемент приложения */
  root: string;
  /** Селекторы для различных элементов DOM */
  selectors: {
    /** Селектор списка заметок */
    notesList: string;
    /** Селектор кнопки добавления заметки */
    addNoteBtn: string;
    /** Селектор модального окна */
    modal: string;
    /** Селектор заголовка модального окна */
    modalTitle: string;
    /** Селектор кнопки закрытия модального окна */
    modalCloseBtn: string;
    /** Селектор формы заметки */
    noteForm: string;
  };
}

/**
 * @interface Note
 * @description Структура заметки
 */
interface Note {
  /** Заголовок заметки */
  title: string;
  /** Описание заметки */
  description: string;
  /** Дата создания заметки */
  date: string;
  /** Уникальный идентификатор заметки */
  id: string;
}

/**
 * @interface AppState
 * @description Состояние приложения
 */
interface AppState {
  /** Элементы DOM */
  elements: {
    /** Элемент списка заметок */
    notesList: HTMLElement;
    /** Кнопка добавления заметки */
    addNoteBtn: HTMLButtonElement;
    /** Модальное окно */
    modal: HTMLElement;
    /** Заголовок модального окна */
    modalTitle: HTMLHeadingElement;
    /** Кнопка закрытия модального окна */
    modalCloseBtn: HTMLButtonElement;
    /** Форма заметки */
    noteForm: HTMLFormElement;
  };
  /** Коллекция заметок */
  notesCollection: Note[];
  /** Флаг режима редактирования */
  isEditMode: boolean;
  /** Текущая редактируемая заметка */
  currentEditNote: Note | null;
}

/**
 * @interface AppUtils
 * @description Утилиты приложения
 */
interface AppUtils {
  /** Функция для рендеринга data-атрибутов */
  renderDataAttributes: (element: string) => string;
  /** Конфигурация для toast-уведомлений */
  toastConfig: {
    /** CSS класс для toast */
    className: string;
    /** Продолжительность отображения toast (в мс) */
    duration?: number;
    /** Вертикальное положение toast */
    gravity?: 'top' | 'bottom';
    /** Горизонтальное положение toast */
    position?: 'left' | 'center' | 'right';
  };
  /** Функция для отображения toast-уведомления */
  showToast: (message: string) => void;
}

/**
 * @constant APP_CONFIG
 * @description Конфигурация приложения
 */
const APP_CONFIG: AppConfig = {
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
 * @constant APP_STATE
 * @description Начальное состояние приложения
 */
const APP_STATE: AppState = {
  elements: {
    notesList: document.createElement('div'),
    addNoteBtn: document.createElement('button'),
    modal: document.createElement('div'),
    modalTitle: document.createElement('h1'),
    modalCloseBtn: document.createElement('button'),
    noteForm: document.createElement('form'),
  },
  notesCollection: [],
  isEditMode: false,
  currentEditNote: null,
};

/**
 * @constant APP_UTILS
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
 * Создает HTML структуру слайдера.
 */
function createAppHTML(): void {
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
function initDOMElements(): void {
  APP_STATE.elements = {
    notesList: document.querySelector(APP_CONFIG.selectors.notesList) as HTMLDivElement,
    addNoteBtn: document.querySelector(APP_CONFIG.selectors.addNoteBtn) as HTMLButtonElement,
    modal: document.querySelector(APP_CONFIG.selectors.modal) as HTMLDivElement,
    modalTitle: document.querySelector(APP_CONFIG.selectors.modalTitle) as HTMLHeadingElement,
    modalCloseBtn: document.querySelector(APP_CONFIG.selectors.modalCloseBtn) as HTMLButtonElement,
    noteForm: document.querySelector(APP_CONFIG.selectors.noteForm) as HTMLFormElement,
  };
}

/**
 * Инициализирует приложение
 */
function initApp(): void {
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
 * @returns {Note[] | []} Массив заметок или пустой массив, если данных нет.
 */
function getLocalStorageData(): Note[] | [] {
  const storedData = localStorage.getItem('notes');
  return storedData ? JSON.parse(storedData) : [];
}

/**
 * Отображает заметки в DOM.
 * @param {Note[]} notes - Массив заметок для отображения.
 */
function renderNotes(notes: Note[] = []): void {
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

    APP_STATE.elements.notesList.querySelector('.item--add')!.insertAdjacentHTML('afterend', html);
  }
}

/**
 * Отображает данные из локального хранилища.
 */
function displayLocalStorageData(): void {
  APP_STATE.notesCollection = getLocalStorageData();
  renderNotes(APP_STATE.notesCollection);
}

/**
 * Обрабатывает вызов модального окна для заметки.
 * @param {Event} event - Событие, вызвавшее функцию.
 */
function handleCallNoteModal(event: Event): void {
  const target = event.target as HTMLElement;
  const key = (event as KeyboardEvent).key;

  const toggleModal = (action: 'open' | 'close'): void => {
    APP_STATE.elements.modal.classList.toggle('hidden', action === 'close');
  };

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
function addNewNote(title: string, description: string): void {
  const newNote: Note = {
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
function editExistingNote(title: string, description: string): void {
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

  (APP_STATE.elements.noteForm.querySelector('button') as HTMLButtonElement).textContent = 'Add new note';
  APP_STATE.elements.modalTitle.textContent = 'Add note';

  APP_STATE.isEditMode = false;
  APP_STATE.currentEditNote = null;

  APP_UTILS.showToast('The note has been successfully updated');
}

/**
 * Сохраняет данные в локальное хранилище.
 * @param {Note[]} items - Массив заметок для сохранения.
 */
function setLocalStorageData(items: Note[]): void {
  localStorage.setItem('notes', JSON.stringify(items));
}

/**
 * Обрабатывает отправку формы заметки.
 * @param {Event} event - Событие отправки формы.
 */
function handleNoteFormSubmit(event: Event): void {
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  const formData = new FormData(form);
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const isEmptyString = (string: string): boolean => string.trim() === '';

  if (isEmptyString(title) || isEmptyString(description)) {
    APP_UTILS.showToast('Please fill in all required fields');
    return;
  }

  !APP_STATE.isEditMode
    ? addNewNote(title, description)
    : editExistingNote(title, description);

  renderNotes(APP_STATE.notesCollection);
  setLocalStorageData(APP_STATE.notesCollection);
  form.reset();
  APP_STATE.elements.modal.classList.add('hidden');
}

/**
 * Обрабатывает клики по списку заметок.
 * @param {Event} event - Событие клика.
 */
function handleNotesListClick(event: Event): void {
  const target = event.target as HTMLElement;
  const handleOptionsClick = () =>
    target.nextElementSibling?.classList.toggle('hidden');

  const handleDeleteClick = () => {
    target.parentElement?.classList.toggle('hidden');

    if (!confirm('Are you sure you want to delete this note?')) return;

    APP_STATE.notesCollection = APP_STATE.notesCollection.filter(
      (note) => note.id !== target.dataset.noteDelete,
    );
    renderNotes(APP_STATE.notesCollection);
    setLocalStorageData(APP_STATE.notesCollection);
    APP_UTILS.showToast('The note has been successfully deleted');
  };

  const handleEditClick = () => {
    target.parentElement?.classList.toggle('hidden');
    APP_STATE.isEditMode = true;
    APP_STATE.currentEditNote = APP_STATE.notesCollection.find((note: Note) => note.id === target.dataset.noteEdit) || null;

    APP_STATE.elements.modal.classList.remove('hidden');
    if (APP_STATE.currentEditNote) {
      (APP_STATE.elements.noteForm.elements.namedItem('title') as HTMLInputElement).value = APP_STATE.currentEditNote.title;
      (APP_STATE.elements.noteForm.elements.namedItem('description') as HTMLTextAreaElement).value = APP_STATE.currentEditNote.description;
    }
    (APP_STATE.elements.noteForm.querySelector('button') as HTMLButtonElement).textContent = 'Update note';
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
