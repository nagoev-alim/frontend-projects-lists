/**
 * Этот код представляет собой приложение для управления тегами.
 * Оно позволяет пользователям добавлять, удалять и просматривать теги,
 * с ограничением на максимальное количество тегов.
 * Приложение использует локальное хранилище для сохранения тегов между сессиями.
 */

import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import { icons } from 'feather-icons';

/**
 * Конфигурация приложения
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента
 * @property {Object} selectors - Селекторы для различных элементов DOM
 * @property {number} tagsCount - Максимальное количество тегов
 */
const APP_CONFIG = {
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
 * @typedef {Object} AppState
 * @property {Object} elements - Ссылки на элементы DOM
 * @property {string[]} tags - Массив тегов
 */
const APP_STATE = {
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
 * @type {Object}
 */
const APP_UTILS = {
  /**
   * Преобразует селектор атрибута данных в строку для использования в HTML
   * @param {string} element - Селектор атрибута данных
   * @returns {string} Строка атрибута данных
   */
  renderDataAttributes: (element) => element.slice(1, -1),
  
  /**
   * Конфигурация для уведомлений Toastify
   * @type {Object}
   */
  toastConfig: {
    className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
    duration: 3000,
    gravity: 'bottom',
    position: 'center',
  },
  
  /**
   * Показывает уведомление с заданным сообщением
   * @param {string} message - Сообщение для отображения
   */
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
  const {
    root,
    selectors: { tagContainer, tagInput, tagCount, removeAll },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector(root);

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
 * Инициализирует ссылки на элементы DOM
 */
function initDOMElements() {
  APP_STATE.elements = {
    tagContainer: document.querySelector(APP_CONFIG.selectors.tagContainer),
    tagInput: document.querySelector(APP_CONFIG.selectors.tagInput),
    tagCount: document.querySelector(APP_CONFIG.selectors.tagCount),
    removeAll: document.querySelector(APP_CONFIG.selectors.removeAll),
  };
}

/**
 * Инициализирует приложение
 */
function initApp() {
  createAppHTML();
  initDOMElements();
  APP_STATE.tags = localStorageGet();
  updateRemainingTagsCount();
  renderTags();
  APP_STATE.elements.tagInput.addEventListener('keyup', handleTagInputKeyup);
  APP_STATE.elements.removeAll.addEventListener('click', handleRemoveAllClick);
}

/**
 * Получает теги из локального хранилища
 * @returns {string[]} Массив тегов
 */
function localStorageGet() {
  return JSON.parse(localStorage.getItem('tags') || '["dev", "react"]');
}

/**
 * Обновляет отображение оставшегося количества тегов
 */
function updateRemainingTagsCount() {
  APP_STATE.elements.tagCount.textContent = String(APP_CONFIG.tagsCount - APP_STATE.tags.length);
  APP_STATE.elements.tagInput.focus();
}

/**
 * Удаляет все элементы тегов из DOM
 */
function clearTagElements() {
  APP_STATE.elements.tagContainer
    .querySelectorAll('[data-tag]')
    .forEach((tag) => tag.remove());
}

/**
 * Создает элемент тега
 * @param {string} tag - Текст тега
 * @returns {HTMLElement} Элемент тега
 */
function createTagElement(tag) {
  const tagElement = document.createElement('div');
  tagElement.className = 'flex bg-gray-100 p-1.5 rounded';
  tagElement.setAttribute('data-tag', '');
  tagElement.innerHTML = `
    <span>${tag}</span>
    <div data-remove><span class='pointer-events-none'>${icons.x.toSvg()}</span></div>
  `;
  tagElement
    .querySelector('[data-remove]')
    .addEventListener('click', handleRemoveTag);
  return tagElement;
}

/**
 * Отрисовывает все теги
 */
function renderTags() {
  clearTagElements();
  APP_STATE.tags.forEach((tag) => {
    const tagElement = createTagElement(tag);
    APP_STATE.elements.tagContainer.insertBefore(tagElement, APP_STATE.elements.tagInput);
  });
  updateRemainingTagsCount();
}

/**
 * Сохраняет данные в локальное хранилище
 * @param {*} data - Данные для сохранения
 * @param {string} name - Ключ для сохранения
 */
function localStorageSet(data, name) {
  localStorage.setItem(name, JSON.stringify(data));
}

/**
 * Обновляет теги и перерисовывает их
 */
function updateTagsAndRender() {
  localStorageSet(APP_STATE.tags, 'tags');
  renderTags();
}

/**
 * Обработчик удаления тега
 * @param {Event} event - Событие клика
 */
function handleRemoveTag({ target }) {
  const tag = target.closest('.flex').querySelector('span').textContent;
  let index = APP_STATE.tags.indexOf(tag);
  APP_STATE.tags = [...APP_STATE.tags.slice(0, index), ...APP_STATE.tags.slice(index + 1)];
  target.closest('.flex').remove();
  localStorageSet(APP_STATE.tags, 'tags');
  updateRemainingTagsCount();
}

/**
 * Обработчик ввода нового тега
 * @param {KeyboardEvent} event - Событие нажатия клавиши
 */
function handleTagInputKeyup({ target, key }) {
  if (key !== 'Enter') return;
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
function handleRemoveAllClick() {
  if (!confirm('Are you sure you want to delete all the tags?')) return;
  APP_STATE.tags = [];
  updateTagsAndRender();
  APP_UTILS.showToast('All tags removed');
}

initApp();
