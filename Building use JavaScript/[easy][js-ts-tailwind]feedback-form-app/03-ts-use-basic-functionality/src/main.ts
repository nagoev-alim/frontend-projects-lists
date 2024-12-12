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

/**
 * Конфигурация приложения.
 */
const APP_CONFIG: AppConfig = {
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
 * Состояние приложения.
 */
const APP_STATE: AppState = {
  elements: {},
  reviewsList: [],
  isEditMode: false,
  reviewToEdit: null,
};

/**
 * Утилиты приложения.
 */
const APP_UTILS: AppUtils = {
  renderDataAttributes: (element) => element.slice(1, -1),
  toastConfig: {
    className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
    duration: 3000,
    gravity: 'bottom',
    position: 'center',
  },

  /**
   * Отображает уведомление с заданным сообщением.
   * @param {string} message - Сообщение для отображения.
   */
  showToast: (message) => {
    Toastify({
      text: message,
      ...APP_UTILS.toastConfig,
    }).showToast();
  },

  /**
   * Обрабатывает ошибку, отображая уведомление и логируя ошибку в консоль.
   * @param {string} message - Сообщение об ошибке.
   * @param {unknown} [error] - Объект ошибки (необязательный).
   */
  handleError: (message, error = null) => {
    APP_UTILS.showToast(message);
    if (error) console.error(message, error);
  },
};

/**
 * Создает HTML-структуру приложения.
 */
function createAppHTML(): void {
  const {
    root,
    selectors: {
      form,
      reviewCount,
      averageRating,
      loader,
      reviewsList,
    },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
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
 * Инициализирует DOM-элементы приложения.
 * Находит и сохраняет ссылки на ключевые элементы интерфейса в объекте APP_STATE.elements.
 */
function initDOMElements(): void {
  APP_STATE.elements = {
    form: document.querySelector<HTMLFormElement>(APP_CONFIG.selectors.form),
    formSubmitButton: document.querySelector<HTMLButtonElement>(
      `${APP_CONFIG.selectors.form} button[type="submit"]`,
    ),
    reviewCount: document.querySelector<HTMLParagraphElement>(APP_CONFIG.selectors.reviewCount),
    averageRating: document.querySelector<HTMLParagraphElement>(APP_CONFIG.selectors.averageRating),
    loader: document.querySelector<HTMLDivElement>(APP_CONFIG.selectors.loader),
    reviewsList: document.querySelector<HTMLUListElement>(APP_CONFIG.selectors.reviewsList),
  };
}

/**
 * Инициализирует приложение.
 * Создает HTML-структуру, инициализирует DOM-элементы и устанавливает обработчики событий.
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();
  (async () => {
    await fetchReviews();
    APP_STATE.elements.form?.addEventListener('submit', handleFormSubmit);
    APP_STATE.elements.reviewsList?.addEventListener('click', handleReviewListClick);
  })();
}

/**
 * Асинхронно получает отзывы с сервера.
 * Обновляет список отзывов в состоянии приложения и отображает их.
 * @throws {Error} Если произошла ошибка при получении данных.
 */
async function fetchReviews(): Promise<void> {
  try {
    showLoading();
    const { data } = await axios.get<Review[]>(APP_CONFIG.API_URL);
    APP_STATE.reviewsList = data;
    renderReviews(APP_STATE.reviewsList);
  } catch (error) {
    APP_UTILS.handleError('Failed to fetch data', error);
  } finally {
    showLoading(true);
  }
}

/**
 * Управляет отображением индикатора загрузки.
 * @param {boolean} isLoadingVisible - Флаг, указывающий, должен ли быть виден индикатор загрузки.
 */
function showLoading(isLoadingVisible = false): void {
  APP_STATE.elements.loader?.classList.toggle('hidden', isLoadingVisible);
}

/**
 * Отображает список отзывов на странице.
 * @param {Review[]} reviewsList - Массив отзывов для отображения.
 */
function renderReviews(reviewsList: Review[]): void {
  if (!APP_STATE.elements.reviewsList) return;

  APP_STATE.elements.reviewsList.innerHTML = '';
  APP_STATE.elements.reviewsList.classList.remove('hidden');

  const reviewsItems = reviewsList.map(({ rating, review, id }) =>
    createReviewItem(rating, review, id),
  );
  APP_STATE.elements.reviewsList.append(...reviewsItems);

  updateReviewStatistics(reviewsList);
}

/**
 * Создает HTML-элемент для отдельного отзыва.
 * @param {string} rating - Рейтинг отзыва.
 * @param {string} review - Текст отзыва.
 * @param {string} id - Уникальный идентификатор отзыва.
 * @returns {HTMLLIElement} HTML-элемент списка, представляющий отзыв.
 */
function createReviewItem(rating: string, review: string, id: string): HTMLLIElement {
  const li = document.createElement('li');
  li.className =
    'grid gap-3 relative bg-white rounded-md border p-3 pt-7 px-8 min-h-[100px]';
  li.innerHTML = `
    <div class='absolute -left-[44.5px] -top-[44.5px] flex h-[55px] w-[55px] items-center justify-center rounded-full bg-neutral-900 text-white font-bold translate-x-1/2 translate-y-1/2'>${rating}</div>
    <p class='break-all'>${review}</p>
    <div class='absolute right-2 top-2 flex gap-2'>
      ${createButton('edit', id, '#41b6e6')}
      ${createButton('delete', id, '#ff585d')}
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
function createButton(action: 'edit' | 'delete', id: string, color: string): string {
  return `<button data-${action}='${id}'>${icons[action === 'edit' ? 'edit' : 'x'].toSvg({ color })}</button>`;
}

/**
 * Обновляет статистику отзывов на странице.
 * @param {Review[]} reviewsList - Список отзывов.
 */
function updateReviewStatistics(reviewsList: Review[]): void {
  const totalReviews = reviewsList.length;
  const average =
    totalReviews === 0
      ? 0
      : reviewsList.reduce((sum, { rating }) => sum + Number(rating), 0) / totalReviews;

  if (APP_STATE.elements.reviewCount) {
    APP_STATE.elements.reviewCount.textContent = `${totalReviews} reviews`;
  }
  if (APP_STATE.elements.averageRating) {
    APP_STATE.elements.averageRating.textContent = `Average Rating: ${average.toFixed(1).replace(/[.,]0$/, '')}`;
  }
}

/**
 * Обрабатывает отправку формы с отзывом.
 * @param {SubmitEvent} event - Событие отправки формы.
 */
async function handleFormSubmit(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  const formData = new FormData(form);
  const review = formData.get('review') as string;
  const rating = formData.get('rating') as string;

  if (!review?.trim() || !rating?.trim()) {
    APP_UTILS.showToast('Please fill the fields');
    return;
  }

  try {
    if (APP_STATE.isEditMode && APP_STATE.reviewToEdit) {
      await updateReview(APP_STATE.reviewToEdit.id, { rating, review });
    } else {
      await createReview({ rating, review });
    }
    form.reset();
  } catch (error) {
    APP_UTILS.handleError('Failed to create or update feedback', error);
  }
}

/**
 * Обновляет существующий отзыв.
 * @param {string} id - Идентификатор отзыва.
 * @param {Partial<Review>} reviewData - Данные для обновления отзыва.
 */
async function updateReview(id: string, reviewData: Partial<Review>): Promise<void> {
  await axios.put(`${APP_CONFIG.API_URL}/${id}`, reviewData);
  updateReviewsList(id, reviewData as Review);
  exitEditMode();
  APP_UTILS.showToast('Review successfully updated');
}

/**
 * Обновляет список отзывов после редактирования.
 * @param {string} id - Идентификатор обновленного отзыва.
 * @param {Review} updatedReview - Обновленные данные отзыва.
 */
function updateReviewsList(id: string, { rating, review }: Review): void {
  APP_STATE.reviewsList = APP_STATE.reviewsList.map((reviewItem) =>
    reviewItem.id === id ? { ...reviewItem, rating, review } : reviewItem,
  );
  renderReviews(APP_STATE.reviewsList);
}

/**
 * Выходит из режима редактирования отзыва.
 */
function exitEditMode(): void {
  APP_STATE.isEditMode = false;
  APP_STATE.reviewToEdit = null;
  APP_STATE.elements.form?.querySelector<HTMLButtonElement>(APP_CONFIG.selectors.cancelButton)?.remove();
  if (APP_STATE.elements.formSubmitButton) {
    updateButtonTextContent(APP_STATE.elements.formSubmitButton, 'Submit');
  }
}

/**
 * Создает новый отзыв.
 * @param {Partial<Review>} reviewData - Данные нового отзыва.
 */
async function createReview(reviewData: Partial<Review>): Promise<void> {
  await axios.post(APP_CONFIG.API_URL, reviewData);
  await fetchReviews();
  APP_UTILS.showToast('Review successfully created');
}

/**
 * Обрабатывает клики по списку отзывов.
 * @param {MouseEvent} event - Событие клика мыши.
 * @returns {Promise<void>}
 */
async function handleReviewListClick(event: MouseEvent): Promise<void> {
  const target = event.target as HTMLElement;

  if (target.matches('[data-delete]') && confirm('Are you sure you want to delete this review?')) {
    const reviewId = target.getAttribute('data-delete');
    if (reviewId) await handleReviewDelete(reviewId);
  }

  if (target.matches('[data-edit]')) {
    const reviewId = target.getAttribute('data-edit');
    if (reviewId) await handleReviewEdit(reviewId);
  }
}

/**
 * Удаляет отзыв по его идентификатору.
 * @param {string} reviewId - Идентификатор удаляемого отзыва.
 * @returns {Promise<void>}
 */
async function handleReviewDelete(reviewId: string): Promise<void> {
  try {
    await axios.delete(`${APP_CONFIG.API_URL}/${reviewId}`);
    APP_STATE.reviewsList = APP_STATE.reviewsList.filter(
      (reviewItem) => reviewItem.id !== reviewId,
    );
    renderReviews(APP_STATE.reviewsList);
    APP_UTILS.showToast('Review successfully deleted');
  } catch (error) {
    APP_UTILS.handleError('Failed to delete review', error);
  }
}

/**
 * Обрабатывает редактирование отзыва.
 * @param {string} reviewId - Идентификатор редактируемого отзыва.
 * @returns {Promise<void>}
 */
async function handleReviewEdit(reviewId: string): Promise<void> {
  APP_STATE.isEditMode = !APP_STATE.isEditMode;
  APP_STATE.reviewToEdit = APP_STATE.reviewsList.find((reviewItem) => reviewItem.id === reviewId) || null;

  if (!APP_STATE.isEditMode) return;

  fillFormWithReviewData();
  if (APP_STATE.elements.formSubmitButton) {
    updateButtonTextContent(APP_STATE.elements.formSubmitButton, 'Update');
  }
  addCancelButton();
}

/**
 * Заполняет форму данными редактируемого отзыва.
 */
function fillFormWithReviewData(): void {
  if (!APP_STATE.elements.form || !APP_STATE.reviewToEdit) return;

  const formElements = APP_STATE.elements.form.elements as HTMLFormControlsCollection;
  const rating = formElements.namedItem('rating') as HTMLInputElement;
  const review = formElements.namedItem('review') as HTMLInputElement;

  if (rating && review) {
    rating.value = APP_STATE.reviewToEdit.rating;
    review.value = APP_STATE.reviewToEdit.review;
    review.focus();
  }
}

/**
 * Добавляет кнопку отмены редактирования в форму.
 */
function addCancelButton(): void {
  const cancelButton = createCancelButton();
  APP_STATE.elements.form?.appendChild(cancelButton);
  cancelButton.addEventListener('click', handleCancelEdit);
}

/**
 * Создает кнопку отмены редактирования.
 * @returns {HTMLButtonElement} Созданная кнопка отмены.
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
 * Обрабатывает отмену редактирования отзыва.
 */
function handleCancelEdit(): void {
  APP_STATE.elements.form?.reset();
  APP_STATE.elements.form?.querySelector('[data-cancel-button]')?.remove();
  if (APP_STATE.elements.formSubmitButton) {
    updateButtonTextContent(APP_STATE.elements.formSubmitButton, 'Submit');
  }
  APP_STATE.isEditMode = false;
  APP_STATE.reviewToEdit = null;
}

/**
 * Обновляет текстовое содержимое кнопки.
 * @param {HTMLElement} element - Элемент кнопки.
 * @param {string} text - Новый текст для кнопки.
 */
function updateButtonTextContent(element: HTMLElement, text: string): void {
  element.textContent = text;
}

initApp();
