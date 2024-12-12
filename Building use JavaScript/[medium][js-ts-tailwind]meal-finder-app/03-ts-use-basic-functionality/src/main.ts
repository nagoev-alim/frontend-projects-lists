/**
 * Этот модуль представляет собой приложение для поиска и отображения информации о блюдах.
 * Он использует API TheMealDB для получения данных о блюдах, позволяет пользователям
 * искать блюда по ключевым словам и просматривать случайные блюда.
 */

import './style.css';
import { icons } from 'feather-icons';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';

/**
 * Интерфейс для конфигурации приложения
 * @interface
 */
interface AppConfig {
  /** Селектор корневого элемента */
  root: string;
  /** Объект с селекторами элементов */
  selectors: {
    [key: string]: string;
  };
  /** URL API для получения данных о блюдах */
  apiUrl: string;
}

/**
 * Интерфейс для состояния приложения
 * @interface
 */
interface AppState {
  /** Объект с элементами DOM */
  elements: {
    [key: string]: HTMLElement | null;
  };
}

/**
 * Интерфейс для утилит приложения
 * @interface
 */
interface AppUtils {
  /** Функция для рендеринга data-атрибутов */
  renderDataAttributes: (element: string) => string;
  /** Конфигурация для toast-уведомлений */
  toastConfig: {
    className: string;
    duration: number;
    gravity: string;
    position: string;
  };
  /** Функция для отображения toast-уведомления */
  showToast: (message: string) => void;
  /** Функция для обработки ошибок */
  handleError: (message: string, error?: Error) => void;
}

/**
 * Интерфейс для объекта блюда
 * @interface
 */
interface Meal {
  /** Название блюда */
  strMeal: string;
  /** URL изображения блюда */
  strMealThumb: string;
  /** ID блюда */
  idMeal: string;
  /** Категория блюда */
  strCategory?: string;
  /** Регион происхождения блюда */
  strArea?: string;
  /** Инструкции по приготовлению */
  strInstructions?: string;

  /** Другие свойства блюда */
  [key: string]: string | undefined;
}

/**
 * Конфигурация приложения
 * @constant
 */
const APP_CONFIG: AppConfig = {
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
 * Состояние приложения
 * @constant
 */
const APP_STATE: AppState = {
  elements: {
    mealSearchForm: null,
    mealSearchFormButton: null,
    randomMeal: null,
    mealResults: null,
    mealResultsHeading: null,
    mealResultsList: null,
    mealDetails: null,
  },
};

/**
 * Утилиты приложения
 * @constant
 */
const APP_UTILS: AppUtils = {
  renderDataAttributes: (element: string): string => element.slice(1, -1),
  toastConfig: {
    className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
    duration: 3000,
    gravity: 'bottom',
    position: 'center',
  },
  showToast: (message: string): void => {
    // @ts-ignore
    Toastify({
      text: message,
      ...APP_UTILS.toastConfig,
    }).showToast();
  },
  handleError: (message: string, error: Error | null = null): void => {
    APP_UTILS.showToast(message);
    if (error) console.error(message, error);
  },
};

/**
 * Создает HTML-разметку приложения
 */
function createAppHTML(): void {
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
 * Инициализирует DOM-элементы приложения
 */
function initDOMElements(): void {
  APP_STATE.elements = {
    mealSearchForm: document.querySelector<HTMLFormElement>(APP_CONFIG.selectors.mealSearchForm),
    mealSearchFormButton: document.querySelector<HTMLButtonElement>(`${APP_CONFIG.selectors.mealSearchForm} button[type="submit"]`),
    randomMeal: document.querySelector<HTMLButtonElement>(APP_CONFIG.selectors.randomMeal),
    mealResults: document.querySelector<HTMLDivElement>(APP_CONFIG.selectors.mealResults),
    mealResultsHeading: document.querySelector<HTMLDivElement>(APP_CONFIG.selectors.mealResultsHeading),
    mealResultsList: document.querySelector<HTMLUListElement>(APP_CONFIG.selectors.mealResultsList),
    mealDetails: document.querySelector<HTMLDivElement>(APP_CONFIG.selectors.mealDetails),
  };
}

/**
 * Инициализирует приложение
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();
  APP_STATE.elements.mealSearchForm?.addEventListener('submit', handleMealSearchFormSubmit);
  APP_STATE.elements.mealResultsList?.addEventListener('click', handleMealResultsListClick);
  APP_STATE.elements.randomMeal?.addEventListener('click', handleRandomMealClick);
}

/**
 * Получает данные о блюдах из API
 * @param {string} endpoint - Конечная точка API
 * @param {string} params - Параметры запроса
 * @returns {Promise<Meal[] | null>} Массив блюд или null в случае ошибки
 */
async function fetchMealData(endpoint: string, params: string = ''): Promise<Meal[] | null> {
  try {
    const response = await axios.get(`${APP_CONFIG.apiUrl}${endpoint}${params}`);
    return response.data.meals;
  } catch (error) {
    APP_UTILS.handleError(`An error occurred while fetching data from ${endpoint}`, error as Error);
    return null;
  }
}

/**
 * Обрабатывает отправку формы поиска блюд
 * @param {Event} event - Событие отправки формы
 */
async function handleMealSearchFormSubmit(event: Event): Promise<void> {
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  const searchQuery = (form.elements.namedItem('search') as HTMLInputElement).value.trim();
  if (APP_STATE.elements.mealDetails) APP_STATE.elements.mealDetails.innerHTML = '';

  if (!searchQuery) {
    APP_UTILS.showToast('Please enter a search query.');
    return;
  }

  if (APP_STATE.elements.mealSearchFormButton) APP_STATE.elements.mealSearchFormButton.textContent = 'Loading...';
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
    APP_UTILS.handleError('An error occurred while searching for meals.', error as Error);
    toggleSearchResults(false);
  } finally {
    if (APP_STATE.elements.mealSearchFormButton) APP_STATE.elements.mealSearchFormButton.textContent = 'Search';
    form.reset();
  }
}

/**
 * Переключает видимость результатов поиска
 * @param {boolean} isVisible - Флаг видимости
 */
function toggleSearchResults(isVisible: boolean): void {
  APP_STATE.elements.mealResults?.classList.toggle('hidden', !isVisible);
  APP_STATE.elements.mealResults?.classList.toggle('grid', isVisible);
}

/**
 * Очищает результаты поиска
 */
function clearSearchResults(): void {
  if (APP_STATE.elements.mealResultsHeading) APP_STATE.elements.mealResultsHeading.innerHTML = '';
  if (APP_STATE.elements.mealResultsList) APP_STATE.elements.mealResultsList.innerHTML = '';
}

/**
 * Отображает результаты поиска
 * @param {Meal[]} meals - Массив найденных блюд
 * @param {string} searchQuery - Поисковый запрос
 */
function displaySearchResults(meals: Meal[], searchQuery: string): void {
  if (APP_STATE.elements.mealResultsHeading) {
    APP_STATE.elements.mealResultsHeading.innerHTML = `<h4 class='text-lg'>Search results for <span class='font-bold'>'${searchQuery}'</span>:</h4>`;
  }
  if (APP_STATE.elements.mealResultsList) {
    APP_STATE.elements.mealResultsList.innerHTML = meals.map(({ strMealThumb, idMeal, strMeal }) => `
      <li class="cursor-pointer rounded border-2 p-2" data-meal-id="${idMeal}">
        <img class="pointer-events-none rounded" src="${strMealThumb}" alt="${strMeal}" />
        <h6 class="p-3 text-center font-bold pointer-events-none">${strMeal}</h6>
      </li>
    `).join('');
  }
}

/**
 * Обрабатывает клик по кнопке "Случайное блюдо"
 * @async
 * @returns {Promise<void>}
 */
async function handleRandomMealClick(): Promise<void> {
  try {
    toggleSearchResults(true);
    clearSearchResults();
    const meals = await fetchMealData('random.php');
    if (meals && meals.length > 0) {
      renderSingleMeal(meals[0]);
    }
  } catch (error) {
    APP_UTILS.handleError('An error occurred while fetching a random meal.', error as Error);
    toggleSearchResults(false);
  }
}

/**
 * Отображает информацию о конкретном блюде
 * @param {Meal} meal - Объект с информацией о блюде
 */
function renderSingleMeal(meal: Meal): void {
  const { strMeal, strMealThumb, strCategory, strArea, strInstructions } = meal;
  const ingredients = getIngredients(meal);

  if (APP_STATE.elements.mealDetails) {
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
}

/**
 * Получает список ингредиентов блюда
 * @param {Meal} meal - Объект с информацией о блюде
 * @returns {string[]} Массив строк с ингредиентами и их количеством
 */
function getIngredients(meal: Meal): string[] {
  return Array.from({ length: 20 }, (_, i) => i + 1)
    .map(i => meal[`strIngredient${i}`] && `${meal[`strIngredient${i}`]} - ${meal[`strMeasure${i}`]}`)
    .filter(Boolean) as string[];
}

/**
 * Формирует HTML для отображения информации о категории и регионе блюда
 * @param {string} [category] - Категория блюда
 * @param {string} [area] - Регион происхождения блюда
 * @returns {string} HTML строка с информацией о категории и регионе
 */
function renderMealInfo(category?: string, area?: string): string {
  const categoryInfo = category ? `<p><span class='font-bold'>Category:</span> ${category}</p>` : '';
  const areaInfo = area ? `<p><span class='font-bold'>Area:</span> ${area}</p>` : '';
  return categoryInfo || areaInfo ? `<div class='grid gap-2'>${categoryInfo}${areaInfo}</div>` : '';
}

/**
 * Обрабатывает клик по элементу в списке результатов поиска
 * @async
 * @param {MouseEvent} event - Объект события клика
 * @returns {Promise<void>}
 */
async function handleMealResultsListClick(event: MouseEvent): Promise<void> {
  const target = event.target as HTMLElement;
  if (!target.matches('[data-meal-id]')) return;
  const id = target.dataset.mealId;
  try {
    const meals = await fetchMealData('lookup.php', `?i=${id}`);
    if (meals && meals.length > 0) {
      renderSingleMeal(meals[0]);
    }
  } catch (error) {
    APP_UTILS.handleError('An error occurred while fetching meal information.', error as Error);
  } finally {
    clearSearchResults();
  }
}

/**
 * Инициализирует приложение
 */
initApp();
