/**
 * Twitty - Простое приложение для управления постами
 * 
 * Это приложение представляет собой систему управления постами, реализованную на TypeScript.
 * Оно позволяет пользователям создавать, просматривать, редактировать и удалять посты.
 * 
 * Основной функционал:
 * 1. Создание постов: пользователи могут добавлять новые посты, указывая заголовок и содержание.
 * 2. Просмотр постов: все созданные посты отображаются в виде списка.
 * 3. Редактирование постов: пользователи могут изменять содержание существующих постов.
 * 4. Удаление постов: возможность удаления ненужных постов.
 * 5. Асинхронное взаимодействие с API: все операции с постами синхронизируются с сервером.
 * 
 * Особенности реализации:
 * - Использование TypeScript для улучшения типобезопасности.
 * - Модульная структура кода с четким разделением ответственности.
 * - Асинхронные операции с использованием async/await.
 * - Управление состоянием приложения через глобальный объект APP_STATE.
 * - Динамическое обновление DOM при изменении данных.
 * - Обработка ошибок и отображение уведомлений пользователю.
 * - Подтверждение удаления постов для предотвращения случайных действий.
 * 
 * Интерфейс приложения включает форму для создания/редактирования постов и
 * список существующих постов с кнопками для редактирования и удаления.
 * 
 * Приложение демонстрирует основные принципы работы с API, управления состоянием
 * и обновления пользовательского интерфейса в современных веб-приложениях.
 */
import './style.css';
import { icons } from 'feather-icons';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';

/**
 * Конфигурация приложения
 * @interface AppConfig
 * @property {string} root - Селектор корневого элемента
 * @property {Object.<string, string>} selectors - Объект с селекторами элементов
 * @property {string} API_URL - URL API для работы с постами
 */
interface AppConfig {
  root: string;
  selectors: {
    [key: string]: string;
  };
  API_URL: string;
}

/**
 * Конфигурация приложения
 * @constant {AppConfig}
 */
const APP_CONFIG: AppConfig = {
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
 * Интерфейс поста
 * @interface Post
 * @property {string} id - Уникальный идентификатор поста
 * @property {string} title - Заголовок поста
 * @property {string} body - Содержание поста
 */
interface Post {
  id: string;
  title: string;
  body: string;
}

/**
 * Состояние приложения
 * @interface AppState
 * @property {Object} elements - DOM элементы приложения
 * @property {Post[]} postsList - Список постов
 * @property {boolean} isEditMode - Флаг режима редактирования
 * @property {Post | null} currentEditItem - Текущий редактируемый пост
 */
interface AppState {
  elements: {
    postForm: HTMLFormElement;
    postList: HTMLElement;
    loadingIndicator: HTMLElement;
    cancelButton?: HTMLButtonElement;
    postFormSubmitButton: HTMLButtonElement;
  };
  postsList: Post[];
  isEditMode: boolean;
  currentEditItem: Post | null;
}

/**
 * Начальное состояние приложения
 * @constant {AppState}
 */
const APP_STATE: AppState = {
  elements: {
    postForm: document.createElement('form'),
    postList: document.createElement('div'),
    loadingIndicator: document.createElement('div'),
    postFormSubmitButton: document.createElement('button'),
  },
  postsList: [],
  isEditMode: false,
  currentEditItem: null,
};

/**
 * Утилиты приложения
 * @interface AppUtils
 * @property {function} renderDataAttributes - Функция для рендеринга data-атрибутов
 * @property {Object} toastConfig - Конфигурация для уведомлений
 * @property {function} showToast - Функция для отображения уведомлений
 * @property {function} handleError - Функция для обработки ошибок
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
  handleError: (message: string, error?: any) => void;
}

/**
 * Утилиты приложения
 * @constant {AppUtils}
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
    Toastify({ text: message, ...APP_UTILS.toastConfig }).showToast();
  },
  handleError: (message, error = null) => {
    APP_UTILS.showToast(message);
    if (error) console.error(message, error);
  },
};


/**
 * Создает HTML-структуру приложения и вставляет ее в корневой элемент.
 * @function
 * @name createAppHTML
 * @returns {void}
 */
function createAppHTML(): void {
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
              ${Array(4).fill('').map(() => `<div class='dot-wave__dot'></div>`).join('')}
            </div>
          </div>
          <ul class='hidden grid gap-3' ${renderDataAttributes(postList)}></ul>
        </div>
      </div>
    </div>
  `;
}

/**
 * Инициализирует DOM-элементы приложения и сохраняет их в состоянии приложения.
 * @function
 * @name initDOMElements
 * @returns {void}
 */
function initDOMElements(): void {
  const { selectors } = APP_CONFIG;
  APP_STATE.elements = {
    postForm: document.querySelector(selectors.postForm) as HTMLFormElement,
    postList: document.querySelector(selectors.postList) as HTMLElement,
    loadingIndicator: document.querySelector(selectors.loadingIndicator) as HTMLElement,
    postFormSubmitButton: document.querySelector(`${selectors.postForm} button[type="submit"]`) as HTMLButtonElement,
  };
}

/**
 * Инициализирует приложение: создает HTML-структуру, инициализирует DOM-элементы,
 * загружает посты и устанавливает обработчики событий.
 * @function
 * @name initApp
 * @returns {void}
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();

  (async () => {
    await fetchPosts();
    const { postForm, postList } = APP_STATE.elements;
    postForm.addEventListener('submit', handlePostFormSubmit);
    postList.addEventListener('click', handlePostListClick);
  })();
}

/**
 * Загружает посты с сервера и обновляет состояние приложения.
 * @async
 * @function fetchPosts
 * @returns {Promise<void>}
 * @throws {Error} Если загрузка постов не удалась
 */
async function fetchPosts(): Promise<void> {
  try {
    showLoading(true);
    const { data } = await axios.get<Post[]>(APP_CONFIG.API_URL);
    APP_STATE.postsList = data;
    renderPosts(data);
  } catch (error) {
    APP_STATE.elements.postList.classList.add('hidden');
    APP_UTILS.handleError('Failed to fetch posts', error);
  } finally {
    showLoading(false);
  }
}

/**
 * Показывает или скрывает индикатор загрузки.
 * @function showLoading
 * @param {boolean} [isLoadingVisible=false] - Флаг видимости индикатора загрузки
 * @returns {void}
 */
function showLoading(isLoadingVisible = false): void {
  APP_STATE.elements.loadingIndicator?.classList.toggle('hidden', !isLoadingVisible);
}

/**
 * Отрисовывает список постов в DOM.
 * @function renderPosts
 * @param {Post[]} postsList - Массив постов для отрисовки
 * @returns {void}
 */
function renderPosts(postsList: Post[]): void {
  const { postList } = APP_STATE.elements;

  postList.innerHTML = '';
  postList.classList.remove('hidden');

  const fragment = document.createDocumentFragment();
  postsList.forEach((post) => {
    fragment.appendChild(createPostItem(post));
  });

  postList.appendChild(fragment);
}

/**
 * Создает DOM-элемент для отдельного поста.
 * @function createPostItem
 * @param {Post} post - Объект поста
 * @returns {HTMLLIElement} DOM-элемент поста
 */
function createPostItem({ title, body, id }: Post): HTMLLIElement {
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
 * Создает HTML-разметку кнопки для действий с постом.
 * @function
 * @param {string} action - Действие кнопки ('edit' или 'delete')
 * @param {string} id - Идентификатор поста
 * @param {string} color - Цвет иконки кнопки
 * @returns {string} HTML-разметка кнопки
 */
function createButton(action: string, id: string, color: string): string {
  const iconType = action === 'edit' ? 'edit' : 'x';
  return `<button data-${action}='${id}'>${icons[iconType].toSvg({ color })}</button>`;
}

/**
 * Обрабатывает отправку формы поста.
 * @async
 * @function
 * @param {Event} event - Событие отправки формы
 * @returns {Promise<void>}
 */
async function handlePostFormSubmit(event: Event): Promise<void> {
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  const formData = new FormData(form);
  const title = formData.get('title') as string;
  const body = formData.get('body') as string;

  if (!title?.trim() || !body?.trim()) {
    APP_UTILS.showToast('Please fill the fields');
    return;
  }

  try {
    if (APP_STATE.isEditMode && APP_STATE.currentEditItem) {
      await updatePost(APP_STATE.currentEditItem.id, { title, body });
    } else {
      await createPost({ title, body });
    }
    form.reset();
  } catch (error) {
    APP_UTILS.handleError('Failed to create or update post', error);
  }
}

/**
 * Создает новый пост.
 * @async
 * @function
 * @param {{ title: string, body: string }} postData - Данные нового поста
 * @returns {Promise<void>}
 */
async function createPost(postData: { title: string, body: string }): Promise<void> {
  await axios.post(APP_CONFIG.API_URL, postData);
  await fetchPosts();
  APP_UTILS.showToast('Post successfully created');
}

/**
 * Обновляет существующий пост.
 * @async
 * @function
 * @param {string} id - Идентификатор обновляемого поста
 * @param {{ title: string, body: string }} postData - Новые данные поста
 * @returns {Promise<void>}
 */
async function updatePost(id: string, postData: { title: string, body: string }): Promise<void> {
  await axios.put(`${APP_CONFIG.API_URL}/${id}`, postData);
  updatePostsList(id, postData);
  exitEditMode();
  APP_UTILS.showToast('Post successfully updated');
}

/**
 * Обновляет список постов в состоянии приложения и перерисовывает их.
 * @function
 * @param {string} id - Идентификатор обновленного поста
 * @param {{ title: string, body: string }} updatedData - Обновленные данные поста
 * @returns {void}
 */
function updatePostsList(id: string, { title, body }: { title: string, body: string }): void {
  APP_STATE.postsList = APP_STATE.postsList.map((post) =>
    post.id === id ? { ...post, title, body } : post,
  );
  renderPosts(APP_STATE.postsList);
}

/**
 * Выходит из режима редактирования поста.
 * Сбрасывает флаги редактирования, удаляет кнопку отмены и обновляет текст кнопки отправки формы.
 * @function
 * @returns {void}
 */
function exitEditMode(): void {
  APP_STATE.isEditMode = false;
  APP_STATE.currentEditItem = null;
  APP_STATE.elements.postForm.querySelector(APP_CONFIG.selectors.cancelButton)?.remove();
  updateButtonTextContent(APP_STATE.elements.postFormSubmitButton, 'Submit');
}

/**
 * Обрабатывает клики по списку постов.
 * Делегирует обработку событий удаления и редактирования постов.
 * @async
 * @function
 * @param {Event} event - Событие клика
 * @returns {Promise<void>}
 */
async function handlePostListClick(event: Event): Promise<void> {
  const target = event.target as HTMLElement;
  if (target.matches('[data-delete]') && confirm('Are you sure you want to delete this post?')) {
    await handlePostDelete(target.dataset.delete);
  } else if (target.matches('[data-edit]')) {
    await handlePostEdit(target.dataset.edit);
  }
}

/**
 * Обрабатывает удаление поста.
 * Отправляет запрос на удаление, обновляет список постов и отображает уведомление.
 * @async
 * @function
 * @param {string} [postId] - Идентификатор удаляемого поста
 * @returns {Promise<void>}
 */
async function handlePostDelete(postId?: string): Promise<void> {
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
 * Обрабатывает редактирование поста.
 * Переключает режим редактирования, заполняет форму данными поста и добавляет кнопку отмены.
 * @async
 * @function
 * @param {string} [postId] - Идентификатор редактируемого поста
 * @returns {Promise<void>}
 */
async function handlePostEdit(postId?: string): Promise<void> {
  APP_STATE.isEditMode = !APP_STATE.isEditMode;
  APP_STATE.currentEditItem = APP_STATE.postsList.find((post) => post.id === postId) || null;

  if (!APP_STATE.isEditMode) return;

  fillFormWithPostData();
  updateButtonTextContent(APP_STATE.elements.postFormSubmitButton, 'Update');
  addCancelButton();
}

/**
 * Заполняет форму данными текущего редактируемого поста.
 * @function
 * @returns {void}
 */
function fillFormWithPostData(): void {
  const form = APP_STATE.elements.postForm;
  const title = form.elements.namedItem('title') as HTMLInputElement;
  const body = form.elements.namedItem('body') as HTMLTextAreaElement;

  if (APP_STATE.currentEditItem) {
    title.value = APP_STATE.currentEditItem.title;
    body.value = APP_STATE.currentEditItem.body;
    title.focus();
  }
}

/**
 * Добавляет кнопку отмены в форму редактирования.
 * @function
 * @returns {void}
 */
function addCancelButton(): void {
  const cancelButton = createCancelButton();
  APP_STATE.elements.postForm.appendChild(cancelButton);
  cancelButton.addEventListener('click', handleCancelEdit);
}

/**
 * Создает кнопку отмены редактирования.
 * @function
 * @returns {HTMLButtonElement} Созданная кнопка отмены
 */
function createCancelButton(): HTMLButtonElement {
  const button = document.createElement('button');
  updateButtonTextContent(button, 'Cancel update');
  button.className = 'cancel px-3 py-2 bg-red-500 text-white hover:bg-red-400';
  button.setAttribute('type', 'button');
  button.setAttribute('data-cancel-button', '');
  return button;
}

/**
 * Обрабатывает отмену редактирования поста.
 * Сбрасывает форму, удаляет кнопку отмены и выходит из режима редактирования.
 * @function
 * @returns {void}
 */
function handleCancelEdit(): void {
  APP_STATE.elements.postForm.reset();
  APP_STATE.elements.postForm.querySelector('[data-cancel-button]')?.remove();
  updateButtonTextContent(APP_STATE.elements.postFormSubmitButton, 'Submit');
  APP_STATE.isEditMode = false;
  APP_STATE.currentEditItem = null;
}

/**
 * Обновляет текстовое содержимое кнопки.
 * @function
 * @param {HTMLButtonElement} element - Кнопка для обновления
 * @param {string} text - Новый текст кнопки
 * @returns {void}
 */
function updateButtonTextContent(element: HTMLButtonElement, text: string): void {
  element.textContent = text;
}

initApp();
