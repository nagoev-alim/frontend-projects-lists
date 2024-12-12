/**
 * Этот код представляет собой приложение для поиска блюд.
 * Оно позволяет пользователям искать блюда по ключевым словам,
 * получать случайное блюдо и просматривать подробную информацию о каждом блюде.
 * Приложение использует API TheMealDB для получения данных о блюдах.
 */

import './style.css';
import { icons } from 'feather-icons';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';

/**
 * Интерфейс для конфигурации приложения
 */
interface Config {
  /** Корневой элемент приложения */
  root: string;
  /** Селекторы для различных элементов DOM */
  selectors: {
    [key: string]: string;
  };
  /** URL API для получения данных о блюдах */
  apiUrl: string;
}

/**
 * Интерфейс для хранения состояния приложения
 */
interface State {
  /** Объект, содержащий ссылки на элементы DOM */
  elements: {
    [key: string]: HTMLElement | null;
  };
}

/**
 * Интерфейс для вспомогательных функций
 */
interface Utils {
  /** Функция для рендеринга data-атрибутов */
  renderDataAttributes: (element: string) => string;
  /** Конфигурация для уведомлений */
  toastConfig: {
    className: string;
    duration: number;
    gravity: string;
    position: string;
  };
  /** Функция для отображения уведомлений */
  showToast: (message: string) => void;
  /** Функция для обработки ошибок */
  handleError: (message: string, error?: Error) => void;
}

/**
 * Интерфейс, описывающий структуру данных блюда
 */
interface Meal {
  /** Идентификатор блюда */
  idMeal: string;
  /** Название блюда */
  strMeal: string;
  /** URL изображения блюда */
  strMealThumb: string;
  /** Категория блюда */
  strCategory?: string;
  /** Регион происхождения блюда */
  strArea?: string;
  /** Инструкции по приготовлению */
  strInstructions?: string;

  /** Дополнительные свойства блюда */
  [key: string]: string | undefined;
}

/**
 * Класс MealFinder - основной класс приложения
 */
class MealFinder {
  private config: Config;
  private state: State;
  private utils: Utils;

  /**
   * Конструктор класса MealFinder
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
        mealSearchFormButton: null,
        randomMeal: null,
        mealResults: null,
        mealResultsHeading: null,
        mealResultsList: null,
        mealDetails: null,
      },
    };

    this.utils = {
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
          ...this.utils.toastConfig,
        }).showToast();
      },
      handleError: (message: string, error: Error | null = null): void => {
        this.utils.showToast(message);
        if (error) console.error(message, error);
      },
    };

    this.init();
  }

  /**
   * Создает HTML-структуру приложения
   */
  private createAppHTML(): void {
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
   * Инициализирует DOM-элементы
   */
  private initDOMElements(): void {
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
   * Инициализирует приложение
   */
  private init(): void {
    this.createAppHTML();
    this.initDOMElements();
    this.state.elements.mealSearchForm?.addEventListener('submit', this.handleMealSearchFormSubmit.bind(this));
    this.state.elements.mealResultsList?.addEventListener('click', this.handleMealResultsListClick.bind(this));
    this.state.elements.randomMeal?.addEventListener('click', this.handleRandomMealClick.bind(this));
  }

  /**
   * Получает данные о блюдах с API
   * @param endpoint - Конечная точка API
   * @param params - Дополнительные параметры запроса
   * @returns Массив блюд или null в случае ошибки
   */
  private async fetchMealData(endpoint: string, params: string = ''): Promise<Meal[] | null> {
    try {
      const response = await axios.get(`${this.config.apiUrl}${endpoint}${params}`);
      return response.data.meals;
    } catch (error) {
      this.utils.handleError(`An error occurred while fetching data from ${endpoint}`, error as Error);
      return null;
    }
  }

  /**
   * Обрабатывает отправку формы поиска блюд
   * @param event - Событие отправки формы
   */
  private async handleMealSearchFormSubmit(event: Event): Promise<void> {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const searchQuery = (form.elements.namedItem('search') as HTMLInputElement).value.trim();
    if (this.state.elements.mealDetails) {
      this.state.elements.mealDetails.innerHTML = '';
    }

    if (!searchQuery) {
      this.utils.showToast('Please enter a search query.');
      return;
    }

    if (this.state.elements.mealSearchFormButton instanceof HTMLElement) {
      this.state.elements.mealSearchFormButton.textContent = 'Loading...';
    }
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
      this.utils.handleError('An error occurred while searching for meals.', error as Error);
      this.toggleSearchResults(false);
    } finally {
      if (this.state.elements.mealSearchFormButton instanceof HTMLElement) {
        this.state.elements.mealSearchFormButton.textContent = 'Search';
      }
      form.reset();
    }
  }

  /**
   * Переключает видимость результатов поиска
   * @param isVisible - Флаг видимости
   */
  private toggleSearchResults(isVisible: boolean): void {
    this.state.elements.mealResults?.classList.toggle('hidden', !isVisible);
    this.state.elements.mealResults?.classList.toggle('grid', isVisible);
  }

  /**
   * Очищает результаты поиска
   */
  private clearSearchResults(): void {
    if (this.state.elements.mealResultsHeading) {
      this.state.elements.mealResultsHeading.innerHTML = '';
    }
    if (this.state.elements.mealResultsList) {
      this.state.elements.mealResultsList.innerHTML = '';
    }
  }

  /**
   * Отображает результаты поиска
   * @param meals - Массив найденных блюд
   * @param searchQuery - Поисковый запрос
   */
  private displaySearchResults(meals: Meal[], searchQuery: string): void {
    if (this.state.elements.mealResultsHeading) {
      this.state.elements.mealResultsHeading.innerHTML = `<h4 class='text-lg'>Search results for <span class='font-bold'>'${searchQuery}'</span>:</h4>`;
    }
    if (this.state.elements.mealResultsList) {
      this.state.elements.mealResultsList.innerHTML = meals.map(({ strMealThumb, idMeal, strMeal }) => `
        <li class="cursor-pointer rounded border-2 p-2" data-meal-id="${idMeal}">
          <img class="pointer-events-none rounded" src="${strMealThumb}" alt="${strMeal}" />
          <h6 class="p-3 text-center font-bold pointer-events-none">${strMeal}</h6>
        </li>
      `).join('');
    }
  }

  /**
   * Обрабатывает клик по кнопке случайного блюда
   */
  private async handleRandomMealClick(): Promise<void> {
    try {
      this.toggleSearchResults(true);
      this.clearSearchResults();
      const meals = await this.fetchMealData('random.php');
      if (meals && meals.length > 0) {
        this.renderSingleMeal(meals[0]);
      }
    } catch (error) {
      this.utils.handleError('An error occurred while fetching a random meal.', error as Error);
      this.toggleSearchResults(false);
    }
  }

  /**
   * Отображает информацию о конкретном блюде
   * @param {Meal} meal - Объект с информацией о блюде
   */
  private renderSingleMeal(meal: Meal): void {
    const { strMeal, strMealThumb, strCategory, strArea, strInstructions } = meal;
    const ingredients = this.getIngredients(meal);

    if (this.state.elements.mealDetails) {
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
  }

  /**
   * Извлекает список ингредиентов из объекта блюда
   * @param {Meal} meal - Объект с информацией о блюде
   * @returns {string[]} Массив строк с ингредиентами и их количеством
   */
  private getIngredients(meal: Meal): string[] {
    return Array.from({ length: 20 }, (_, i) => i + 1)
      .map(i => meal[`strIngredient${i}`] && `${meal[`strIngredient${i}`]} - ${meal[`strMeasure${i}`]}`)
      .filter(Boolean) as string[];
  }

  /**
   * Генерирует HTML для отображения категории и региона блюда
   * @param {string} [category] - Категория блюда
   * @param {string} [area] - Регион происхождения блюда
   * @returns {string} HTML-строка с информацией о категории и регионе
   */
  private renderMealInfo(category?: string, area?: string): string {
    const categoryInfo = category ? `<p><span class='font-bold'>Category:</span> ${category}</p>` : '';
    const areaInfo = area ? `<p><span class='font-bold'>Area:</span> ${area}</p>` : '';
    return categoryInfo || areaInfo ? `<div class='grid gap-2'>${categoryInfo}${areaInfo}</div>` : '';
  }

  /**
   * Обрабатывает клик по элементу в списке результатов поиска
   * @param {MouseEvent} event - Объект события клика
   */
  private async handleMealResultsListClick(event: MouseEvent): Promise<void> {
    const target = event.target as HTMLElement;
    if (!target.matches('[data-meal-id]')) return;
    const id = target.dataset.mealId;
    try {
      const meals = await this.fetchMealData('lookup.php', `?i=${id}`);
      if (meals && meals.length > 0) {
        this.renderSingleMeal(meals[0]);
      }
    } catch (error) {
      this.utils.handleError('An error occurred while fetching meal information.', error as Error);
    } finally {
      this.clearSearchResults();
    }
  }
}

new MealFinder();
