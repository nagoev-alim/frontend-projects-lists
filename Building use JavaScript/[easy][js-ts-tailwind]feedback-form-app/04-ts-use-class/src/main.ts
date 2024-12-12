/**
 * @fileoverview Модуль для управления отзывами пользователей.
 *
 * Этот модуль предоставляет функциональность для создания, редактирования, удаления и отображения
 * отзывов пользователей. Он включает в себя интерфейс пользователя с формой для отправки отзывов,
 * списком существующих отзывов и статистикой (общее количество отзывов и средний рейтинг).
 */

/**
 * @fileoverview Модуль для управления отзывами пользователей.
 *
 * Этот модуль предоставляет функциональность для создания, редактирования, удаления и отображения
 * отзывов пользователей. Он включает в себя интерфейс пользователя с формой для отправки отзывов,
 * списком существующих отзывов и статистикой (общее количество отзывов и средний рейтинг).
 */

import './style.css';
import { icons } from 'feather-icons';
import axios from 'axios';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

/**
 * Интерфейс для конфигурации приложения.
 */
interface AppConfig {
  /** Корневой элемент приложения */
  root: string;
  /** Селекторы для различных элементов DOM */
  selectors: {
    [key: string]: string;
  };
  /** URL API для работы с отзывами */
  API_URL: string;
}

/**
 * Интерфейс для состояния приложения.
 */
interface AppState {
  /** Ссылки на элементы DOM */
  elements: {
    [key: string]: HTMLElement | null;
  };
  /** Список отзывов */
  reviewsList: Review[];
  /** Флаг режима редактирования */
  isEditMode: boolean;
  /** Отзыв, который в данный момент редактируется */
  reviewToEdit: Review | null;
}

/**
 * Интерфейс для отзыва.
 */
interface Review {
  /** Уникальный идентификатор отзыва */
  id: string;
  /** Рейтинг */
  rating: string;
  /** Текст отзыва */
  review: string;
}

/**
 * Интерфейс для утилит приложения.
 */
interface AppUtils {
  /** Функция для рендеринга data-атрибутов */
  renderDataAttributes: (element: string) => string;
  /** Конфигурация для уведомлений */
  toastConfig: Toastify.Options;
  /** Функция для отображения уведомления */
  showToast: (message: string) => void;
  /** Функция для обработки ошибок */
  handleError: (message: string, error?: unknown) => void;
}

class FeedbackForm {
  private readonly config: AppConfig;
  private readonly state: AppState;
  private readonly utils: AppUtils;

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
  private createAppHTML(): void {
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
    const rootElement = document.querySelector<HTMLElement>(root);

    if (!rootElement) return;

    rootElement.innerHTML = `
    <div class='grid gap-4'>
      <header class='mx-auto grid w-full max-w-3xl gap-7 p-3 text-center'>
        <h1 class='text-2xl font-bold'>Feedback UI</h1>
      </header>
      <main class='mx-auto grid w-full max-w-3xl gap-7 p-3'>
        <form class='grid gap-4 rounded-md border bg-white p-5' ${renderDataAttributes(form)}>
          <h3 class='text-center text-lg font-medium'>How would you rate your service with us?</h3>
          <ul class='flex flex-wrap items-center justify-center gap-2'>
            ${Array.from({ length: 10 })
      .map((_, i) => i + 1)
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
  private initDOMElements(): void {
    this.state.elements = {
      form: document.querySelector<HTMLFormElement>(this.config.selectors.form),
      formSubmitButton: document.querySelector<HTMLButtonElement>(
        `${this.config.selectors.form} button[type="submit"]`,
      ),
      reviewCount: document.querySelector<HTMLParagraphElement>(this.config.selectors.reviewCount),
      averageRating: document.querySelector<HTMLParagraphElement>(this.config.selectors.averageRating),
      loader: document.querySelector<HTMLDivElement>(this.config.selectors.loader),
      reviewsList: document.querySelector<HTMLUListElement>(this.config.selectors.reviewsList),
    };
  }

  /**
   * Инициализирует приложение
   */
  private init(): void {
    this.createAppHTML();
    this.initDOMElements();
    (async () => {
      await this.fetchReviews();
      this.state.elements.form?.addEventListener('submit', this.handleFormSubmit.bind(this));
      this.state.elements.reviewsList?.addEventListener('click', this.handleReviewListClick.bind(this));
    })();
  }

  /**
   * Асинхронно получает отзывы с сервера.
   * Обновляет список отзывов в состоянии приложения и отображает их.
   * @throws {Error} Если произошла ошибка при получении данных.
   */
  private async fetchReviews(): Promise<void> {
    try {
      this.showLoading();
      const { data } = await axios.get<Review[]>(this.config.API_URL);
      this.state.reviewsList = data;
      this.renderReviews(this.state.reviewsList);
    } catch (error) {
      this.utils.handleError('Failed to fetch data', error);
    } finally {
      this.showLoading(true);
    }
  }

  /**
   * Управляет отображением индикатора загрузки.
   * @param {boolean} isLoadingVisible - Флаг, указывающий, должен ли быть виден индикатор загрузки.
   */
  private showLoading(isLoadingVisible = false): void {
    this.state.elements.loader?.classList.toggle('hidden', isLoadingVisible);
  }

  /**
   * Отображает список отзывов на странице.
   * @param {Review[]} reviewsList - Массив отзывов для отображения.
   */
  private renderReviews(reviewsList: Review[]): void {
    if (!this.state.elements.reviewsList) return;

    this.state.elements.reviewsList.innerHTML = '';
    this.state.elements.reviewsList.classList.remove('hidden');

    const reviewsItems = reviewsList.map(({ rating, review, id }) =>
      this.createReviewItem(rating, review, id),
    );
    this.state.elements.reviewsList.append(...reviewsItems);

    this.updateReviewStatistics(reviewsList);
  }

  /**
   * Создает HTML-элемент для отдельного отзыва.
   * @param {string} rating - Рейтинг отзыва.
   * @param {string} review - Текст отзыва.
   * @param {string} id - Уникальный идентификатор отзыва.
   * @returns {HTMLLIElement} HTML-элемент списка, представляющий отзыв.
   */
  private createReviewItem(rating: string, review: string, id: string): HTMLLIElement {
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
   * Создает HTML-строку кнопки для действий с отзывом.
   * @param {('edit'|'delete')} action - Тип действия (редактирование или удаление).
   * @param {string} id - Идентификатор отзыва.
   * @param {string} color - Цвет иконки кнопки.
   * @returns {string} HTML-строка кнопки.
   */
  private createButton(action: 'edit' | 'delete', id: string, color: string): string {
    return `<button data-${action}='${id}'>${icons[action === 'edit' ? 'edit' : 'x'].toSvg({ color })}</button>`;
  }

  /**
   * Обновляет статистику отзывов на странице.
   * @param {Review[]} reviewsList - Список отзывов.
   */
  private updateReviewStatistics(reviewsList: Review[]): void {
    const totalReviews = reviewsList.length;
    const average =
      totalReviews === 0
        ? 0
        : reviewsList.reduce((sum, { rating }) => sum + Number(rating), 0) / totalReviews;

    if (this.state.elements.reviewCount) {
      this.state.elements.reviewCount.textContent = `${totalReviews} reviews`;
    }
    if (this.state.elements.averageRating) {
      this.state.elements.averageRating.textContent = `Average Rating: ${average.toFixed(1).replace(/[.,]0$/, '')}`;
    }
  }

  /**
   * Обрабатывает отправку формы с отзывом.
   * @param {SubmitEvent} event - Событие отправки формы.
   */
  private async handleFormSubmit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const review = formData.get('review') as string;
    const rating = formData.get('rating') as string;

    if (!review?.trim() || !rating?.trim()) {
      this.utils.showToast('Please fill the fields');
      return;
    }

    try {
      if (this.state.isEditMode && this.state.reviewToEdit) {
        await this.updateReview(this.state.reviewToEdit.id, { rating, review });
      } else {
        await this.createReview({ rating, review });
      }
      form.reset();
    } catch (error) {
      this.utils.handleError('Failed to create or update feedback', error);
    }
  }

  /**
   * Обновляет существующий отзыв.
   * @param {string} id - Идентификатор отзыва.
   * @param {Partial<Review>} reviewData - Данные для обновления отзыва.
   */
  private async updateReview(id: string, reviewData: Partial<Review>): Promise<void> {
    await axios.put(`${this.config.API_URL}/${id}`, reviewData);
    this.updateReviewsList(id, reviewData as Review);
    this.exitEditMode();
    this.utils.showToast('Review successfully updated');
  }

  /**
   * Обновляет список отзывов после редактирования.
   * @param {string} id - Идентификатор обновленного отзыва.
   * @param {Review} updatedReview - Обновленные данные отзыва.
   */
  private updateReviewsList(id: string, { rating, review }: Review): void {
    this.state.reviewsList = this.state.reviewsList.map((reviewItem) =>
      reviewItem.id === id ? { ...reviewItem, rating, review } : reviewItem,
    );
    this.renderReviews(this.state.reviewsList);
  }

  /**
   * Выходит из режима редактирования отзыва.
   */
  private exitEditMode(): void {
    this.state.isEditMode = false;
    this.state.reviewToEdit = null;
    this.state.elements.form?.querySelector<HTMLButtonElement>(this.config.selectors.cancelButton)?.remove();
    if (this.state.elements.formSubmitButton) {
      this.updateButtonTextContent(this.state.elements.formSubmitButton, 'Submit');
    }
  }

  /**
   * Создает новый отзыв.
   * @param {Partial<Review>} reviewData - Данные нового отзыва.
   */
  private async createReview(reviewData: Partial<Review>): Promise<void> {
    await axios.post(this.config.API_URL, reviewData);
    await this.fetchReviews();
    this.utils.showToast('Review successfully created');
  }

  /**
   * Обрабатывает клики по списку отзывов.
   * @param {MouseEvent} event - Событие клика мыши.
   * @returns {Promise<void>}
   */
  private async handleReviewListClick(event: MouseEvent): Promise<void> {
    const target = event.target as HTMLElement;

    if (target.matches('[data-delete]') && confirm('Are you sure you want to delete this review?')) {
      const reviewId = target.getAttribute('data-delete');
      if (reviewId) await this.handleReviewDelete(reviewId);
    }

    if (target.matches('[data-edit]')) {
      const reviewId = target.getAttribute('data-edit');
      if (reviewId) await this.handleReviewEdit(reviewId);
    }
  }

  /**
   * Удаляет отзыв по его идентификатору.
   * @param {string} reviewId - Идентификатор удаляемого отзыва.
   * @returns {Promise<void>}
   */
  private async handleReviewDelete(reviewId: string): Promise<void> {
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
   * Обрабатывает редактирование отзыва.
   * @param {string} reviewId - Идентификатор редактируемого отзыва.
   * @returns {Promise<void>}
   */
  private async handleReviewEdit(reviewId: string): Promise<void> {
    this.state.isEditMode = !this.state.isEditMode;
    this.state.reviewToEdit = this.state.reviewsList.find((reviewItem) => reviewItem.id === reviewId) || null;

    if (!this.state.isEditMode) return;

    this.fillFormWithReviewData();
    if (this.state.elements.formSubmitButton) {
      this.updateButtonTextContent(this.state.elements.formSubmitButton, 'Update');
    }
    this.addCancelButton();
  }

  /**
   * Заполняет форму данными редактируемого отзыва.
   */
  private fillFormWithReviewData(): void {
    if (!this.state.elements.form || !this.state.reviewToEdit) return;

    const formElements = this.state.elements.form.elements as HTMLFormControlsCollection;
    const rating = formElements.namedItem('rating') as HTMLInputElement;
    const review = formElements.namedItem('review') as HTMLInputElement;

    if (rating && review) {
      rating.value = this.state.reviewToEdit.rating;
      review.value = this.state.reviewToEdit.review;
      review.focus();
    }
  }

  /**
   * Добавляет кнопку отмены редактирования в форму.
   */
  private addCancelButton(): void {
    const cancelButton = this.createCancelButton();
    this.state.elements.form?.appendChild(cancelButton);
    cancelButton.addEventListener('click', this.handleCancelEdit);
  }

  /**
   * Создает кнопку отмены редактирования.
   * @returns {HTMLButtonElement} Созданная кнопка отмены.
   */
  private createCancelButton(): HTMLButtonElement {
    const button = document.createElement('button');
    this.updateButtonTextContent(button, 'Cancel update');
    button.className = 'cancel px-3 py-2 bg-red-500 text-white hover:bg-red-400';
    button.setAttribute('type', 'button');
    button.setAttribute('data-cancel-button', '');
    return button;
  }

  /**
   * Обрабатывает отмену редактирования отзыва.
   */
  private handleCancelEdit(): void {
    this.state.elements.form?.reset();
    this.state.elements.form?.querySelector('[data-cancel-button]')?.remove();
    if (this.state.elements.formSubmitButton) {
      this.updateButtonTextContent(this.state.elements.formSubmitButton, 'Submit');
    }
    this.state.isEditMode = false;
    this.state.reviewToEdit = null;
  }

  /**
   * Обновляет текстовое содержимое кнопки.
   * @param {HTMLElement} element - Элемент кнопки.
   * @param {string} text - Новый текст для кнопки.
   */
  private updateButtonTextContent(element: HTMLElement, text: string): void {
    element.textContent = text;
  }
}

new FeedbackForm();
