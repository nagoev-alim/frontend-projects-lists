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
 * Конфигурация приложения
 * @type {Object}
 */
const APP_CONFIG = {
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
 * Состояние приложения
 * @type {Object}
 */
const APP_STATE = {
  elements: {},
  reviewsList: [],
  isEditMode: false,
  reviewToEdit: null,
};

/**
 * Утилиты приложения
 * @type {Object}
 */
const APP_UTILS = {
  renderDataAttributes: (element) => element.slice(1, -1),
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
      ...APP_UTILS.toastConfig,
    }).showToast();
  },
  /**
   * Обрабатывает ошибку
   * @param {string} message - Сообщение об ошибке
   * @param {Error} [error] - Объект ошибки
   */
  handleError: (message, error = null) => {
    APP_UTILS.showToast(message);
    if (error) console.error(message, error);
  },
};

/**
 * Создает HTML-разметку приложения
 */
function createAppHTML() {
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
function initDOMElements() {
  APP_STATE.elements = {
    form: document.querySelector(APP_CONFIG.selectors.form),
    formSubmitButton: document.querySelector(
      `${APP_CONFIG.selectors.form} button[type="submit"]`,
    ),
    reviewCount: document.querySelector(APP_CONFIG.selectors.reviewCount),
    averageRating: document.querySelector(APP_CONFIG.selectors.averageRating),
    loader: document.querySelector(APP_CONFIG.selectors.loader),
    reviewsList: document.querySelector(APP_CONFIG.selectors.reviewsList),
  };
}

/**
 * Инициализирует приложение
 */
function initApp() {
  createAppHTML();
  initDOMElements();
  (async () => {
    await fetchReviews();
    APP_STATE.elements.form.addEventListener('submit', handleFormSubmit);
    APP_STATE.elements.reviewsList.addEventListener('click', handleReviewListClick);
  })();
}

/**
 * Загружает отзывы с сервера
 */
async function fetchReviews() {
  try {
    showLoading();
    const { data } = await axios.get(APP_CONFIG.API_URL);
    APP_STATE.reviewsList = data;
    renderReviews(APP_STATE.reviewsList);
  } catch (error) {
    APP_UTILS.handleError('Failed to fetch data', error);
  } finally {
    showLoading(true);
  }
}

/**
 * Показывает или скрывает индикатор загрузки
 * @param {boolean} [isLoadingVisible=false] - Флаг видимости загрузки
 */
function showLoading(isLoadingVisible = false) {
  APP_STATE.elements.loader.classList.toggle('hidden', isLoadingVisible);
}

/**
 * Отображает список отзывов
 * @param {Array} reviewsList - Список отзывов
 */
function renderReviews(reviewsList) {
  APP_STATE.elements.reviewsList.innerHTML = '';
  APP_STATE.elements.reviewsList.classList.remove('hidden');

  const reviewsItems = reviewsList.map(({ rating, review, id }) =>
    createReviewItem(rating, review, id),
  );
  APP_STATE.elements.reviewsList.append(...reviewsItems);

  updateReviewStatistics(reviewsList);
}

/**
 * Создает элемент отзыва
 * @param {number} rating - Рейтинг
 * @param {string} review - Текст отзыва
 * @param {string} id - Идентификатор отзыва
 * @returns {HTMLLIElement} Элемент отзыва
 */
function createReviewItem(rating, review, id) {
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
 * Создает кнопку для отзыва
 * @param {string} action - Действие (edit или delete)
 * @param {string} id - Идентификатор отзыва
 * @param {string} color - Цвет кнопки
 * @returns {string} HTML-разметка кнопки
 */
function createButton(action, id, color) {
  return `<button data-${action}='${id}'>${icons[action === 'edit' ? 'edit' : 'x'].toSvg({ color })}</button>`;
}

/**
 * Обновляет статистику отзывов
 * @param {Array} reviewsList - Список отзывов
 */
function updateReviewStatistics(reviewsList) {
  const totalReviews = reviewsList.length;
  const average =
    totalReviews === 0
      ? 0
      : reviewsList.reduce((sum, { rating }) => sum + Number(rating), 0) /
      totalReviews;

  APP_STATE.elements.reviewCount.textContent = `${totalReviews} reviews`;
  APP_STATE.elements.averageRating.textContent = `Average Rating: ${average.toFixed(1).replace(/[.,]0$/, '')}`;
}

/**
 * Обрабатывает отправку формы
 * @param {Event} event - Событие отправки формы
 */
async function handleFormSubmit(event) {
  event.preventDefault();
  const { review, rating } = Object.fromEntries(new FormData(event.target));

  if (!review?.trim() || !rating?.trim()) {
    APP_UTILS.showToast('Please fill the fields');
    return;
  }

  try {
    if (APP_STATE.isEditMode) {
      await updateReview(APP_STATE.reviewToEdit.id, { rating, review });
    } else {
      await createReview({ rating, review });
    }
    event.target.reset();
  } catch (error) {
    APP_UTILS.handleError('Failed to create or update feedback', error);
  }
}

/**
 * Обновляет отзыв
 * @param {string} id - Идентификатор отзыва
 * @param {Object} reviewData - Данные отзыва
 */
async function updateReview(id, reviewData) {
  await axios.put(`${APP_CONFIG.API_URL}/${id}`, reviewData);
  updateReviewsList(id, reviewData);
  exitEditMode();
  APP_UTILS.showToast('Review successfully updated');
}

/**
 * Обновляет список отзывов
 * @param {string} id - Идентификатор отзыва
 * @param {Object} reviewData - Данные отзыва
 */
function updateReviewsList(id, { rating, review }) {
  APP_STATE.reviewsList = APP_STATE.reviewsList.map((reviewItem) =>
    reviewItem.id === id ? { ...reviewItem, rating, review } : reviewItem,
  );
  renderReviews(APP_STATE.reviewsList);
}

/**
 * Выходит из режима редактирования
 */
function exitEditMode() {
  APP_STATE.isEditMode = !APP_STATE.isEditMode;
  APP_STATE.reviewToEdit = null;
  APP_STATE.elements.form.querySelector(APP_CONFIG.selectors.cancelButton)?.remove();
  updateButtonTextContent(APP_STATE.elements.formSubmitButton, 'Submit');
}

/**
 * Создает новый отзыв
 * @param {Object} reviewData - Данные отзыва
 */
async function createReview(reviewData) {
  await axios.post(APP_CONFIG.API_URL, reviewData);
  await fetchReviews();
  APP_UTILS.showToast('Review successfully created');
}

/**
 * Обрабатывает клик по списку отзывов
 * @param {Event} event - Событие клика
 */
async function handleReviewListClick({ target }) {
  if (
    target.matches('[data-delete]') &&
    confirm('Are you sure you want to delete this review?')
  ) {
    await handleReviewDelete(target.dataset.delete);
  }

  if (target.matches('[data-edit]')) {
    await handleReviewEdit(target.dataset.edit);
  }
}

/**
 * Обрабатывает удаление отзыва
 * @param {string} reviewId - Идентификатор отзыва
 */
async function handleReviewDelete(reviewId) {
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
 * Обрабатывает редактирование отзыва
 * @param {string} reviewId - Идентификатор редактируемого отзыва
 * @description Переключает режим редактирования, находит отзыв по ID и заполняет форму данными отзыва
 */
async function handleReviewEdit(reviewId) {
  APP_STATE.isEditMode = !APP_STATE.isEditMode;
  APP_STATE.reviewToEdit = APP_STATE.reviewsList.find((reviewItem) => reviewItem.id === reviewId);

  if (!APP_STATE.isEditMode) return;

  fillFormWithReviewData();
  updateButtonTextContent(APP_STATE.elements.formSubmitButton, 'Update');
  addCancelButton();
}

/**
 * Заполняет форму данными редактируемого отзыва
 * @description Устанавливает значения полей формы в соответствии с данными редактируемого отзыва
 */
function fillFormWithReviewData() {
  const { rating, review } = APP_STATE.elements.form.elements;
  [rating.value, review.value] = [APP_STATE.reviewToEdit.rating, APP_STATE.reviewToEdit.review];
  review.focus();
}

/**
 * Добавляет кнопку отмены в форму
 * @description Создает кнопку отмены, добавляет ее в форму и назначает обработчик события
 */
function addCancelButton() {
  const cancelButton = createCancelButton();
  APP_STATE.elements.form.appendChild(cancelButton);
  cancelButton.addEventListener('click', handleCancelEdit);
}

/**
 * Создает кнопку отмены
 * @returns {HTMLButtonElement} Новая кнопка отмены
 * @description Создает и настраивает кнопку отмены редактирования
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
 * @description Сбрасывает форму, удаляет кнопку отмены и возвращает приложение в исходное состояние
 */
function handleCancelEdit() {
  APP_STATE.elements.form.reset();
  APP_STATE.elements.form.querySelector('[data-cancel-button]').remove();
  updateButtonTextContent(APP_STATE.elements.formSubmitButton, 'Submit');
  APP_STATE.isEditMode = false;
  APP_STATE.reviewToEdit = null;
}

/**
 * Обновляет текстовое содержимое кнопки
 * @param {HTMLElement} element - Элемент кнопки для обновления
 * @param {string} text - Новый текст кнопки
 * @description Устанавливает новый текст для указанного элемента кнопки
 */
function updateButtonTextContent(element, text) {
  element.textContent = text;
}

initApp();
