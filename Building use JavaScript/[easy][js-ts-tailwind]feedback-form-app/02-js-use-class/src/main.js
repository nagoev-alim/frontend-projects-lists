/**
 * @fileoverview Приложение для управления отзывами пользователей.
 * Позволяет создавать, редактировать, удалять и просматривать отзывы.
 * Использует API для хранения данных и Toastify для уведомлений.
 */

import './style.css';
import { icons } from 'feather-icons';
import axios from 'axios';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

/**
 * @class FeedbackForm
 * @description Класс для управления формой обратной связи и отзывами
 */
class FeedbackForm {
  /**
   * Создает экземпляр FeedbackForm
   * @constructor
   */
  constructor() {
    /**
     * @property {Object} config - Конфигурация приложения
     * @property {string} config.root - Селектор корневого элемента
     * @property {Object} config.selectors - Селекторы DOM-элементов
     * @property {string} config.API_URL - URL API для работы с отзывами
     */
    this.config = {
      root: '#app',
      selectors: {
        form: '[data-feedback-form]',
        reviewCount: '[data-review-count]',
        averageRating: '[data-average-rating]',
        loader: '[data-feedback-loader]',
        reviewsList: '[data-reviews-list]',
        cancelButton: '[data-cancel-button]',
      },
      API_URL: 'https://63c83f46e52516043f4ee625.mockapi.io/reviews',
    };

    /**
     * @property {Object} state - Состояние приложения
     * @property {Object} state.elements - DOM-элементы
     * @property {Array} state.reviewsList - Список отзывов
     * @property {boolean} state.isEditMode - Флаг режима редактирования
     * @property {Object|null} state.reviewToEdit - Отзыв для редактирования
     */
    this.state = {
      elements: {},
      reviewsList: [],
      isEditMode: false,
      reviewToEdit: null,
    };

    /**
     * @property {Object} utils - Вспомогательные утилиты
     */
    this.utils = {
      /**
       * Обрабатывает data-атрибуты для использования в селекторах
       * @param {string} element - Строка с data-атрибутом
       * @returns {string} Обработанная строка
       */
      renderDataAttributes: (element) => element.slice(1, -1),

      /**
       * @property {Object} toastConfig - Конфигурация для Toastify
       */
      toastConfig: {
        className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
        duration: 3000,
        gravity: 'bottom',
        position: 'center',
      },

      /**
       * Показывает уведомление
       * @param {string} message - Текст уведомления
       */
      showToast: (message) => {
        Toastify({
          text: message,
          ...this.utils.toastConfig,
        }).showToast();
      },

      /**
       * Обрабатывает ошибку
       * @param {string} message - Сообщение об ошибке
       * @param {Error} [error] - Объект ошибки
       */
      handleError: (message, error = null) => {
        this.utils.showToast(message);
        if (error) console.error(message, error);
      },
    };

    this.init();
  }

  /**
   * Создает HTML-разметку приложения
   */
  createAppHTML() {
    const {
      root,
      selectors: {
        form,
        reviewCount,
        averageRating,
        loader,
        reviewsList,
      },
    } = this.config;
    const { renderDataAttributes } = this.utils;
    const rootElement = document.querySelector(root);

    if (!rootElement) return;

    rootElement.innerHTML = `
    <div class='grid gap-4'>
      <header class='bg-white flex justify-center p-2 shadow sm:p-4'>
        <h1 class='text-2xl font-bold'>Feedback UI</h1>
      </header>
      <main class='mx-auto grid w-full max-w-3xl gap-7 p-3'>
        <form class='grid gap-4 rounded-md border bg-white p-5' ${renderDataAttributes(form)}>
          <h3 class='text-center text-lg font-medium'>How would you rate your service with us?</h3>
          <ul class='flex flex-wrap items-center justify-center gap-2'>
            ${Array.from({ length: 10 })
      .map((n, i) => i + 1)
      .map(
        (number) => `
              <li>
                <label>
                  <input class='visually-hidden' type='radio' name='rating' value='${number}'>
                  <span class='flex h-[55px] w-[55px] cursor-pointer items-center justify-center rounded-full bg-gray-300 text-lg font-bold transition-colors hover:bg-neutral-900 hover:text-white'>${number}</span>
                </label>
              </li>
            `,
      )
      .join('')}
          </ul>
          <div class='grid grid-cols-[1fr_auto] gap-2'>
            <input class='w-full rounded border bg-slate-50 px-3 py-2 focus:border-blue-400 focus:outline-none' type='text' name='review' placeholder='Write a review'>
            <button class='border px-3 py-2 hover:bg-slate-50' type='submit'>Send</button>
          </div>
        </form>

        <div class='flex flex-wrap justify-between gap-3'>
          <p class='font-medium' ${renderDataAttributes(reviewCount)}>3 reviews</p>
          <p class='font-medium' ${renderDataAttributes(averageRating)}>Average Rating: 9.3</p>
        </div>

        <div class='loader' ${renderDataAttributes(loader)}>
                 <div class='dot-wave'>
            ${Array.from({ length: 4 })
      .map(() => `<div class='dot-wave__dot'></div>`)
      .join('')}
          </div>
        </div>

        <ul class='hidden grid gap-3' ${renderDataAttributes(reviewsList)}></ul>
      </main>
    </div>
  `;
  }

  /**
   * Инициализирует DOM-элементы
   */
  initDOMElements() {
    this.state.elements = {
      form: document.querySelector(this.config.selectors.form),
      formSubmitButton: document.querySelector(
        `${this.config.selectors.form} button[type="submit"]`,
      ),
      reviewCount: document.querySelector(this.config.selectors.reviewCount),
      averageRating: document.querySelector(this.config.selectors.averageRating),
      loader: document.querySelector(this.config.selectors.loader),
      reviewsList: document.querySelector(this.config.selectors.reviewsList),
    };
  }

  /**
   * Инициализирует приложение
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();
    (async () => {
      await this.fetchReviews();
      this.state.elements.form.addEventListener('submit', this.handleFormSubmit.bind(this));
      this.state.elements.reviewsList.addEventListener('click', this.handleReviewListClick.bind(this));
    })();
  }

  /**
   * Загружает отзывы с сервера
   */
  async fetchReviews() {
    try {
      this.showLoading();
      const { data } = await axios.get(this.config.API_URL);
      this.state.reviewsList = data;
      this.renderReviews(this.state.reviewsList);
    } catch (error) {
      this.utils.handleError('Failed to fetch data', error);
    } finally {
      this.showLoading(true);
    }
  }

  /**
   * Показывает или скрывает индикатор загрузки
   * @param {boolean} [isLoadingVisible=false] - Флаг видимости загрузки
   */
  showLoading(isLoadingVisible = false) {
    this.state.elements.loader.classList.toggle('hidden', isLoadingVisible);
  }

  /**
   * Отображает список отзывов
   * @param {Array} reviewsList - Список отзывов
   */
  renderReviews(reviewsList) {
    this.state.elements.reviewsList.innerHTML = '';
    this.state.elements.reviewsList.classList.remove('hidden');

    const reviewsItems = reviewsList.map(({ rating, review, id }) =>
      this.createReviewItem(rating, review, id),
    );
    this.state.elements.reviewsList.append(...reviewsItems);

    this.updateReviewStatistics(reviewsList);
  }

  /**
   * Создает элемент отзыва
   * @param {number} rating - Рейтинг
   * @param {string} review - Текст отзыва
   * @param {string} id - Идентификатор отзыва
   * @returns {HTMLLIElement} Элемент отзыва
   */
  createReviewItem(rating, review, id) {
    const li = document.createElement('li');
    li.className =
      'grid gap-3 relative bg-white rounded-md border p-3 pt-7 px-8 min-h-[100px]';
    li.innerHTML = `
    <div class='absolute -left-[44.5px] -top-[44.5px] flex h-[55px] w-[55px] items-center justify-center rounded-full bg-neutral-900 text-white font-bold translate-x-1/2 translate-y-1/2'>${rating}</div>
    <p class='break-all'>${review}</p>
    <div class='absolute right-2 top-2 flex gap-2'>
      ${this.createButton('edit', id, '#41b6e6')}
      ${this.createButton('delete', id, '#ff585d')}
    </div>`;
    return li;
  }

  /**
   * Создает кнопку для отзыва
   * @param {string} action - Действие (edit или delete)
   * @param {string} id - Идентификатор отзыва
   * @param {string} color - Цвет кнопки
   * @returns {string} HTML-разметка кнопки
   */
  createButton(action, id, color) {
    return `<button data-${action}='${id}'>${icons[action === 'edit' ? 'edit' : 'x'].toSvg({ color })}</button>`;
  }

  /**
   * Обновляет статистику отзывов
   * @param {Array} reviewsList - Список отзывов
   */
  updateReviewStatistics(reviewsList) {
    const totalReviews = reviewsList.length;
    const average =
      totalReviews === 0
        ? 0
        : reviewsList.reduce((sum, { rating }) => sum + Number(rating), 0) /
        totalReviews;

    this.state.elements.reviewCount.textContent = `${totalReviews} reviews`;
    this.state.elements.averageRating.textContent = `Average Rating: ${average.toFixed(1).replace(/[.,]0$/, '')}`;
  }

  /**
   * Обрабатывает отправку формы
   * @param {Event} event - Событие отправки формы
   */
  async handleFormSubmit(event) {
    event.preventDefault();
    const { review, rating } = Object.fromEntries(new FormData(event.target));

    if (!review?.trim() || !rating?.trim()) {
      this.utils.showToast('Please fill the fields');
      return;
    }

    try {
      if (this.state.isEditMode) {
        await this.updateReview(this.state.reviewToEdit.id, { rating, review });
      } else {
        await this.createReview({ rating, review });
      }
      event.target.reset();
    } catch (error) {
      this.utils.handleError('Failed to create or update feedback', error);
    }
  }

  /**
   * Обновляет отзыв
   * @param {string} id - Идентификатор отзыва
   * @param {Object} reviewData - Данные отзыва
   */
  async updateReview(id, reviewData) {
    await axios.put(`${this.config.API_URL}/${id}`, reviewData);
    this.updateReviewsList(id, reviewData);
    this.exitEditMode();
    this.utils.showToast('Review successfully updated');
  }

  /**
   * Обновляет список отзывов
   * @param {string} id - Идентификатор отзыва
   * @param {Object} reviewData - Данные отзыва
   */
  updateReviewsList(id, { rating, review }) {
    this.state.reviewsList = this.state.reviewsList.map((reviewItem) =>
      reviewItem.id === id ? { ...reviewItem, rating, review } : reviewItem,
    );
    this.renderReviews(this.state.reviewsList);
  }

  /**
   * Выходит из режима редактирования
   */
  exitEditMode() {
    this.state.isEditMode = !this.state.isEditMode;
    this.state.reviewToEdit = null;
    this.state.elements.form.querySelector(this.config.selectors.cancelButton)?.remove();
    this.updateButtonTextContent(this.state.elements.formSubmitButton, 'Submit');
  }

  /**
   * Создает новый отзыв
   * @param {Object} reviewData - Данные отзыва
   */
  async createReview(reviewData) {
    await axios.post(this.config.API_URL, reviewData);
    await this.fetchReviews();
    this.utils.showToast('Review successfully created');
  }

  /**
   * Обрабатывает клик по списку отзывов
   * @param {Event} event - Событие клика
   */
  async handleReviewListClick({ target }) {
    if (
      target.matches('[data-delete]') &&
      confirm('Are you sure you want to delete this review?')
    ) {
      await this.handleReviewDelete(target.dataset.delete);
    }

    if (target.matches('[data-edit]')) {
      await this.handleReviewEdit(target.dataset.edit);
    }
  }

  /**
   * Обрабатывает удаление отзыва
   * @param {string} reviewId - Идентификатор отзыва
   */
  async handleReviewDelete(reviewId) {
    try {
      await axios.delete(`${this.config.API_URL}/${reviewId}`);
      this.state.reviewsList = this.state.reviewsList.filter(
        (reviewItem) => reviewItem.id !== reviewId,
      );
      this.renderReviews(this.state.reviewsList);
      this.utils.showToast('Review successfully deleted');
    } catch (error) {
      this.utils.handleError('Failed to delete review', error);
    }
  }

  /**
   * Обрабатывает редактирование отзыва
   * @param {string} reviewId - Идентификатор редактируемого отзыва
   * @description Переключает режим редактирования, находит отзыв по ID и заполняет форму данными отзыва
   */
  async handleReviewEdit(reviewId) {
    this.state.isEditMode = !this.state.isEditMode;
    this.state.reviewToEdit = this.state.reviewsList.find((reviewItem) => reviewItem.id === reviewId);

    if (!this.state.isEditMode) return;

    this.fillFormWithReviewData();
    this.updateButtonTextContent(this.state.elements.formSubmitButton, 'Update');
    this.addCancelButton();
  }

  /**
   * Заполняет форму данными редактируемого отзыва
   * @description Устанавливает значения полей формы в соответствии с данными редактируемого отзыва
   */
  fillFormWithReviewData() {
    const { rating, review } = this.state.elements.form.elements;
    [rating.value, review.value] = [this.state.reviewToEdit.rating, this.state.reviewToEdit.review];
    review.focus();
  }

  /**
   * Добавляет кнопку отмены в форму
   * @description Создает кнопку отмены, добавляет ее в форму и назначает обработчик события
   */
  addCancelButton() {
    const cancelButton = this.createCancelButton();
    this.state.elements.form.appendChild(cancelButton);
    cancelButton.addEventListener('click', this.handleCancelEdit.bind(this));
  }

  /**
   * Создает кнопку отмены
   * @returns {HTMLButtonElement} Новая кнопка отмены
   * @description Создает и настраивает кнопку отмены редактирования
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
   * @description Сбрасывает форму, удаляет кнопку отмены и возвращает приложение в исходное состояние
   */
  handleCancelEdit() {
    this.state.elements.form.reset();
    this.state.elements.form.querySelector('[data-cancel-button]').remove();
    this.updateButtonTextContent(this.state.elements.formSubmitButton, 'Submit');
    this.state.isEditMode = false;
    this.state.reviewToEdit = null;
  }

  /**
   * Обновляет текстовое содержимое кнопки
   * @param {HTMLElement} element - Элемент кнопки для обновления
   * @param {string} text - Новый текст кнопки
   * @description Устанавливает новый текст для указанного элемента кнопки
   */
  updateButtonTextContent(element, text) {
    element.textContent = text;
  }
}

new FeedbackForm();
