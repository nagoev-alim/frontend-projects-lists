/**
 * Twitty - приложение для управления постами
 *
 * Этот код представляет собой клиентскую часть приложения для создания,
 * редактирования, удаления и отображения постов. Он использует API для
 * взаимодействия с сервером и управления данными постов.
 */

import './style.css';
import { icons } from 'feather-icons';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';

/**
 * Конфигурация приложения
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента приложения
 * @property {Object} selectors - Объект с селекторами элементов
 * @property {string} API_URL - URL API для работы с постами
 */
const APP_CONFIG = {
  root: '#app',
  selectors: {
    postForm: '[data-post-form]',
    postList: '[data-post-list]',
    loadingIndicator: '[data-loading-indicator]',
    cancelButton: '[data-cancel-button]',
  },
  API_URL: 'https://63c83f46e52516043f4ee625.mockapi.io/posts',
};

/**
 * Состояние приложения
 * @typedef {Object} AppState
 * @property {Object} elements - Объект с DOM элементами
 * @property {Array} postsList - Список постов
 * @property {boolean} isEditMode - Флаг режима редактирования
 * @property {Object|null} currentEditItem - Текущий редактируемый пост
 */
const APP_STATE = {
  elements: {},
  postsList: [],
  isEditMode: false,
  currentEditItem: null,
};

/**
 * Утилиты приложения
 * @typedef {Object} AppUtils
 * @property {Function} renderDataAttributes - Функция для рендеринга data-атрибутов
 * @property {Object} toastConfig - Конфигурация для уведомлений
 * @property {Function} showToast - Функция для отображения уведомлений
 * @property {Function} handleError - Функция для обработки ошибок
 */
const APP_UTILS = {
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
  handleError: (message, error = null) => {
    APP_UTILS.showToast(message);
    if (error) console.error(message, error);
  },
};

/**
 * Создает HTML структуру приложения
 */
function createAppHTML() {
  const {
    root,
    selectors: {
      postForm,
      postList,
      loadingIndicator,
    },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='mx-auto grid w-full max-w-2xl gap-4'>
      <h1 class='text-center font-bold text-2xl md:text-4xl'>Twitty</h1>
      <div class='grid gap-3'>
        <form class='grid gap-3 rounded border bg-white p-4' ${renderDataAttributes(postForm)}>
          <input class='w-full rounded border bg-slate-50 px-3 py-2 focus:border-blue-400 focus:outline-none' type='text' name='title' placeholder='Title'>
          <textarea class='min-h-[150px] w-full resize-none rounded border bg-slate-50 px-3 py-2 focus:border-blue-400 focus:outline-none' name='body' placeholder='Body text'></textarea>
          <button class='border px-3 py-2 hover:bg-slate-50' type='submit'>Submit</button>
        </form>
        <div class='result'>
          <div class='flex justify-center py-4' ${renderDataAttributes(loadingIndicator)}>
             <div class='dot-wave'>
              ${Array(4).fill().map(() => `<div class='dot-wave__dot'></div>`).join('')}
            </div>
          </div>
          <ul class='hidden grid gap-3' ${renderDataAttributes(postList)}></ul>
        </div>
      </div>
    </div>
  `;
}

/**
 * Инициализирует DOM элементы
 */
function initDOMElements() {
  APP_STATE.elements = {
    postForm: document.querySelector(APP_CONFIG.selectors.postForm),
    postFormSubmitButton: document.querySelector(
      `${APP_CONFIG.selectors.postForm} button[type="submit"]`,
    ),
    postList: document.querySelector(APP_CONFIG.selectors.postList),
    loadingIndicator: document.querySelector(APP_CONFIG.selectors.loadingIndicator),
  };
}

/**
 * Инициализирует приложение
 */
function initApp() {
  createAppHTML();
  initDOMElements();
  (async () => {
    await fetchPosts();
    APP_STATE.elements.postForm.addEventListener('submit', handlePostFormSubmit);
    APP_STATE.elements.postList.addEventListener('click', handlePostListClick);
  })();
}

/**
 * Загружает посты с сервера
 */
async function fetchPosts() {
  showLoading();
  try {
    const { data } = await axios.get(APP_CONFIG.API_URL);
    APP_STATE.postsList = data;
    renderPosts(APP_STATE.postsList);
  } catch (error) {
    APP_STATE.elements.postList.classList.add('hidden');
    APP_UTILS.handleError('Failed to fetch posts', error);
  } finally {
    showLoading(true);
  }
}

/**
 * Показывает или скрывает индикатор загрузки
 * @param {boolean} [isLoadingVisible=false] - Флаг видимости индикатора загрузки
 */
function showLoading(isLoadingVisible = false) {
  APP_STATE.elements.loadingIndicator.classList.toggle('hidden', isLoadingVisible);
}

/**
 * Отображает посты в DOM
 * @param {Array} postsList - Список постов для отображения
 */
function renderPosts(postsList) {
  APP_STATE.elements.postList.innerHTML = '';
  APP_STATE.elements.postList.classList.remove('hidden');

  const postItems = postsList.map(({ title, body, id }) =>
    createPostItem(title, body, id),
  );
  APP_STATE.elements.postList.append(...postItems);
}

/**
 * Создает элемент поста
 * @param {string} title - Заголовок поста
 * @param {string} body - Содержание поста
 * @param {string} id - Идентификатор поста
 * @returns {HTMLElement} Элемент поста
 */
function createPostItem(title, body, id) {
  const li = document.createElement('li');
  li.className = 'grid gap-3 relative bg-white p-3 rounded border';
  li.innerHTML = `
    <h3 class='font-bold text-xl pr-[80px]'>${title}</h3>
    <p>${body}</p>
    <div class='absolute right-3 flex gap-3'>
      ${createButton('edit', id, '#41b6e6')}
      ${createButton('delete', id, '#ff585d')}
    </div>`;
  return li;
}

/**
 * Создает кнопку действия
 * @param {string} action - Действие (edit или delete)
 * @param {string} id - Идентификатор поста
 * @param {string} color - Цвет кнопки
 * @returns {string} HTML-разметка кнопки
 */
function createButton(action, id, color) {
  return `<button data-${action}='${id}'>${icons[action === 'edit' ? 'edit' : 'x'].toSvg({ color })}</button>`;
}

/**
 * Обрабатывает отправку формы поста
 * @param {Event} event - Событие отправки формы
 */
async function handlePostFormSubmit(event) {
  event.preventDefault();
  const { title, body } = Object.fromEntries(new FormData(event.target));

  if (!title?.trim() || !body?.trim()) {
    APP_UTILS.showToast('Please fill the fields');
    return;
  }

  try {
    if (APP_STATE.isEditMode) {
      await updatePost(APP_STATE.currentEditItem.id, { title, body });
    } else {
      await createPost({ title, body });
    }
    event.target.reset();
  } catch (error) {
    APP_UTILS.handleError('Failed to create or update post', error);
  }
}

/**
 * Создает новый пост
 * @param {Object} postData - Данные нового поста
 */
async function createPost(postData) {
  await axios.post(APP_CONFIG.API_URL, postData);
  await fetchPosts();
  APP_UTILS.showToast('Post successfully created');
}

/**
 * Обновляет существующий пост
 * @param {string} id - Идентификатор поста
 * @param {Object} postData - Новые данные поста
 */
async function updatePost(id, postData) {
  await axios.put(`${APP_CONFIG.API_URL}/${id}`, postData);
  updatePostsList(id, postData);
  exitEditMode();
  APP_UTILS.showToast('Post successfully updated');
}

/**
 * Обновляет список постов после редактирования
 * @param {string} id - Идентификатор обновленного поста
 * @param {Object} postData - Новые данные поста
 */
function updatePostsList(id, { title, body }) {
  APP_STATE.postsList = APP_STATE.postsList.map((post) =>
    post.id === id ? { ...post, title, body } : post,
  );
  renderPosts(APP_STATE.postsList);
}

/**
 * Выходит из режима редактирования
 */
function exitEditMode() {
  APP_STATE.isEditMode = false;
  APP_STATE.currentEditItem = null;
  APP_STATE.elements.postForm.querySelector(APP_CONFIG.selectors.cancelButton)?.remove();
  updateButtonTextContent(APP_STATE.elements.postFormSubmitButton, 'Submit');
}

/**
 * Обрабатывает клики по списку постов
 * @param {Event} event - Событие клика
 */
async function handlePostListClick({ target }) {
  if (
    target.matches('[data-delete]') &&
    confirm('Are you sure you want to delete this post?')
  ) {
    await handlePostDelete(target.dataset.delete);
  }

  if (target.matches('[data-edit]')) {
    await handlePostEdit(target.dataset.edit);
  }
}

/**
 * Удаляет пост
 * @param {string} postId - Идентификатор удаляемого поста
 */
async function handlePostDelete(postId) {
  try {
    await axios.delete(`${APP_CONFIG.API_URL}/${postId}`);
    APP_STATE.postsList = APP_STATE.postsList.filter((post) => post.id !== postId);
    renderPosts(APP_STATE.postsList);
    APP_UTILS.showToast('Post successfully deleted');
  } catch (error) {
    APP_UTILS.handleError('Failed to delete post', error);
  }
}

/**
 * Обрабатывает редактирование поста
 * @param {string} postId - Идентификатор редактируемого поста
 */
async function handlePostEdit(postId) {
  APP_STATE.isEditMode = !APP_STATE.isEditMode;
  APP_STATE.currentEditItem = APP_STATE.postsList.find((post) => post.id === postId);

  if (!APP_STATE.isEditMode) return;

  fillFormWithPostData();
  updateButtonTextContent(APP_STATE.elements.postFormSubmitButton, 'Update');
  addCancelButton();
}

/**
 * Заполняет форму данными редактируемого поста
 */
function fillFormWithPostData() {
  const { title, body } = APP_STATE.elements.postForm.elements;
  [title.value, body.value] = [APP_STATE.currentEditItem.title, APP_STATE.currentEditItem.body];
  title.focus();
}

/**
 * Добавляет кнопку отмены в форму
 */
function addCancelButton() {
  const cancelButton = createCancelButton();
  APP_STATE.elements.postForm.appendChild(cancelButton);
  cancelButton.addEventListener('click', handleCancelEdit);
}

/**
 * Создает кнопку отмены
 * @returns {HTMLButtonElement} Кнопка отмены
 */
function createCancelButton() {
  const button = document.createElement('button');
  updateButtonTextContent(button, 'Cancel update');
  button.className = 'cancel px-3 py-2 bg-red-500 text-white hover:bg-red-400';
  button.setAttribute('type', 'button');
  button.setAttribute('data-cancel-button', '');
  return button;
}

/**
 * Обрабатывает отмену редактирования
 */
function handleCancelEdit() {
  APP_STATE.elements.postForm.reset();
  APP_STATE.elements.postForm.querySelector('[data-cancel-button]').remove();
  updateButtonTextContent(APP_STATE.elements.postFormSubmitButton, 'Submit');
  APP_STATE.isEditMode = false;
  APP_STATE.currentEditItem = null;
}

/**
 * Обновляет текст кнопки
 * @param {HTMLElement} element - Элемент кнопки
 * @param {string} text - Новый текст кнопки
 */
function updateButtonTextContent(element, text) {
  element.textContent = text;
}

initApp();
