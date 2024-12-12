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
 * Класс Twitty представляет основной функционал приложения для управления постами.
 */
class Twitty {
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
      elements: {},
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
  initDOMElements() {
    this.state.elements = {
      postForm: document.querySelector(this.config.selectors.postForm),
      postFormSubmitButton: document.querySelector(`${this.config.selectors.postForm} button[type="submit"]`),
      postList: document.querySelector(this.config.selectors.postList),
      loadingIndicator: document.querySelector(this.config.selectors.loadingIndicator),
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
      this.state.elements.postForm.addEventListener('submit', this.handlePostFormSubmit.bind(this));
      this.state.elements.postList.addEventListener('click', this.handlePostListClick.bind(this));
    })();
  }


  /**
   * Загружает посты с сервера
   */
  async fetchPosts() {
    this.showLoading();
    try {
      const { data } = await axios.get(this.config.API_URL);
      this.state.postsList = data;
      this.renderPosts(this.state.postsList);
    } catch (error) {
      this.state.elements.postList.classList.add('hidden');
      this.utils.handleError('Failed to fetch posts', error);
    } finally {
      this.showLoading(true);
    }
  }

  /**
   * Показывает или скрывает индикатор загрузки
   * @param {boolean} [isLoadingVisible=false] - Флаг видимости индикатора загрузки
   */
  showLoading(isLoadingVisible = false) {
    this.state.elements.loadingIndicator.classList.toggle('hidden', isLoadingVisible);
  }

  /**
   * Отображает посты в DOM
   * @param {Array} postsList - Список постов для отображения
   */
  renderPosts(postsList) {
    this.state.elements.postList.innerHTML = '';
    this.state.elements.postList.classList.remove('hidden');

    const postItems = postsList.map(({ title, body, id }) =>
      this.createPostItem(title, body, id),
    );
    this.state.elements.postList.append(...postItems);
  }

  /**
   * Создает элемент поста
   * @param {string} title - Заголовок поста
   * @param {string} body - Содержание поста
   * @param {string} id - Идентификатор поста
   * @returns {HTMLElement} Элемент поста
   */
  createPostItem(title, body, id) {
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
   * Создает кнопку действия
   * @param {string} action - Действие (edit или delete)
   * @param {string} id - Идентификатор поста
   * @param {string} color - Цвет кнопки
   * @returns {string} HTML-разметка кнопки
   */
  createButton(action, id, color) {
    return `<button data-${action}='${id}'>${icons[action === 'edit' ? 'edit' : 'x'].toSvg({ color })}</button>`;
  }

  /**
   * Обрабатывает отправку формы поста
   * @param {Event} event - Событие отправки формы
   */
  async handlePostFormSubmit(event) {
    event.preventDefault();
    const { title, body } = Object.fromEntries(new FormData(event.target));

    if (!title?.trim() || !body?.trim()) {
      this.utils.showToast('Please fill the fields');
      return;
    }

    try {
      if (this.state.isEditMode) {
        await this.updatePost(this.state.currentEditItem.id, { title, body });
      } else {
        await this.createPost({ title, body });
      }
      event.target.reset();
    } catch (error) {
      this.utils.handleError('Failed to create or update post', error);
    }
  }

  /**
   * Создает новый пост
   * @param {Object} postData - Данные нового поста
   */
  async createPost(postData) {
    await axios.post(this.config.API_URL, postData);
    await this.fetchPosts();
    this.utils.showToast('Post successfully created');
  }

  /**
   * Обновляет существующий пост
   * @param {string} id - Идентификатор поста
   * @param {Object} postData - Новые данные поста
   */
  async updatePost(id, postData) {
    await axios.put(`${this.config.API_URL}/${id}`, postData);
    this.updatePostsList(id, postData);
    this.exitEditMode();
    this.utils.showToast('Post successfully updated');
  }

  /**
   * Обновляет список постов после редактирования
   * @param {string} id - Идентификатор обновленного поста
   * @param {Object} postData - Новые данные поста
   */
  updatePostsList(id, { title, body }) {
    this.state.postsList = this.state.postsList.map((post) =>
      post.id === id ? { ...post, title, body } : post,
    );
    this.renderPosts(this.state.postsList);
  }

  /**
   * Выходит из режима редактирования
   */
  exitEditMode() {
    this.state.isEditMode = false;
    this.state.currentEditItem = null;
    this.state.elements.postForm.querySelector(this.config.selectors.cancelButton)?.remove();
    this.updateButtonTextContent(this.state.elements.postFormSubmitButton, 'Submit');
  }

  /**
   * Обрабатывает клики по списку постов
   * @param {Event} event - Событие клика
   */
  async handlePostListClick({ target }) {
    if (
      target.matches('[data-delete]') &&
      confirm('Are you sure you want to delete this post?')
    ) {
      await this.handlePostDelete(target.dataset.delete);
    }

    if (target.matches('[data-edit]')) {
      await this.handlePostEdit(target.dataset.edit);
    }
  }

  /**
   * Удаляет пост
   * @param {string} postId - Идентификатор удаляемого поста
   */
  async handlePostDelete(postId) {
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
   * Обрабатывает редактирование поста
   * @param {string} postId - Идентификатор редактируемого поста
   */
  async handlePostEdit(postId) {
    this.state.isEditMode = !this.state.isEditMode;
    this.state.currentEditItem = this.state.postsList.find((post) => post.id === postId);

    if (!this.state.isEditMode) return;

    this.fillFormWithPostData();
    this.updateButtonTextContent(this.state.elements.postFormSubmitButton, 'Update');
    this.addCancelButton();
  }

  /**
   * Заполняет форму данными редактируемого поста
   */
  fillFormWithPostData() {
    const { title, body } = this.state.elements.postForm.elements;
    [title.value, body.value] = [this.state.currentEditItem.title, this.state.currentEditItem.body];
    title.focus();
  }

  /**
   * Добавляет кнопку отмены в форму
   */
  addCancelButton() {
    const cancelButton = this.createCancelButton();
    this.state.elements.postForm.appendChild(cancelButton);
    cancelButton.addEventListener('click', this.handleCancelEdit.bind(this));
  }

  /**
   * Создает кнопку отмены
   * @returns {HTMLButtonElement} Кнопка отмены
   */
  createCancelButton() {
    const button = document.createElement('button');
    this.updateButtonTextContent(button, 'Cancel update');
    button.className = 'cancel px-3 py-2 bg-red-500 text-white hover:bg-red-400';
    button.setAttribute('type', 'button');
    button.setAttribute('data-cancel-button', '');
    return button;
  }

  /**
   * Обрабатывает отмену редактирования
   */
  handleCancelEdit() {
    this.state.elements.postForm.reset();
    this.state.elements.postForm.querySelector('[data-cancel-button]').remove();
    this.updateButtonTextContent(this.state.elements.postFormSubmitButton, 'Submit');
    this.state.isEditMode = false;
    this.state.currentEditItem = null;
  }

  /**
   * Обновляет текст кнопки
   * @param {HTMLElement} element - Элемент кнопки
   * @param {string} text - Новый текст кнопки
   */
  updateButtonTextContent(element, text) {
    element.textContent = text;
  }
}

new Twitty();
