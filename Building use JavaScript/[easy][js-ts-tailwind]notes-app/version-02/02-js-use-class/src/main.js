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
 * @class Notes
 * @description Класс для управления заметками. Обеспечивает функциональность создания, редактирования и удаления заметок.
 */
class Notes {
  /**
   * @constructor
   * @description Создает экземпляр класса Notes, инициализирует конфигурацию, состояние и утилиты.
   */
  constructor() {
    /**
     * @property {Object} config - Конфигурация приложения.
     * @property {string} config.root - Селектор корневого элемента приложения.
     * @property {Object} config.selectors - Объект с селекторами для различных элементов интерфейса.
     */
    this.config = {
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
     * @property {Object} state - Состояние приложения.
     * @property {Object} state.elements - Объект для хранения DOM элементов.
     * @property {Array} state.notesCollection - Массив для хранения заметок.
     * @property {boolean} state.isEditMode - Флаг режима редактирования.
     * @property {Object|null} state.currentEditNote - Текущая редактируемая заметка.
     */
    this.state = {
      elements: {},
      notesCollection: [],
      isEditMode: false,
      currentEditNote: null,
    };

    /**
     * @property {Object} utils - Утилиты приложения.
     */
    this.utils = {
      /**
       * Обрабатывает строку data-атрибута, удаляя квадратные скобки.
       * @param {string} element - Строка data-атрибута.
       * @returns {string} Обработанная строка.
       */
      renderDataAttributes: (element) => element.slice(1, -1),

      /**
       * @property {Object} toastConfig - Конфигурация для уведомлений Toastify.
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
          ...this.utils.toastConfig,
        }).showToast();
      },
    };

    this.init();
  }

  /**
   * @method createAppHTML
   * @description Создает HTML структуру приложения и вставляет ее в DOM.
   */
  createAppHTML() {
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
    } = this.config;
    const { renderDataAttributes } = this.utils;
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
   * @method initDOMElements
   * @description Инициализирует DOM элементы и сохраняет их в состоянии приложения.
   */
  initDOMElements() {
    this.state.elements = {
      notesList: document.querySelector(this.config.selectors.notesList),
      addNoteBtn: document.querySelector(this.config.selectors.addNoteBtn),
      modal: document.querySelector(this.config.selectors.modal),
      modalTitle: document.querySelector(this.config.selectors.modalTitle),
      modalCloseBtn: document.querySelector(this.config.selectors.modalCloseBtn),
      noteForm: document.querySelector(this.config.selectors.noteForm),
    };
  }

  /**
   * @method init
   * @description Инициализирует приложение, создавая HTML структуру, инициализируя DOM элементы и устанавливая обработчики событий.
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();

    this.displayLocalStorageData();
    this.state.elements.addNoteBtn.addEventListener('click', this.handleCallNoteModal.bind(this));
    this.state.elements.modal.addEventListener('click', this.handleCallNoteModal.bind(this));
    document.addEventListener('keydown', this.handleCallNoteModal.bind(this));
    this.state.elements.noteForm.addEventListener('submit', this.handleNoteFormSubmit.bind(this));
    this.state.elements.notesList.addEventListener('click', this.handleNotesListClick.bind(this));
  }

  /**
   * Получает данные заметок из локального хранилища.
   * @returns {Array} Массив заметок или пустой массив, если данных нет.
   */
  getLocalStorageData() {
    return JSON.parse(localStorage.getItem('notes')) || [];
  }

  /**
   * Отображает заметки на странице.
   * @param {Array} notes - Массив заметок для отображения.
   */
  renderNotes(notes = []) {
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

      this.state.elements.notesList
        .querySelector('.item--add')
        .insertAdjacentHTML('afterend', html);
    }
  }

  /**
   * Отображает данные из локального хранилища на странице.
   */
  displayLocalStorageData() {
    this.state.notesCollection = this.getLocalStorageData();
    this.renderNotes(this.state.notesCollection);
  }

  /**
   * Обрабатывает вызов модального окна для создания/редактирования заметки.
   * @param {Event} event - Событие, вызвавшее функцию.
   */
  handleCallNoteModal({ target, key }) {
    const toggleModal = (action) =>
      this.state.elements.modal.classList.toggle('hidden', action === 'close');

    if (target.matches(this.config.selectors.addNoteBtn)) {
      toggleModal('open');
    }
    if (
      key === 'Escape' ||
      target.matches(this.config.selectors.modalCloseBtn) ||
      target === this.state.elements.modal
    ) {
      toggleModal('close');
    }
  }

  /**
   * Добавляет новую заметку в коллекцию.
   * @param {string} title - Заголовок заметки.
   * @param {string} description - Описание заметки.
   */
  addNewNote(title, description) {
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
    this.state.notesCollection = [...this.state.notesCollection, newNote];
    this.utils.showToast('The note has been successfully created');
  }

  /**
   * Редактирует существующую заметку.
   * @param {string} title - Новый заголовок заметки.
   * @param {string} description - Новое описание заметки.
   */
  editExistingNote(title, description) {
    this.state.notesCollection = this.state.notesCollection.map((note) =>
      note.id === this.state.currentEditNote?.id
        ? {
          title,
          description,
          id: this.state.currentEditNote.id,
          date: this.state.currentEditNote.date,
        }
        : note,
    );

    this.state.elements.noteForm.querySelector('button').textContent = 'Add new note';
    this.state.elements.modalTitle.textContent = 'Add note';

    this.state.isEditMode = false;
    this.state.currentEditNote = null;

    this.utils.showToast('The note has been successfully updated');
  }

  /**
   * Сохраняет данные в локальное хранилище.
   * @param {Array} items - Массив заметок для сохранения.
   */
  setLocalStorageData(items) {
    return localStorage.setItem('notes', JSON.stringify(items));
  }

  /**
   * Обрабатывает отправку формы создания/редактирования заметки.
   * @param {Event} event - Событие отправки формы.
   */
  handleNoteFormSubmit(event) {
    event.preventDefault();
    const { title, description } = Object.fromEntries(new FormData(event.target));
    const isEmptyString = (string) => string.trim() === '';

    if (isEmptyString(title) || isEmptyString(description)) {
      this.utils.showToast('Please fill in all required fields');
      return;
    }

    !this.state.isEditMode
      ? this.addNewNote(title, description)
      : this.editExistingNote(title, description);

    this.renderNotes(this.state.notesCollection);
    this.setLocalStorageData(this.state.notesCollection);
    event.target.reset();
    this.state.elements.modal.classList.add('hidden');
  }

  /**
   * Обрабатывает клики по элементам списка заметок.
   * @param {Event} event - Событие клика.
   */
  handleNotesListClick({ target }) {
    const handleOptionsClick = () =>
      target.nextElementSibling.classList.toggle('hidden');

    const handleDeleteClick = () => {
      target.parentElement.classList.toggle('hidden');

      if (!confirm('Are you sure you want to delete this note?')) return;

      this.state.notesCollection = this.state.notesCollection.filter(
        (note) => note.id !== target.dataset.noteDelete,
      );
      this.renderNotes(this.state.notesCollection);
      this.setLocalStorageData(this.state.notesCollection);
      this.utils.showToast('The note has been successfully deleted');
    };

    const handleEditClick = () => {
      target.parentElement.classList.toggle('hidden');
      this.state.isEditMode = true;
      this.state.currentEditNote = this.state.notesCollection.find(
        (note) => note.id === target.dataset.noteEdit,
      );

      this.state.elements.modal.classList.remove('hidden');
      this.state.elements.noteForm.elements.title.value = this.state.currentEditNote.title;
      this.state.elements.noteForm.elements.description.value = this.state.currentEditNote.description;
      this.state.elements.noteForm.querySelector('button').textContent = 'Update note';
      this.state.elements.modalTitle.textContent = 'Update note';
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
}

new Notes();
