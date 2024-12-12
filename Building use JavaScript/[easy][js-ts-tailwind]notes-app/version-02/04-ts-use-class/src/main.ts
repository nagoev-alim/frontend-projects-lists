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
 * @class Notes
 * @description Класс для управления заметками. Обеспечивает функциональность создания, редактирования и удаления заметок.
 */
class Notes {
  private readonly config: AppConfig;
  private readonly state: AppState;
  private readonly utils: AppUtils;

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
     * @property {Object} utils - Утилиты приложения.
     */
    this.utils = {
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
      notesList: document.querySelector(this.config.selectors.notesList) as HTMLDivElement,
      addNoteBtn: document.querySelector(this.config.selectors.addNoteBtn) as HTMLButtonElement,
      modal: document.querySelector(this.config.selectors.modal) as HTMLDivElement,
      modalTitle: document.querySelector(this.config.selectors.modalTitle) as HTMLHeadingElement,
      modalCloseBtn: document.querySelector(this.config.selectors.modalCloseBtn) as HTMLButtonElement,
      noteForm: document.querySelector(this.config.selectors.noteForm) as HTMLFormElement,
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
   * @returns {Note[] | []} Массив заметок или пустой массив, если данных нет.
   */
  getLocalStorageData(): Note[] | [] {
    const storedData = localStorage.getItem('notes');
    return storedData ? JSON.parse(storedData) : [];
  }

  /**
   * Отображает заметки в DOM.
   * @param {Note[]} notes - Массив заметок для отображения.
   */
  renderNotes(notes: Note[] = []): void {
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

      this.state.elements.notesList.querySelector('.item--add')!.insertAdjacentHTML('afterend', html);
    }
  }

  /**
   * Отображает данные из локального хранилища.
   */
  displayLocalStorageData(): void {
    this.state.notesCollection = this.getLocalStorageData();
    this.renderNotes(this.state.notesCollection);
  }

  /**
   * Обрабатывает вызов модального окна для заметки.
   * @param {Event} event - Событие, вызвавшее функцию.
   */
  handleCallNoteModal(event: Event): void {
    const target = event.target as HTMLElement;
    const key = (event as KeyboardEvent).key;

    const toggleModal = (action: 'open' | 'close'): void => {
      this.state.elements.modal.classList.toggle('hidden', action === 'close');
    };

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
  addNewNote(title: string, description: string): void {
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
    this.state.notesCollection = [...this.state.notesCollection, newNote];
    this.utils.showToast('The note has been successfully created');
  }

  /**
   * Редактирует существующую заметку.
   * @param {string} title - Новый заголовок заметки.
   * @param {string} description - Новое описание заметки.
   */
  editExistingNote(title: string, description: string): void {
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

    (this.state.elements.noteForm.querySelector('button') as HTMLButtonElement).textContent = 'Add new note';
    this.state.elements.modalTitle.textContent = 'Add note';

    this.state.isEditMode = false;
    this.state.currentEditNote = null;

    this.utils.showToast('The note has been successfully updated');
  }

  /**
   * Сохраняет данные в локальное хранилище.
   * @param {Note[]} items - Массив заметок для сохранения.
   */
  setLocalStorageData(items: Note[]): void {
    localStorage.setItem('notes', JSON.stringify(items));
  }

  /**
   * Обрабатывает отправку формы заметки.
   * @param {Event} event - Событие отправки формы.
   */
  handleNoteFormSubmit(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const isEmptyString = (string: string): boolean => string.trim() === '';

    if (isEmptyString(title) || isEmptyString(description)) {
      this.utils.showToast('Please fill in all required fields');
      return;
    }

    !this.state.isEditMode
      ? this.addNewNote(title, description)
      : this.editExistingNote(title, description);

    this.renderNotes(this.state.notesCollection);
    this.setLocalStorageData(this.state.notesCollection);
    form.reset();
    this.state.elements.modal.classList.add('hidden');
  }

  /**
   * Обрабатывает клики по списку заметок.
   * @param {Event} event - Событие клика.
   */
  handleNotesListClick(event: Event): void {
    const target = event.target as HTMLElement;
    const handleOptionsClick = () =>
      target.nextElementSibling?.classList.toggle('hidden');

    const handleDeleteClick = () => {
      target.parentElement?.classList.toggle('hidden');

      if (!confirm('Are you sure you want to delete this note?')) return;

      this.state.notesCollection = this.state.notesCollection.filter(
        (note) => note.id !== target.dataset.noteDelete,
      );
      this.renderNotes(this.state.notesCollection);
      this.setLocalStorageData(this.state.notesCollection);
      this.utils.showToast('The note has been successfully deleted');
    };

    const handleEditClick = () => {
      target.parentElement?.classList.toggle('hidden');
      this.state.isEditMode = true;
      this.state.currentEditNote = this.state.notesCollection.find((note: Note) => note.id === target.dataset.noteEdit) || null;

      this.state.elements.modal.classList.remove('hidden');
      if (this.state.currentEditNote) {
        (this.state.elements.noteForm.elements.namedItem('title') as HTMLInputElement).value = this.state.currentEditNote.title;
        (this.state.elements.noteForm.elements.namedItem('description') as HTMLTextAreaElement).value = this.state.currentEditNote.description;
      }
      (this.state.elements.noteForm.querySelector('button') as HTMLButtonElement).textContent = 'Update note';
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
