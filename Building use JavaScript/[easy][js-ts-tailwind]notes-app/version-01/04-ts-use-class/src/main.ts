/**
 * @fileoverview Приложение для создания и управления заметками с использованием локального хранилища.
 * Позволяет пользователям создавать, редактировать и удалять заметки с поддержкой Markdown.
 */

import './style.css';
import { icons } from 'feather-icons';
import { marked } from 'marked';

/**
 * @interface Config
 * @description Конфигурация приложения
 */
interface Config {
  /** Корневой элемент приложения */
  root: string;
  /** Селекторы для элементов DOM */
  selectors: {
    [key: string]: string;
  };
}

/**
 * @interface State
 * @description Состояние приложения
 */
interface State {
  /** Элементы DOM */
  elements: {
    add: HTMLButtonElement | null;
    list: HTMLDivElement | null;
  };
}

/**
 * @interface Utils
 * @description Утилитарные функции
 */
interface Utils {
  /** Функция для рендеринга data-атрибутов */
  renderDataAttributes: (element: string) => string;
}

class Notes {
  private readonly config: Config;
  private state: State;
  private readonly utils: Utils;

  /**
   * @constructor
   * @description Инициализирует приложение Notes
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
   * @private
   * @description Создает HTML структуру приложения
   */
  private createAppHTML(): void {
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
   * @private
   * @description Инициализирует DOM элементы
   */
  private initDOMElements(): void {
    this.state.elements = {
      add: document.querySelector(this.config.selectors.add),
      list: document.querySelector(this.config.selectors.list),
    };
  }

  /**
   * @private
   * @description Инициализирует приложение
   */
  private init() {
    this.createAppHTML();
    this.initDOMElements();
    this.displayLocalStorage();
    this.state.elements.add?.addEventListener('click', () => this.createNoteUI());
  }

  /**
   * @private
   * @description Отображает заметки из локального хранилища
   */
  private displayLocalStorage(): void {
    const notes: string[] = this.getLocalStorageData();
    notes.forEach((note: string) => this.createNoteUI(note));
  }

  /**
   * @private
   * @description Получает данные из локального хранилища
   * @returns {string[]} Массив заметок
   */
  private getLocalStorageData(): string[] {
    const storedData: string | null = localStorage.getItem('notes');
    return storedData ? JSON.parse(storedData) : [];
  }

  /**
   * @private
   * @description Создает UI для новой заметки
   * @param {string} note - Текст заметки
   */
  private createNoteUI(note: string = ''): void {
    const noteElement = this.createNoteElement(note);
    const { btnEdit, btnDelete, content, textarea } = this.getNoteElements(noteElement);

    this.initializeNoteContent(note, content, textarea);
    this.attachEventListeners(noteElement, btnEdit, btnDelete, content, textarea);
    this.state.elements.list?.appendChild(noteElement);
  }

  /**
   * @private
   * @description Создает DOM элемент для заметки
   * @param {string} note - Текст заметки
   * @returns {HTMLElement} DOM элемент заметки
   */
  private createNoteElement(note: string): HTMLElement {
    const noteElement = document.createElement('div');
    noteElement.classList.add('border', 'bg-white', 'rounded');
    noteElement.innerHTML = this.generateNoteHTML(note);
    return noteElement;
  }

  /**
   * @private
   * @description Генерирует HTML для заметки
   * @param {string} note - Текст заметки
   * @returns {string} HTML строка
   */
  private generateNoteHTML(note: string): string {
    return `
    <div class='flex border-b bg-neutral-100 gap-2 justify-end p-1'>
      <button class='border bg-white hover:bg-slate-50 p-1.5' data-note-edit>${icons.edit.toSvg()}</button>
      <button class='border bg-white hover:bg-slate-50 p-1.5' data-note-delete>${icons.trash.toSvg()}</button>
    </div>
    <div class='markdown-body min-h-[150px] ${note ? '' : 'hidden'}'></div>
    <textarea class='bg-slate-50 border focus:border-blue-400 focus:outline-none min-h-[150px] px-3 py-2 resize-none rounded w-full ${note ? 'hidden' : ''}'></textarea>`;
  }

  /**
   * @private
   * @description Получает элементы заметки
   * @param {HTMLElement} noteElement - DOM элемент заметки
   * @returns {Object} Объект с элементами заметки
   */
  private getNoteElements(noteElement: HTMLElement): {
    btnEdit: HTMLButtonElement;
    btnDelete: HTMLButtonElement;
    content: HTMLDivElement;
    textarea: HTMLTextAreaElement
  } {
    return {
      btnEdit: noteElement.querySelector('[data-note-edit]') as HTMLButtonElement,
      btnDelete: noteElement.querySelector('[data-note-delete]') as HTMLButtonElement,
      content: noteElement.querySelector('.markdown-body') as HTMLDivElement,
      textarea: noteElement.querySelector('textarea') as HTMLTextAreaElement,
    };
  }

  /**
   * @private
   * @description Инициализирует содержимое заметки
   * @param {string} note - Текст заметки
   * @param {HTMLDivElement} content - Элемент для отображения содержимого
   * @param {HTMLTextAreaElement} textarea - Элемент для редактирования
   */
  private initializeNoteContent(note: string, content: HTMLDivElement, textarea: HTMLTextAreaElement): void {
    textarea.value = note;
    content.innerHTML = <string>marked.parse(note);
    textarea.focus();
  }

  /**
   * @private
   * @description Прикрепляет обработчики событий к элементам заметки
   * @param {HTMLElement} noteElement - DOM элемент заметки
   * @param {HTMLButtonElement} btnEdit - Кнопка редактирования
   * @param {HTMLButtonElement} btnDelete - Кнопка удаления
   * @param {HTMLDivElement} content - Элемент для отображения содержимого
   * @param {HTMLTextAreaElement} textarea - Элемент для редактирования
   */
  private attachEventListeners(
    noteElement: HTMLElement,
    btnEdit: HTMLButtonElement,
    btnDelete: HTMLButtonElement,
    content: HTMLDivElement,
    textarea: HTMLTextAreaElement,
  ): void {
    btnDelete.addEventListener('click', () => this.handleDelete(noteElement));
    btnEdit.addEventListener('click', () => this.handleEdit(content, textarea));
    textarea.addEventListener('input', (event: Event) => {
      const target = event.target as HTMLTextAreaElement;
      this.handleInput(target.value, content);
    });
  }

  /**
   * @private
   * @description Обрабатывает удаление заметки
   * @param {HTMLElement} noteElement - DOM элемент заметки
   */
  private handleDelete(noteElement: HTMLElement): void {
    if (!confirm('Вы уверены?')) return;
    noteElement.remove();
    this.setLocalStorageData();
  }

  /**
   * @private
   * @description Обрабатывает редактирование заметки
   * @param {HTMLDivElement} content - Элемент для отображения содержимого
   * @param {HTMLTextAreaElement} textarea - Элемент для редактирования
   */
  private handleEdit(content: HTMLDivElement, textarea: HTMLTextAreaElement): void {
    content.classList.toggle('hidden');
    textarea.classList.toggle('hidden');
  }

  /**
   * @private
   * @description Обрабатывает ввод в текстовое поле
   * @param {string} value - Введенный текст
   * @param {HTMLDivElement} content - Элемент для отображения содержимого
   */
  private handleInput(value: string, content: HTMLDivElement) {
    this.setLocalStorageData();
    content.innerHTML = <string>marked.parse(value);
  }

  /**
   * @private
   * @description Сохраняет данные в локальное хранилище
   */
  private setLocalStorageData(): void {
    const notes: string[] = Array.from(document.querySelectorAll<HTMLTextAreaElement>('textarea')).map(textarea => textarea.value);
    localStorage.setItem('notes', JSON.stringify(notes));
  }
}

new Notes();
