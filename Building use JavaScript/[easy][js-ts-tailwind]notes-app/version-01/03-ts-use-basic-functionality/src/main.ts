/**
 * Приложение для создания и управления заметками.
 * Позволяет пользователям создавать, редактировать и удалять заметки,
 * которые сохраняются в локальном хранилище браузера.
 * Поддерживает форматирование текста с использованием Markdown.
 */
import './style.css';
import { icons } from 'feather-icons';
import { marked } from 'marked';

/**
 * Интерфейс конфигурации приложения.
 * @interface
 */
interface AppConfig {
  /** Корневой селектор приложения. */
  root: string;
  /** Объект с селекторами элементов. */
  selectors: {
    /** Селектор для кнопки добавления заметки. */
    add: string;
    /** Селектор для списка заметок. */
    list: string;
  };
}

/**
 * Конфигурация приложения.
 * @type {AppConfig}
 */
const APP_CONFIG: AppConfig = {
  root: '#app',
  selectors: {
    add: '[data-note-add]',
    list: '[data-note-list]',
  },
};

/**
 * Интерфейс состояния приложения.
 * @interface
 */
interface AppState {
  /** Объект с элементами DOM. */
  elements: {
    /** Кнопка добавления заметки. */
    add: HTMLButtonElement | null;
    /** Контейнер списка заметок. */
    list: HTMLDivElement | null;
  };
}

/**
 * Состояние приложения.
 * @type {AppState}
 */
const APP_STATE: AppState = {
  elements: {
    add: null,
    list: null,
  },
};

/**
 * Интерфейс утилит приложения.
 * @interface
 */
interface AppUtils {
  /**
   * Функция для обработки data-атрибутов.
   * @param {string} element - Строка с data-атрибутом.
   * @returns {string} Обработанная строка без квадратных скобок.
   */
  renderDataAttributes: (element: string) => string;
}

/**
 * Утилиты приложения.
 * @type {AppUtils}
 */
const APP_UTILS: AppUtils = {
  renderDataAttributes: (element: string): string => element.slice(1, -1),
};

/**
 * Создает HTML-структуру приложения и вставляет ее в корневой элемент.
 * Использует конфигурацию приложения для получения селекторов и утилиты для обработки data-атрибутов.
 * @function
 * @returns {void}
 * @throws {Error} Если корневой элемент не найден в DOM.
 */
function createAppHTML(): void {
  const { root, selectors: { add, list } } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement: HTMLElement | null = document.querySelector(root);

  if (!rootElement) {
    throw new Error('Корневой элемент не найден');
  }

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
 * Инициализирует DOM-элементы приложения и сохраняет их в состоянии приложения.
 */
function initDOMElements(): void {
  APP_STATE.elements = {
    add: document.querySelector<HTMLButtonElement>(APP_CONFIG.selectors.add),
    list: document.querySelector<HTMLDivElement>(APP_CONFIG.selectors.list),
  };
}

/**
 * Инициализирует приложение: создает HTML-структуру, инициализирует DOM-элементы,
 * отображает данные из localStorage и добавляет обработчик события для создания новой заметки.
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();
  displayLocalStorage();
  APP_STATE.elements.add?.addEventListener('click', () => createNoteUI());
}

/**
 * Отображает заметки из локального хранилища.
 */
function displayLocalStorage(): void {
  const notes: string[] = getLocalStorageData();
  notes.forEach(createNoteUI);
}

/**
 * Получает данные заметок из локального хранилища.
 * @returns {string[]} Массив строк с заметками или пустой массив, если данных нет.
 */
function getLocalStorageData(): string[] {
  const storedData: string | null = localStorage.getItem('notes');
  return storedData ? JSON.parse(storedData) : [];
}

/**
 * Интерфейс для элементов заметки.
 */
interface NoteElements {
  btnEdit: HTMLButtonElement;
  btnDelete: HTMLButtonElement;
  content: HTMLDivElement;
  textarea: HTMLTextAreaElement;
}

/**
 * Создает UI для одной заметки.
 * @param {string} note - Текст заметки. По умолчанию пустая строка.
 */
function createNoteUI(note: string = ''): void {
  const noteElement: HTMLDivElement = createNoteElement(note);
  const { btnEdit, btnDelete, content, textarea }: NoteElements = getNoteElements(noteElement);

  initializeNoteContent(note, content, textarea);
  attachEventListeners(noteElement, btnEdit, btnDelete, content, textarea);
  APP_STATE.elements.list?.appendChild(noteElement);
}

/**
 * Создает элемент заметки.
 * @param {string} note - Текст заметки.
 * @returns {HTMLDivElement} Созданный элемент заметки.
 */
function createNoteElement(note: string): HTMLDivElement {
  const noteElement: HTMLDivElement = document.createElement('div');
  noteElement.classList.add('border', 'bg-white', 'rounded');
  noteElement.innerHTML = generateNoteHTML(note);
  return noteElement;
}

/**
 * Генерирует HTML для заметки.
 * @param {string} note - Текст заметки.
 * @returns {string} HTML-строка для заметки.
 */
function generateNoteHTML(note: string): string {
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
 * @param {HTMLElement} noteElement - Элемент заметки.
 * @returns {NoteElements} Объект с элементами заметки.
 */
function getNoteElements(noteElement: HTMLElement): NoteElements {
  return {
    btnEdit: noteElement.querySelector<HTMLButtonElement>('[data-note-edit]')!,
    btnDelete: noteElement.querySelector<HTMLButtonElement>('[data-note-delete]')!,
    content: noteElement.querySelector<HTMLDivElement>('.markdown-body')!,
    textarea: noteElement.querySelector<HTMLTextAreaElement>('textarea')!,
  };
}

/**
 * Инициализирует содержимое заметки.
 * @param {string} note - Текст заметки.
 * @param {HTMLDivElement} content - Элемент для отображения отформатированного текста.
 * @param {HTMLTextAreaElement} textarea - Элемент для редактирования текста.
 */
function initializeNoteContent(note: string, content: HTMLDivElement, textarea: HTMLTextAreaElement): void {
  textarea.value = note;
  content.innerHTML = <string>marked.parse(note);
  textarea.focus();
}

/**
 * Прикрепляет обработчики событий к элементам заметки.
 * @param {HTMLElement} noteElement - Элемент заметки.
 * @param {HTMLButtonElement} btnEdit - Кнопка редактирования.
 * @param {HTMLButtonElement} btnDelete - Кнопка удаления.
 * @param {HTMLDivElement} content - Элемент для отображения отформатированного текста.
 * @param {HTMLTextAreaElement} textarea - Элемент для редактирования текста.
 */
function attachEventListeners(noteElement: HTMLElement, btnEdit: HTMLButtonElement, btnDelete: HTMLButtonElement, content: HTMLDivElement, textarea: HTMLTextAreaElement): void {
  btnDelete.addEventListener('click', () => handleDelete(noteElement));
  btnEdit.addEventListener('click', () => handleEdit(content, textarea));
  textarea.addEventListener('input', (event: Event) => {
    const target = event.target as HTMLTextAreaElement;
    handleInput(target.value, content);
  });
}

/**
 * Обрабатывает удаление заметки.
 * @param {HTMLElement} noteElement - Элемент заметки для удаления.
 */
function handleDelete(noteElement: HTMLElement): void {
  if (!confirm('Вы уверены?')) return;
  noteElement.remove();
  setLocalStorageData();
}

/**
 * Обрабатывает переключение между режимами просмотра и редактирования заметки.
 * @param {HTMLDivElement} content - Элемент для отображения отформатированного текста.
 * @param {HTMLTextAreaElement} textarea - Элемент для редактирования текста.
 */
function handleEdit(content: HTMLDivElement, textarea: HTMLTextAreaElement): void {
  content.classList.toggle('hidden');
  textarea.classList.toggle('hidden');
}

/**
 * Обрабатывает ввод текста в заметку.
 * @param {string} value - Введенный текст.
 * @param {HTMLDivElement} content - Элемент для отображения отформатированного текста.
 */
function handleInput(value: string, content: HTMLDivElement): void {
  setLocalStorageData();
  content.innerHTML = <string>marked.parse(value);
}

/**
 * Сохраняет данные заметок в локальное хранилище.
 */
function setLocalStorageData(): void {
  const notes: string[] = Array.from(document.querySelectorAll<HTMLTextAreaElement>('textarea')).map(textarea => textarea.value);
  localStorage.setItem('notes', JSON.stringify(notes));
}

// Инициализация приложения
initApp();
