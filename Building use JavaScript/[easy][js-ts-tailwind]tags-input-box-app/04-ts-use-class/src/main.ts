/**
 * Этот код реализует компонент TagInputBox, который позволяет пользователю
 * добавлять, удалять и управлять тегами. Компонент имеет ограничение на
 * максимальное количество тегов, сохраняет теги в локальном хранилище и
 * обеспечивает интерактивный пользовательский интерфейс для работы с тегами.
 */

import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import { icons } from 'feather-icons';

/**
 * Интерфейс для конфигурации компонента TagInputBox.
 */
interface Config {
  /** Селектор корневого элемента */
  root: string;
  /** Объект с селекторами для различных элементов компонента */
  selectors: {
    /** Селектор контейнера тегов */
    tagContainer: string;
    /** Селектор поля ввода тегов */
    tagInput: string;
    /** Селектор счетчика тегов */
    tagCount: string;
    /** Селектор кнопки удаления всех тегов */
    removeAll: string;
  };
  /** Максимальное количество тегов */
  tagsCount: number;
}

/**
 * Интерфейс для состояния компонента TagInputBox.
 */
interface State {
  /** Объект с ссылками на DOM элементы */
  elements: {
    /** Ссылка на контейнер тегов */
    tagContainer: HTMLElement | null;
    /** Ссылка на поле ввода тегов */
    tagInput: HTMLInputElement | null;
    /** Ссылка на счетчик тегов */
    tagCount: HTMLElement | null;
    /** Ссылка на кнопку удаления всех тегов */
    removeAll: HTMLElement | null;
  };
  /** Массив текущих тегов */
  tags: string[];
}

/**
 * Интерфейс для вспомогательных утилит компонента TagInputBox.
 */
interface Utils {
  /** Функция для рендеринга data-атрибутов */
  renderDataAttributes: (element: string) => string;
  /** Конфигурация для уведомлений */
  toastConfig: {
    /** CSS класс уведомления */
    className: string;
    /** Длительность отображения уведомления */
    duration: number;
    /** Гравитация уведомления */
    gravity: string;
    /** Позиция уведомления */
    position: string;
  };
  /** Функция для отображения уведомления */
  showToast: (message: string) => void;
}

/**
 * Класс TagInputBox реализует функциональность компонента управления тегами.
 */
class TagInputBox {
  /** Конфигурация компонента */
  private readonly config: Config;
  /** Состояние компонента */
  private state: State;
  /** Вспомогательные утилиты */
  private readonly utils: Utils;

  /**
   * Конструктор класса TagInputBox.
   * Инициализирует конфигурацию, состояние и утилиты компонента.
   */
  constructor() {
    this.config = {
      root: '#app',
      selectors: {
        tagContainer: '[data-tag-container]',
        tagInput: '[data-tag-input]',
        tagCount: '[data-tag-count]',
        removeAll: '[data-remove-all]',
      },
      tagsCount: 10,
    };

    this.state = {
      elements: {
        tagContainer: null,
        tagInput: null,
        tagCount: null,
        removeAll: null,
      },
      tags: [],
    };

    this.utils = {
      renderDataAttributes: (element: string): string => element.slice(1, -1),
      toastConfig: {
        className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
        duration: 3000,
        gravity: 'bottom',
        position: 'center',
      },
      showToast: (message: string): void => {
        // @ts-ignore
        Toastify({
          text: message,
          ...this.utils.toastConfig,
        }).showToast();
      },
    };

    this.init();
  }

  /**
   * Создает HTML разметку компонента.
   */
  private createAppHTML(): void {
    const { root, selectors: { tagContainer, tagInput, tagCount, removeAll } } = this.config;
    const { renderDataAttributes } = this.utils;
    const rootElement = document.querySelector<HTMLElement>(root);

    if (!rootElement) return;

    rootElement.innerHTML = `
      <div class='grid max-w-md w-full gap-4 rounded border bg-white p-3 shadow'>
        <h1 class='flex items-center gap-3 text-2xl font-bold md:text-3xl'>
          ${icons.tag.toSvg()}
          <span>Tags Input Box</span>
        </h1>
        <div class='grid gap-3'>
          <p>Press enter or add a comma after each tag</p>
          <div class='flex flex-wrap gap-2' ${renderDataAttributes(tagContainer)}>
            <input
              class='w-full rounded border bg-slate-50 px-3 py-2 focus:border-blue-400 focus:outline-none'
              type='text'
              spellcheck='false'
              data-tag-input
              ${renderDataAttributes(tagInput)}
            >
          </div>
        </div>
        <div class='flex items-center justify-between gap-3'>
          <p><span class="font-bold" ${renderDataAttributes(tagCount)}>10</span> tags are remaining</p>
          <button class='border px-3 py-2 hover:bg-slate-50' ${renderDataAttributes(removeAll)}>Remove All</button>
        </div>
      </div>
    `;
  }

  /**
   * Инициализирует DOM элементы компонента.
   */
  private initDOMElements(): void {
    this.state.elements = {
      tagContainer: document.querySelector(this.config.selectors.tagContainer),
      tagInput: document.querySelector(this.config.selectors.tagInput),
      tagCount: document.querySelector(this.config.selectors.tagCount),
      removeAll: document.querySelector(this.config.selectors.removeAll),
    };
  }

  /**
   * Инициализирует компонент.
   */
  private init(): void {
    this.createAppHTML();
    this.initDOMElements();
    this.state.tags = this.localStorageGet();
    this.updateRemainingTagsCount();
    this.renderTags();
    this.state.elements.tagInput?.addEventListener('keyup', this.handleTagInputKeyup.bind(this));
    this.state.elements.removeAll?.addEventListener('click', this.handleRemoveAllClick.bind(this));
  }

  /**
   * Получает теги из локального хранилища.
   * @returns {string[]} Массив тегов.
   */
  private localStorageGet(): string[] {
    return JSON.parse(localStorage.getItem('tags') || '["dev", "react"]');
  }

  /**
   * Обновляет отображение оставшегося количества тегов.
   */
  private updateRemainingTagsCount(): void {
    if (this.state.elements.tagCount) {
      this.state.elements.tagCount.textContent = String(this.config.tagsCount - this.state.tags.length);
    }
    this.state.elements.tagInput?.focus();
  }

  /**
   * Удаляет все элементы тегов из DOM.
   */
  private clearTagElements(): void {
    this.state.elements.tagContainer?.querySelectorAll('[data-tag]').forEach((tag) => tag.remove());
  }

  /**
   * Создает DOM элемент для отдельного тега.
   * @param {string} tag - Текст тега.
   * @returns {HTMLElement} DOM элемент тега.
   */
  private createTagElement(tag: string): HTMLElement {
    const tagElement = document.createElement('div');
    tagElement.className = 'flex bg-gray-100 p-1.5 rounded';
    tagElement.setAttribute('data-tag', '');
    tagElement.innerHTML = `
      <span>${tag}</span>
      <div data-remove><span class='pointer-events-none'>${icons.x.toSvg()}</span></div>
    `;
    tagElement.querySelector('[data-remove]')?.addEventListener('click', this.handleRemoveTag.bind(this));
    return tagElement;
  }

  /**
   * Отрисовывает все теги в DOM.
   */
  private renderTags(): void {
    this.clearTagElements();
    this.state.tags.forEach((tag) => {
      const tagElement = this.createTagElement(tag);
      this.state.elements.tagContainer?.insertBefore(tagElement, this.state.elements.tagInput);
    });
    this.updateRemainingTagsCount();
  }

  /**
   * Сохраняет данные в локальное хранилище.
   * @param {string[]} data - Массив данных для сохранения.
   * @param {string} name - Ключ для сохранения в локальном хранилище.
   */
  private localStorageSet(data: string[], name: string): void {
    localStorage.setItem(name, JSON.stringify(data));
  }

  /**
   * Обновляет теги в хранилище и перерисовывает их в DOM.
   */
  private updateTagsAndRender(): void {
    this.localStorageSet(this.state.tags, 'tags');
    this.renderTags();
  }

  /**
   * Обработчик события удаления отдельного тега.
   * @param {Event} event - Событие клика.
   */
  private handleRemoveTag(event: Event): void {
    const target = event.target as HTMLElement;
    if (target instanceof HTMLElement) {
      const tagElement = target.closest('.flex');
      if (tagElement) {
        const tag = tagElement.querySelector('span')?.textContent;
        if (tag) {
          let index = this.state.tags.indexOf(tag);
          this.state.tags = [...this.state.tags.slice(0, index), ...this.state.tags.slice(index + 1)];
          tagElement.remove();
          this.localStorageSet(this.state.tags, 'tags');
          this.updateRemainingTagsCount();
        }
      }
    }
  }

  /**
   * Обработчик события ввода нового тега.
   * @param {KeyboardEvent} event - Событие нажатия клавиши.
   */
  private handleTagInputKeyup({ target, key }: KeyboardEvent): void {
    if (key !== 'Enter' || !(target instanceof HTMLInputElement)) return;
    const newTags = target.value
      .trim()
      .split(',')
      .filter((tag) => tag.length > 1);
    const uniqueNewTags = newTags.filter((tag) => !this.state.tags.includes(tag));
    if (uniqueNewTags.length && this.state.tags.length < this.config.tagsCount) {
      this.state.tags = [...this.state.tags, ...uniqueNewTags.slice(0, this.config.tagsCount - this.state.tags.length)];
      this.updateTagsAndRender();
    }
    target.value = '';
  }

  /**
   * Обработчик события удаления всех тегов.
   */
  private handleRemoveAllClick(): void {
    if (!confirm('Are you sure you want to delete all the tags?')) return;
    this.state.tags = [];
    this.updateTagsAndRender();
    this.utils.showToast('All tags removed');
  }
}

new TagInputBox();
