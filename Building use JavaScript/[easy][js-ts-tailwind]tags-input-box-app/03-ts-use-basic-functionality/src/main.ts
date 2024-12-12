/**
 * Этот код реализует функциональность тегов (tags) в веб-приложении.
 * Он позволяет пользователям добавлять, удалять и управлять тегами,
 * а также сохранять их в локальном хранилище браузера.
 * Код использует TypeScript и включает в себя интерфейсы для типизации,
 * а также утилиты для работы с DOM и отображения уведомлений.
 */

import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import { icons } from 'feather-icons';

/**
 * Интерфейс для конфигурации приложения
 */
interface AppConfig {
  /** Корневой элемент приложения */
  root: string;
  /** Селекторы для различных элементов DOM */
  selectors: {
    tagContainer: string;
    tagInput: string;
    tagCount: string;
    removeAll: string;
  };
  /** Максимальное количество тегов */
  tagsCount: number;
}

/**
 * Интерфейс для состояния приложения
 */
interface AppState {
  /** Элементы DOM */
  elements: {
    tagContainer: HTMLElement | null;
    tagInput: HTMLInputElement | null;
    tagCount: HTMLElement | null;
    removeAll: HTMLElement | null;
  };
  /** Массив тегов */
  tags: string[];
}

/**
 * Интерфейс для утилит приложения
 */
interface AppUtils {
  /** Функция для рендеринга data-атрибутов */
  renderDataAttributes: (element: string) => string;
  /** Конфигурация для Toast-уведомлений */
  toastConfig: {
    className: string;
    duration: number;
    gravity: string;
    position: string;
  };
  /** Функция для отображения Toast-уведомления */
  showToast: (message: string) => void;
}

/**
 * Конфигурация приложения
 */
const APP_CONFIG: AppConfig = {
  root: '#app',
  selectors: {
    tagContainer: '[data-tag-container]',
    tagInput: '[data-tag-input]',
    tagCount: '[data-tag-count]',
    removeAll: '[data-remove-all]',
  },
  tagsCount: 10,
};

/**
 * Состояние приложения
 */
const APP_STATE: AppState = {
  elements: {
    tagContainer: null,
    tagInput: null,
    tagCount: null,
    removeAll: null,
  },
  tags: [],
};

/**
 * Утилиты приложения
 * @type {AppUtils}
 */
const APP_UTILS: AppUtils = {
  /**
   * Рендерит data-атрибуты для HTML элементов
   * @param {string} element - Строка с селектором элемента
   * @returns {string} Строка без квадратных скобок
   */
  renderDataAttributes: (element: string): string => element.slice(1, -1),

  /**
   * Конфигурация для Toast-уведомлений
   * @type {Object}
   * @property {string} className - CSS классы для стилизации уведомления
   * @property {number} duration - Длительность отображения уведомления в миллисекундах
   * @property {string} gravity - Позиция уведомления по вертикали
   * @property {string} position - Позиция уведомления по горизонтали
   */
  toastConfig: {
    className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
    duration: 3000,
    gravity: 'bottom',
    position: 'center',
  },

  /**
   * Отображает Toast-уведомление
   * @param {string} message - Текст уведомления
   */
  showToast: (message: string): void => {
    // @ts-ignore
    Toastify({
      text: message,
      ...APP_UTILS.toastConfig,
    }).showToast();
  },
};

/**
 * Создает HTML-структуру приложения
 */
function createAppHTML(): void {
  const {
    root,
    selectors: {
      tagContainer,
      tagInput,
      tagCount,
      removeAll,
    },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
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
 * Инициализирует элементы DOM
 */
function initDOMElements(): void {
  APP_STATE.elements = {
    tagContainer: document.querySelector<HTMLElement>(APP_CONFIG.selectors.tagContainer),
    tagInput: document.querySelector<HTMLInputElement>(APP_CONFIG.selectors.tagInput),
    tagCount: document.querySelector<HTMLElement>(APP_CONFIG.selectors.tagCount),
    removeAll: document.querySelector<HTMLElement>(APP_CONFIG.selectors.removeAll),
  };
}

/**
 * Инициализирует приложение
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();
  APP_STATE.tags = localStorageGet();
  updateRemainingTagsCount();
  renderTags();
  APP_STATE.elements.tagInput?.addEventListener('keyup', handleTagInputKeyup);
  APP_STATE.elements.removeAll?.addEventListener('click', handleRemoveAllClick);
}

/**
 * Получает теги из локального хранилища
 * @returns {string[]} Массив тегов
 */
function localStorageGet(): string[] {
  return JSON.parse(localStorage.getItem('tags') || '["dev", "react"]');
}

/**
 * Обновляет счетчик оставшихся тегов
 */
function updateRemainingTagsCount(): void {
  if (APP_STATE.elements.tagCount) {
    APP_STATE.elements.tagCount.textContent = String(APP_CONFIG.tagsCount - APP_STATE.tags.length);
  }
  APP_STATE.elements.tagInput?.focus();
}

/**
 * Очищает элементы тегов из DOM
 */
function clearTagElements(): void {
  APP_STATE.elements.tagContainer
    ?.querySelectorAll('[data-tag]')
    .forEach((tag) => tag.remove());
}

/**
 * Создает элемент тега
 * @param {string} tag - Текст тега
 * @returns {HTMLElement} Элемент тега
 */
function createTagElement(tag: string): HTMLElement {
  const tagElement = document.createElement('div');
  tagElement.className = 'flex bg-gray-100 p-1.5 rounded';
  tagElement.setAttribute('data-tag', '');
  tagElement.innerHTML = `
    <span>${tag}</span>
    <div data-remove><span class='pointer-events-none'>${icons.x.toSvg()}</span></div>
  `;
  tagElement
    .querySelector('[data-remove]')
    ?.addEventListener('click', handleRemoveTag);
  return tagElement;
}

/**
 * Отрисовывает теги в DOM
 */
function renderTags(): void {
  clearTagElements();
  APP_STATE.tags.forEach((tag) => {
    const tagElement = createTagElement(tag);
    APP_STATE.elements.tagContainer?.insertBefore(tagElement, APP_STATE.elements.tagInput);
  });
  updateRemainingTagsCount();
}

/**
 * Сохраняет данные в локальное хранилище
 * @param {any} data - Данные для сохранения
 * @param {string} name - Ключ для сохранения
 */
function localStorageSet(data: any, name: string): void {
  localStorage.setItem(name, JSON.stringify(data));
}

/**
 * Обновляет теги и перерисовывает их
 */
function updateTagsAndRender(): void {
  localStorageSet(APP_STATE.tags, 'tags');
  renderTags();
}

/**
 * Обработчик удаления тега
 * @param {Event} event - Событие клика
 */
function handleRemoveTag(event: Event): void {
  const target = event.target as HTMLElement;
  if (target instanceof HTMLElement) {
    const tag = target.closest('.flex')?.querySelector('span')?.textContent;
    if (tag) {
      let index = APP_STATE.tags.indexOf(tag);
      APP_STATE.tags = [...APP_STATE.tags.slice(0, index), ...APP_STATE.tags.slice(index + 1)];
      target.closest('.flex')?.remove();
      localStorageSet(APP_STATE.tags, 'tags');
      updateRemainingTagsCount();
    }
  }
}

/**
 * Обработчик ввода тега
 * @param {KeyboardEvent} param0 - Событие клавиатуры
 */
function handleTagInputKeyup({ target, key }: KeyboardEvent): void {
  if (key !== 'Enter' || !(target instanceof HTMLInputElement)) return;
  const newTags = target.value
    .trim()
    .split(',')
    .filter((tag) => tag.length > 1);
  const uniqueNewTags = newTags.filter((tag) => !APP_STATE.tags.includes(tag));
  if (uniqueNewTags.length && APP_STATE.tags.length < APP_CONFIG.tagsCount) {
    APP_STATE.tags = [...APP_STATE.tags, ...uniqueNewTags.slice(0, APP_CONFIG.tagsCount - APP_STATE.tags.length)];
    updateTagsAndRender();
  }
  target.value = '';
}

/**
 * Обработчик удаления всех тегов
 */
function handleRemoveAllClick(): void {
  if (!confirm('Are you sure you want to delete all the tags?')) return;
  APP_STATE.tags = [];
  updateTagsAndRender();
  APP_UTILS.showToast('All tags removed');
}

initApp();
