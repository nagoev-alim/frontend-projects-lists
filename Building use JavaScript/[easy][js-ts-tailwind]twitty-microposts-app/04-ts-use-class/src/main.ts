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
 * - Управление состоянием приложения через глобальный объект this.state.
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
 * Утилиты приложения
 * @interface AppUtils
 * @property {} renderDataAttributes - Функция для рендеринга data-атрибутов
 * @property {Object} toastConfig - Конфигурация для уведомлений
 * @property {} showToast - Функция для отображения уведомлений
 * @property {} handleError - Функция для обработки ошибок
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


class Twitty {
  private readonly config: AppConfig;
  private state: AppState;
  private readonly utils: AppUtils;

  /**
   * Создает экземпляр класса Twitty и инициализирует его.
   */
  constructor() {
    /**
     * Конфигурация приложения.
     * @type {Object}
     * @property {string} root - Селектор корневого элемента приложения.
     * @property {Object} selectors - Объект с селекторами элементов.
     * @property {string} API_URL - URL API для работы с постами.
     */
    this.config = {
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
     * Состояние приложения.
     * @type {Object}
     * @property {Object} elements - Объект с DOM элементами.
     * @property {Array} postsList - Список постов.
     * @property {boolean} isEditMode - Флаг режима редактирования.
     * @property {Object|null} currentEditItem - Текущий редактируемый пост.
     */
    this.state = {
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
     * Утилиты приложения.
     * @type {Object}
     * @property {Function} renderDataAttributes - Функция для рендеринга data-атрибутов.
     * @property {Object} toastConfig - Конфигурация для уведомлений.
     * @property {Function} showToast - Функция для отображения уведомлений.
     * @property {Function} handleError - Функция для обработки ошибок.
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
      handleError: (message, error = null) => {
        this.utils.showToast(message);
        if (error) console.error(message, error);
      },
    };

    this.init();
  }

  /**
   * Создает HTML структуру приложения
   */
  createAppHTML() {
    const {
      root,
      selectors: {
        postForm,
        postList,
        loadingIndicator,
      },
    } = this.config;
    const { renderDataAttributes } = this.utils;
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
   * Инициализирует DOM элементы
   */
  initDOMElements() {
    const { selectors } = this.config;
    this.state.elements = {
      postForm: document.querySelector(selectors.postForm) as HTMLFormElement,
      postList: document.querySelector(selectors.postList) as HTMLElement,
      loadingIndicator: document.querySelector(selectors.loadingIndicator) as HTMLElement,
      postFormSubmitButton: document.querySelector(`${selectors.postForm} button[type="submit"]`) as HTMLButtonElement,
    };
  }

  /**
   * Инициализирует приложение
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();
    (async () => {
      await this.fetchPosts();
      const { postForm, postList } = this.state.elements;
      postForm.addEventListener('submit', this.handlePostFormSubmit.bind(this));
      postList.addEventListener('click', this.handlePostListClick.bind(this));
    })();
  }


  /**
   * Загружает посты с сервера и обновляет состояние приложения.
   * @async
   * @ fetchPosts
   * @returns {Promise<void>}
   * @throws {Error} Если загрузка постов не удалась
   */
  async fetchPosts(): Promise<void> {
    try {
      this.showLoading(true);
      const { data } = await axios.get<Post[]>(this.config.API_URL);
      this.state.postsList = data;
      this.renderPosts(data);
    } catch (error) {
      this.state.elements.postList.classList.add('hidden');
      this.utils.handleError('Failed to fetch posts', error);
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * Показывает или скрывает индикатор загрузки.
   * @ showLoading
   * @param {boolean} [isLoadingVisible=false] - Флаг видимости индикатора загрузки
   * @returns {void}
   */
  showLoading(isLoadingVisible = false): void {
    this.state.elements.loadingIndicator?.classList.toggle('hidden', !isLoadingVisible);
  }

  /**
   * Отрисовывает список постов в DOM.
   * @ renderPosts
   * @param {Post[]} postsList - Массив постов для отрисовки
   * @returns {void}
   */
  renderPosts(postsList: Post[]): void {
    const { postList } = this.state.elements;

    postList.innerHTML = '';
    postList.classList.remove('hidden');

    const fragment = document.createDocumentFragment();
    postsList.forEach((post) => {
      fragment.appendChild(this.createPostItem(post));
    });

    postList.appendChild(fragment);
  }

  /**
   * Создает DOM-элемент для отдельного поста.
   * @ createPostItem
   * @param {Post} post - Объект поста
   * @returns {HTMLLIElement} DOM-элемент поста
   */
  createPostItem({ title, body, id }: Post): HTMLLIElement {
    const li = document.createElement('li');
    li.className = 'grid gap-3 relative bg-white p-3 rounded border';
    li.innerHTML = `
    <h3 class='font-bold text-xl pr-[80px]'>${title}</h3>
    <p>${body}</p>
    <div class='absolute right-3 flex gap-3'>
      ${this.createButton('edit', id, '#41b6e6')}
      ${this.createButton('delete', id, '#ff585d')}
    </div>`;
    return li;
  }

  /**
   * Создает HTML-разметку кнопки для действий с постом.
   * @
   * @param {string} action - Действие кнопки ('edit' или 'delete')
   * @param {string} id - Идентификатор поста
   * @param {string} color - Цвет иконки кнопки
   * @returns {string} HTML-разметка кнопки
   */
  createButton(action: string, id: string, color: string): string {
    const iconType = action === 'edit' ? 'edit' : 'x';
    return `<button data-${action}='${id}'>${icons[iconType].toSvg({ color })}</button>`;
  }

  /**
   * Обрабатывает отправку формы поста.
   * @async
   * @
   * @param {Event} event - Событие отправки формы
   * @returns {Promise<void>}
   */
  async handlePostFormSubmit(event: Event): Promise<void> {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const title = formData.get('title') as string;
    const body = formData.get('body') as string;

    if (!title?.trim() || !body?.trim()) {
      this.utils.showToast('Please fill the fields');
      return;
    }

    try {
      if (this.state.isEditMode && this.state.currentEditItem) {
        await this.updatePost(this.state.currentEditItem.id, { title, body });
      } else {
        await this.createPost({ title, body });
      }
      form.reset();
    } catch (error) {
      this.utils.handleError('Failed to create or update post', error);
    }
  }

  /**
   * Создает новый пост.
   * @async
   * @
   * @param {{ title: string, body: string }} postData - Данные нового поста
   * @returns {Promise<void>}
   */
  async createPost(postData: { title: string, body: string }): Promise<void> {
    await axios.post(this.config.API_URL, postData);
    await this.fetchPosts();
    this.utils.showToast('Post successfully created');
  }

  /**
   * Обновляет существующий пост.
   * @async
   * @
   * @param {string} id - Идентификатор обновляемого поста
   * @param {{ title: string, body: string }} postData - Новые данные поста
   * @returns {Promise<void>}
   */
  async updatePost(id: string, postData: { title: string, body: string }): Promise<void> {
    await axios.put(`${this.config.API_URL}/${id}`, postData);
    this.updatePostsList(id, postData);
    this.exitEditMode();
    this.utils.showToast('Post successfully updated');
  }

  /**
   * Обновляет список постов в состоянии приложения и перерисовывает их.
   * @
   * @param {string} id - Идентификатор обновленного поста
   * @param {{ title: string, body: string }} updatedData - Обновленные данные поста
   * @returns {void}
   */
  updatePostsList(id: string, { title, body }: { title: string, body: string }): void {
    this.state.postsList = this.state.postsList.map((post) =>
      post.id === id ? { ...post, title, body } : post,
    );
    this.renderPosts(this.state.postsList);
  }

  /**
   * Выходит из режима редактирования поста.
   * Сбрасывает флаги редактирования, удаляет кнопку отмены и обновляет текст кнопки отправки формы.
   * @
   * @returns {void}
   */
  exitEditMode(): void {
    this.state.isEditMode = false;
    this.state.currentEditItem = null;
    this.state.elements.postForm.querySelector(this.config.selectors.cancelButton)?.remove();
    this.updateButtonTextContent(this.state.elements.postFormSubmitButton, 'Submit');
  }

  /**
   * Обрабатывает клики по списку постов.
   * Делегирует обработку событий удаления и редактирования постов.
   * @async
   * @
   * @param {Event} event - Событие клика
   * @returns {Promise<void>}
   */
  async handlePostListClick(event: Event): Promise<void> {
    const target = event.target as HTMLElement;
    if (target.matches('[data-delete]') && confirm('Are you sure you want to delete this post?')) {
      await this.handlePostDelete(target.dataset.delete);
    } else if (target.matches('[data-edit]')) {
      await this.handlePostEdit(target.dataset.edit);
    }
  }

  /**
   * Обрабатывает удаление поста.
   * Отправляет запрос на удаление, обновляет список постов и отображает уведомление.
   * @async
   * @
   * @param {string} [postId] - Идентификатор удаляемого поста
   * @returns {Promise<void>}
   */
  async handlePostDelete(postId?: string): Promise<void> {
    try {
      await axios.delete(`${this.config.API_URL}/${postId}`);
      this.state.postsList = this.state.postsList.filter((post) => post.id !== postId);
      this.renderPosts(this.state.postsList);
      this.utils.showToast('Post successfully deleted');
    } catch (error) {
      this.utils.handleError('Failed to delete post', error);
    }
  }

  /**
   * Обрабатывает редактирование поста.
   * Переключает режим редактирования, заполняет форму данными поста и добавляет кнопку отмены.
   * @async
   * @
   * @param {string} [postId] - Идентификатор редактируемого поста
   * @returns {Promise<void>}
   */
  async handlePostEdit(postId?: string): Promise<void> {
    this.state.isEditMode = !this.state.isEditMode;
    this.state.currentEditItem = this.state.postsList.find((post) => post.id === postId) || null;

    if (!this.state.isEditMode) return;

    this.fillFormWithPostData();
    this.updateButtonTextContent(this.state.elements.postFormSubmitButton, 'Update');
    this.addCancelButton();
  }

  /**
   * Заполняет форму данными текущего редактируемого поста.
   * @
   * @returns {void}
   */
  fillFormWithPostData(): void {
    const form = this.state.elements.postForm;
    const title = form.elements.namedItem('title') as HTMLInputElement;
    const body = form.elements.namedItem('body') as HTMLTextAreaElement;

    if (this.state.currentEditItem) {
      title.value = this.state.currentEditItem.title;
      body.value = this.state.currentEditItem.body;
      title.focus();
    }
  }

  /**
   * Добавляет кнопку отмены в форму редактирования.
   * @
   * @returns {void}
   */
  addCancelButton(): void {
    const cancelButton = this.createCancelButton();
    this.state.elements.postForm.appendChild(cancelButton);
    cancelButton.addEventListener('click', this.handleCancelEdit.bind(this));
  }

  /**
   * Создает кнопку отмены редактирования.
   * @
   * @returns {HTMLButtonElement} Созданная кнопка отмены
   */
  createCancelButton(): HTMLButtonElement {
    const button = document.createElement('button');
    this.updateButtonTextContent(button, 'Cancel update');
    button.className = 'cancel px-3 py-2 bg-red-500 text-white hover:bg-red-400';
    button.setAttribute('type', 'button');
    button.setAttribute('data-cancel-button', '');
    return button;
  }

  /**
   * Обрабатывает отмену редактирования поста.
   * Сбрасывает форму, удаляет кнопку отмены и выходит из режима редактирования.
   * @
   * @returns {void}
   */
  handleCancelEdit(): void {
    this.state.elements.postForm.reset();
    this.state.elements.postForm.querySelector('[data-cancel-button]')?.remove();
    this.updateButtonTextContent(this.state.elements.postFormSubmitButton, 'Submit');
    this.state.isEditMode = false;
    this.state.currentEditItem = null;
  }

  /**
   * Обновляет текстовое содержимое кнопки.
   * @
   * @param {HTMLButtonElement} element - Кнопка для обновления
   * @param {string} text - Новый текст кнопки
   * @returns {void}
   */
  updateButtonTextContent(element: HTMLButtonElement, text: string): void {
    element.textContent = text;
  }

}

new Twitty();
