/**
 * Этот код представляет собой приложение MealFinder, которое позволяет пользователям
 * искать рецепты блюд, просматривать случайные блюда и получать подробную информацию
 * о выбранных блюдах. Приложение использует API TheMealDB для получения данных о блюдах.
 */

import './style.css';
import { icons } from 'feather-icons';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';

/**
 * Класс MealFinder представляет основную функциональность приложения для поиска блюд.
 */
class MealFinder {
  /**
   * Создает экземпляр MealFinder и инициализирует конфигурацию, состояние и утилиты.
   */
  constructor() {
    this.config = {
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

    this.state = {
      elements: {
        mealSearchForm: null,
        randomMeal: null,
        mealResults: null,
        mealResultsHeading: null,
        mealResultsList: null,
        mealDetails: null,
      },
    };

    this.utils = {
      /**
       * Обрабатывает строку селектора для использования в качестве data-атрибута.
       * @param {string} element - Строка селектора.
       * @returns {string} Обработанная строка без квадратных скобок.
       */
      renderDataAttributes: (element) => element.slice(1, -1),

      /**
       * Конфигурация для всплывающих уведомлений.
       */
      toastConfig: {
        className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
        duration: 3000,
        gravity: 'bottom',
        position: 'center',
      },

      /**
       * Отображает всплывающее уведомление с заданным сообщением.
       * @param {string} message - Текст сообщения для отображения.
       */
      showToast: (message) => {
        Toastify({
          text: message,
          ...this.utils.toastConfig,
        }).showToast();
      },

      /**
       * Обрабатывает ошибки, отображая уведомление и логируя в консоль.
       * @param {string} message - Сообщение об ошибке.
       * @param {Error} [error] - Объект ошибки (необязательно).
       */
      handleError: (message, error = null) => {
        this.utils.showToast(message);
        if (error) console.error(message, error);
      },
    };

    this.init();
  }

  /**
   * Создает HTML-разметку приложения и вставляет её в корневой элемент.
   */
  createAppHTML() {
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
    } = this.config;
    const { renderDataAttributes } = this.utils;
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
   * Инициализирует DOM-элементы, сохраняя их в состоянии приложения.
   */
  initDOMElements() {
    this.state.elements = {
      mealSearchForm: document.querySelector(this.config.selectors.mealSearchForm),
      mealSearchFormButton: document.querySelector(`${this.config.selectors.mealSearchForm} button[type="submit"]`),
      randomMeal: document.querySelector(this.config.selectors.randomMeal),
      mealResults: document.querySelector(this.config.selectors.mealResults),
      mealResultsHeading: document.querySelector(this.config.selectors.mealResultsHeading),
      mealResultsList: document.querySelector(this.config.selectors.mealResultsList),
      mealDetails: document.querySelector(this.config.selectors.mealDetails),
    };
  }

  /**
   * Инициализирует приложение, создавая HTML, инициализируя DOM-элементы и добавляя обработчики событий.
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();
    this.state.elements.mealSearchForm.addEventListener('submit', this.handleMealSearchFormSubmit.bind(this));
    this.state.elements.mealResultsList.addEventListener('click', this.handleMealResultsListClick.bind(this));
    this.state.elements.randomMeal.addEventListener('click', this.handleRandomMealClick.bind(this));
  }

  /**
   * Выполняет запрос к API для получения данных о блюдах.
   * @param {string} endpoint - Конечная точка API.
   * @param {string} [params=''] - Дополнительные параметры запроса.
   * @returns {Promise<Object[]|null>} Массив данных о блюдах или null в случае ошибки.
   */
  async fetchMealData(endpoint, params = '') {
    try {
      const response = await axios.get(`${this.config.apiUrl}${endpoint}${params}`);
      return response.data.meals;
    } catch (error) {
      this.utils.handleError(`An error occurred while fetching data from ${endpoint}`, error);
      return null;
    }
  }

  /**
   * Обрабатывает отправку формы поиска блюд.
   * @param {Event} event - Объект события отправки формы.
   */
  async handleMealSearchFormSubmit(event) {
    event.preventDefault();
    const searchQuery = event.target.elements.search.value.trim();
    this.state.elements.mealDetails.innerHTML = '';

    if (!searchQuery) {
      this.utils.showToast('Please enter a search query.');
      return;
    }

    this.state.elements.mealSearchFormButton.textContent = 'Loading...';
    this.toggleSearchResults(true);

    try {
      const meals = await this.fetchMealData('search.php', `?s=${searchQuery}`);
      if (meals === null) {
        this.utils.showToast('No meals found for the provided search query.');
        this.clearSearchResults();
        this.toggleSearchResults(false);
      } else {
        this.displaySearchResults(meals, searchQuery);
      }
    } catch (error) {
      this.utils.handleError('An error occurred while searching for meals.', error);
      this.toggleSearchResults(false);
    } finally {
      this.state.elements.mealSearchFormButton.textContent = 'Search';
      event.target.reset();
    }
  }

  /**
   * Переключает видимость результатов поиска.
   * @param {boolean} isVisible - Флаг видимости результатов.
   */
  toggleSearchResults(isVisible) {
    this.state.elements.mealResults.classList.toggle('hidden', !isVisible);
    this.state.elements.mealResults.classList.toggle('grid', isVisible);
  }

  /**
   * Очищает результаты поиска.
   */
  clearSearchResults() {
    this.state.elements.mealResultsHeading.innerHTML = this.state.elements.mealResultsList.innerHTML = '';
  }

  /**
   * Отображает результаты поиска блюд.
   * @param {Object[]} meals - Массив объектов с данными о блюдах.
   * @param {string} searchQuery - Поисковый запрос.
   */
  displaySearchResults(meals, searchQuery) {
    this.state.elements.mealResultsHeading.innerHTML = `<h4 class='text-lg'>Search results for <span class='font-bold'>'${searchQuery}'</span>:</h4>`;
    this.state.elements.mealResultsList.innerHTML = meals.map(({ strMealThumb, idMeal, strMeal }) => `
      <li class="cursor-pointer rounded border-2 p-2" data-meal-id="${idMeal}">
        <img class="pointer-events-none rounded" src="${strMealThumb}" alt="${strMeal}" />
        <h6 class="p-3 text-center font-bold pointer-events-none">${strMeal}</h6>
      </li>
    `).join('');
  }

  /**
   * Обрабатывает клик по кнопке случайного блюда.
   */
  async handleRandomMealClick() {
    try {
      this.toggleSearchResults(true);
      this.clearSearchResults();
      const [meal] = await this.fetchMealData('random.php');
      this.renderSingleMeal(meal);
    } catch (error) {
      this.utils.handleError('An error occurred while fetching a random meal.', error);
      this.toggleSearchResults(false);
    }
  }

  /**
   * Отображает информацию о выбранном блюде.
   * @param {Object} meal - Объект с данными о блюде.
   */
  renderSingleMeal(meal) {
    const { strMeal, strMealThumb, strCategory, strArea, strInstructions } = meal;
    const ingredients = this.getIngredients(meal);

    this.state.elements.mealDetails.innerHTML = `
    <h2 class='text-lg font-bold'>${strMeal}</h2>
    <img class='max-w-[300px] rounded' src='${strMealThumb}' alt='${strMeal}' />
    ${this.renderMealInfo(strCategory, strArea)}
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
   * Извлекает ингредиенты и их меры из объекта блюда.
   * @param {Object} meal - Объект с данными о блюде.
   * @returns {string[]} Массив строк с ингредиентами и их мерами.
   */
  getIngredients(meal) {
    return Array.from({ length: 20 }, (_, i) => i + 1)
      .map(i => meal[`strIngredient${i}`] && `${meal[`strIngredient${i}`]} - ${meal[`strMeasure${i}`]}`)
      .filter(Boolean);
  }

  /**
   * Формирует HTML-разметку с информацией о категории и области происхождения блюда.
   * @param {string} category - Категория блюда.
   * @param {string} area - Область происхождения блюда.
   * @returns {string} HTML-разметка с информацией о блюде.
   */
  renderMealInfo(category, area) {
    const categoryInfo = category ? `<p><span class='font-bold'>Category:</span> ${category}</p>` : '';
    const areaInfo = area ? `<p><span class='font-bold'>Area:</span> ${area}</p>` : '';
    return categoryInfo || areaInfo ? `<div class='grid gap-2'>${categoryInfo}${areaInfo}</div>` : '';
  }

  /**
   * Обрабатывает клик по элементу в списке результатов поиска блюд.
   * @param {Event} param0 - Объект события клика.
   */
  async handleMealResultsListClick({ target }) {
    if (!target.matches('[data-meal-id]')) return;
    const id = target.dataset.mealId;
    try {
      const [meal] = await this.fetchMealData('lookup.php', `?i=${id}`);
      this.renderSingleMeal(meal);
    } catch (error) {
      this.utils.handleError('An error occurred while fetching meal information.', error);
    } finally {
      this.clearSearchResults();
    }
  }
}

/**
 * Создает новый экземпляр класса MealFinder и инициализирует приложение для поиска блюд.
 */
new MealFinder();
