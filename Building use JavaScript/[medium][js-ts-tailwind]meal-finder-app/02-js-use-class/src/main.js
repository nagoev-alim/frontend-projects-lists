/**
 * Этот код представляет собой приложение для поиска и отображения информации о блюдах.
 * Оно использует API TheMealDB для получения данных о блюдах, позволяет пользователям
 * искать блюда по ключевым словам и просматривать случайные блюда. Приложение также
 * отображает подробную информацию о выбранном блюде, включая ингредиенты и инструкции
 * по приготовлению.
 */

import './style.css';
import feather from 'feather-icons';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';

/**
 * Объект конфигурации приложения
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента приложения
 * @property {Object} selectors - Объект с селекторами элементов DOM
 * @property {string} apiUrl - URL API для получения данных о блюдах
 */
const APP_CONFIG = {
  root: '#app',
  selectors: {
    mealSearchForm: '[data-meal-search-form]',
    randomMeal: '[data-random-meal]',
    mealResults: '[data-meal-results]',
    mealResultsHeading: '[data-meal-results-heading]',
    mealResultsList: '[data-meal-results-list]',
    mealDetails: '[data-meal-details]',
  },
  apiUrl: 'https://www.themealdb.com/api/json/v1/1/',
};

/**
 * Объект состояния приложения
 * @typedef {Object} AppState
 * @property {Object} elements - Объект с ссылками на элементы DOM
 */
const APP_STATE = {
  elements: {
    mealSearchForm: null,
    randomMeal: null,
    mealResults: null,
    mealResultsHeading: null,
    mealResultsList: null,
    mealDetails: null,
  },
};

/**
 * Объект с утилитарными функциями
 * @typedef {Object} AppUtils
 * @property {Function} showToast - Функция для отображения уведомлений
 * @property {Function} handleError - Функция для обработки ошибок
 */
const APP_UTILS = {
  /**
   * Рендерит data-атрибуты
   * @param {string} element - Строка с data-атрибутом
   * @returns {string} Отформатированная строка data-атрибута
   */
  renderDataAttributes: (element) => element.slice(1, -1),
  /**
   * Конфигурация для уведомлений
   * @type {Object}
   */
  toastConfig: {
    className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
    duration: 3000,
    gravity: 'bottom',
    position: 'center',
  },

  /**
   * Отображает уведомление
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
        mealSearchForm,
        randomMeal,
        mealResults,
        mealResultsHeading,
        mealResultsList,
        mealDetails,
      },
    } = APP_CONFIG;
    const { renderDataAttributes } = APP_UTILS;
    const rootElement = document.querySelector(root);

    if (!rootElement) return;

    rootElement.innerHTML = `
    <div class="max-w-4xl w-full gap-4 rounded border bg-white p-3 shadow grid">
      <h1 class="text-center text-2xl font-bold md:text-4xl">Meal Finder</h1>
      <div class="gap-3 grid">
        <form class="gap-3 grid" ${renderDataAttributes(mealSearchForm)}>
          <label>
            <input
              class="w-full rounded border bg-slate-50 px-3 py-2 focus:border-blue-400 focus:outline-none"
              type="text"
              name="search"
              placeholder="Search for meals or keywords (like Beef)"
            />
          </label>
          <button class="border px-3 py-2 hover:bg-slate-50" type="submit">Search</button>
        </form>
        <div class="flex items-center justify-center">
          <button class="rounded border p-2 hover:bg-slate-50" ${renderDataAttributes(randomMeal)}>
            ${icons['refresh-cw'].toSvg()}
          </button>
        </div>
      </div>
      <div class="gap-3 hidden" ${renderDataAttributes(mealResults)}>
        <div ${renderDataAttributes(mealResultsHeading)}></div>
        <ul class="gap-3 grid-cols-2 sm:grid-cols-3 grid" ${renderDataAttributes(mealResultsList)}></ul>
        <div class="gap-3 grid" ${renderDataAttributes(mealDetails)}></div>
      </div>
    </div>
  `;
}

/**
 * Инициализирует ссылки на элементы DOM
 */
function initDOMElements() {
  APP_STATE.elements = {
    mealSearchForm: document.querySelector(APP_CONFIG.selectors.mealSearchForm),
    mealSearchFormButton: document.querySelector(`${APP_CONFIG.selectors.mealSearchForm} button[type="submit"]`),
    randomMeal: document.querySelector(APP_CONFIG.selectors.randomMeal),
    mealResults: document.querySelector(APP_CONFIG.selectors.mealResults),
    mealResultsHeading: document.querySelector(APP_CONFIG.selectors.mealResultsHeading),
    mealResultsList: document.querySelector(APP_CONFIG.selectors.mealResultsList),
    mealDetails: document.querySelector(APP_CONFIG.selectors.mealDetails),
  };
}

/**
 * Инициализирует приложение
 */
function initApp() {
  createAppHTML();
  initDOMElements();
  APP_STATE.elements.mealSearchForm.addEventListener('submit', handleMealSearchFormSubmit);
  APP_STATE.elements.mealResultsList.addEventListener('click', handleMealResultsListClick);
  APP_STATE.elements.randomMeal.addEventListener('click', handleRandomMealClick);
}

/**
 * Получает данные о блюдах из API
 * @param {string} endpoint - Конечная точка API
 * @param {string} [params=''] - Параметры запроса
 * @returns {Promise<Array|null>} Массив блюд или null в случае ошибки
 */
async function fetchMealData(endpoint, params = '') {
  try {
    const response = await axios.get(`${APP_CONFIG.apiUrl}${endpoint}${params}`);
    return response.data.meals;
  } catch (error) {
    APP_UTILS.handleError(`An error occurred while fetching data from ${endpoint}`, error);
    return null;
  }
}

/**
 * Обрабатывает отправку формы поиска блюд
 * @param {Event} event - Событие отправки формы
 */
async function handleMealSearchFormSubmit(event) {
  event.preventDefault();
  const searchQuery = event.target.elements.search.value.trim();
  APP_STATE.elements.mealDetails.innerHTML = '';

  if (!searchQuery) {
    APP_UTILS.showToast('Please enter a search query.');
    return;
  }

  APP_STATE.elements.mealSearchFormButton.textContent = 'Loading...';
  toggleSearchResults(true);

  try {
    const meals = await fetchMealData('search.php', `?s=${searchQuery}`);
    if (meals === null) {
      APP_UTILS.showToast('No meals found for the provided search query.');
      clearSearchResults();
      toggleSearchResults(false);
    } else {
      displaySearchResults(meals, searchQuery);
    }
  } catch (error) {
    APP_UTILS.handleError('An error occurred while searching for meals.', error);
    toggleSearchResults(false);
  } finally {
    APP_STATE.elements.mealSearchFormButton.textContent = 'Search';
    event.target.reset();
  }
}

/**
 * Переключает видимость результатов поиска
 * @param {boolean} isVisible - Флаг видимости
 */
function toggleSearchResults(isVisible) {
  APP_STATE.elements.mealResults.classList.toggle('hidden', !isVisible);
  APP_STATE.elements.mealResults.classList.toggle('grid', isVisible);
}

/**
 * Очищает результаты поиска
 */
function clearSearchResults() {
  APP_STATE.elements.mealResultsHeading.innerHTML = APP_STATE.elements.mealResultsList.innerHTML = '';
}

/**
 * Отображает результаты поиска
 * @param {Array} meals - Массив найденных блюд
 * @param {string} searchQuery - Поисковый запрос
 */
function displaySearchResults(meals, searchQuery) {
  APP_STATE.elements.mealResultsHeading.innerHTML = `<h4 class='text-lg'>Search results for <span class='font-bold'>'${searchQuery}'</span>:</h4>`;
  APP_STATE.elements.mealResultsList.innerHTML = meals.map(({ strMealThumb, idMeal, strMeal }) => `
    <li class="cursor-pointer rounded border-2 p-2" data-meal-id="${idMeal}">
      <img class="pointer-events-none rounded" src="${strMealThumb}" alt="${strMeal}" />
      <h6 class="p-3 text-center font-bold pointer-events-none">${strMeal}</h6>
    </li>
  `).join('');
}

/**
 * Обрабатывает клик по кнопке случайного блюда
 */
async function handleRandomMealClick() {
  try {
    toggleSearchResults(true);
    clearSearchResults();
    const [meal] = await fetchMealData('random.php');
    renderSingleMeal(meal);
  } catch (error) {
    APP_UTILS.handleError('An error occurred while fetching a random meal.', error);
    toggleSearchResults(false);
  }
}

/**
 * Отображает информацию о выбранном блюде
 * @param {Object} meal - Объект с данными о блюде
 */
function renderSingleMeal(meal) {
  const { strMeal, strMealThumb, strCategory, strArea, strInstructions } = meal;
  const ingredients = getIngredients(meal);

  APP_STATE.elements.mealDetails.innerHTML = `
    <h2 class='text-lg font-bold'>${strMeal}</h2>
    <img class='max-w-[300px] rounded' src='${strMealThumb}' alt='${strMeal}' />
    ${renderMealInfo(strCategory, strArea)}
    <div class='grid gap-2'>
      <p>${strInstructions}</p>
      <h3 class='font-bold'>Ingredients:</h3>
      <ul class='list-inside list-disc'>
        ${ingredients.map(ing => `<li>${ing}</li>`).join('')}
      </ul>
    </div>
  `;
}
/**
 * Извлекает список ингредиентов из объекта блюда
 * @param {Object} meal - Объект с данными о блюде
 * @returns {string[]} Массив строк с ингредиентами и их мерами
 */
function getIngredients(meal) {
  return Array.from({ length: 20 }, (_, i) => i + 1)
    .map(i => meal[`strIngredient${i}`] && `${meal[`strIngredient${i}`]} - ${meal[`strMeasure${i}`]}`)
    .filter(Boolean);
}

/**
 * Формирует HTML-разметку с информацией о категории и области происхождения блюда
 * @param {string} category - Категория блюда
 * @param {string} area - Область происхождения блюда
 * @returns {string} HTML-разметка с информацией о блюде
 */
function renderMealInfo(category, area) {
  const categoryInfo = category ? `<p><span class='font-bold'>Category:</span> ${category}</p>` : '';
  const areaInfo = area ? `<p><span class='font-bold'>Area:</span> ${area}</p>` : '';
  return categoryInfo || areaInfo ? `<div class='grid gap-2'>${categoryInfo}${areaInfo}</div>` : '';
}

/**
 * Обрабатывает клик по элементу в списке результатов поиска
 * @param {Event} param0 - Объект события клика
 * @returns {Promise<void>}
 */
async function handleMealResultsListClick({ target }) {
  if (!target.matches('[data-meal-id]')) return;
  const id = target.dataset.mealId;
  try {
    const [meal] = await fetchMealData('lookup.php', `?i=${id}`);
    renderSingleMeal(meal);
  } catch (error) {
    APP_UTILS.handleError('An error occurred while fetching meal information.', error);
  } finally {
    clearSearchResults();
  }
}

/**
 * Инициализирует приложение
 */
initApp();
