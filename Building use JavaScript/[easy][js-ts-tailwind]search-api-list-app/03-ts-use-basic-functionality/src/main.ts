/**
 * Этот файл содержит основную логику приложения для поиска и отображения API.
 * Приложение позволяет пользователям просматривать категории API, искать API по ключевым словам
 * и отображать подробную информацию о каждом API.
 */


import './style.css';
import CATEGORIES from './categories.json';
import RESOURCES from './resources.json';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

/**
 * Интерфейс конфигурации приложения.
 * @interface
 */
interface AppConfig {
  /** Корневой селектор приложения */
  root: string;
  /** Объект селекторов для различных элементов приложения */
  selectors: {
    [key: string]: string;
  };
  /** Классы для активной кнопки категории */
  ACTIVE_BUTTON_CLASSES: string[];
  /** Поля для отображения информации об API */
  FIELDS: {
    /** Ключ поля в данных API */
    key: string;
    /** Отображаемая метка поля */
    label: string;
  }[];
}

/**
 * Интерфейс состояния приложения.
 * @interface
 */
interface AppState {
  /** Объект, содержащий ссылки на DOM-элементы */
  elements: {
    /** Поле ввода для поиска */
    searchFormInput: HTMLInputElement;
    /** Контейнер для результатов */
    resultContainer: HTMLElement;
    /** Элемент для отображения количества категорий */
    categoriesCount: HTMLElement;
    /** Контейнер для кнопок категорий */
    categoryButtons: HTMLElement;
    /** Список API */
    apiList: HTMLElement;
    /** Контейнер для карточек API */
    apiCards: HTMLElement;
  };
}

/**
 * Интерфейс утилит приложения.
 * @interface
 */
interface AppUtils {
  /** Функция для обработки data-атрибутов */
  renderDataAttributes: (element: string) => string;
  /** Конфигурация для уведомлений */
  toastConfig: {
    /** CSS-класс для уведомления */
    className: string;
    /** Продолжительность отображения уведомления */
    duration?: number;
    /** Позиция уведомления по вертикали */
    gravity?: 'top' | 'bottom';
    /** Позиция уведомления по горизонтали */
    position?: 'left' | 'center' | 'right';
  };
  /** Функция для отображения уведомления */
  showToast: (message: string) => void;
  /** Функция для обработки ошибок */
  handleError: (message: string, error?: any) => void;
  /** Функция для создания debounce-обертки */
  debounce: (func: Function, delay: number) => Function;
}

/**
 * Интерфейс для структуры категорий.
 * @interface
 */
interface Categories {
  /** Общее количество категорий */
  count: number;
  /** Массив объектов категорий */
  entries: { name: string; slug: string }[];
}

/**
 * Интерфейс для структуры API.
 * @interface
 */
interface ApiEntry {
  /** Ссылка на API */
  Link: string;
  /** Флаг поддержки HTTPS */
  HTTPS: boolean;

  /** Дополнительные свойства API */
  [key: string]: string | boolean;
}

/**
 * Конфигурация приложения.
 * @constant
 */
const APP_CONFIG: AppConfig = {
  root: '#app',
  selectors: {
    searchForm: '[data-search-form]',
    resultContainer: '[data-result-container]',
    categoriesCount: '[data-categories-count]',
    categoryButtons: '[data-category-buttons]',
    apiList: '[data-api-list]',
    apiCards: '[data-api-cards]',
  },
  ACTIVE_BUTTON_CLASSES: ['bg-neutral-900', 'text-white', 'font-bold', 'hover:bg-neutral-800'],
  FIELDS: [
    { key: 'API', label: 'Title' },
    { key: 'Description', label: 'Description' },
    { key: 'Auth', label: 'Auth' },
    { key: 'Cors', label: 'Cors' },
    { key: 'Category', label: 'Category' },
  ],
};

/**
 * Состояние приложения.
 * @constant
 */
const APP_STATE: AppState = {
  elements: {
    searchFormInput: document.createElement('input'),
    resultContainer: document.createElement('div'),
    categoriesCount: document.createElement('div'),
    categoryButtons: document.createElement('div'),
    apiList: document.createElement('div'),
    apiCards: document.createElement('div'),
  },
};

/**
 * Утилиты приложения.
 * @constant
 */
const APP_UTILS: AppUtils = {
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
      ...APP_UTILS.toastConfig,
    }).showToast();
  },
  handleError: (message, error = null) => {
    APP_UTILS.showToast(message);
    if (error) console.error(message, error);
  },
  debounce: (func: Function, delay: number) => {
    let timeoutId: number | undefined;
    return function(this: any, ...args: any[]) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  },
};

/**
 * Создает HTML-структуру приложения
 */
function createAppHTML(): void {
  const {
    root,
    selectors: {
      searchForm,
      resultContainer,
      categoriesCount,
      categoryButtons,
      apiList,
      apiCards,
    },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='mx-auto grid w-full max-w-4xl gap-4 p-3'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>Search APIs</h1>
      <div class='grid gap-3'>
        <form class='mx-auto grid w-full max-w-lg gap-2 rounded border bg-white p-3' ${renderDataAttributes(searchForm)}>
          <label>
            <input class='w-full rounded border bg-slate-50 px-3 py-2 focus:border-blue-400 focus:outline-none' type='text' name='category' placeholder='Enter keywords'>
          </label>
        </form>

        <div class='mx-auto grid w-full gap-2' ${renderDataAttributes(resultContainer)}>
          <div class='grid gap-4 rounded border bg-white p-3'>
            <h3 class='font-medium'>Total categories: <span ${renderDataAttributes(categoriesCount)} class='font-bold'>0</span></h3>
            <ul class='flex flex-wrap items-center justify-center gap-3' ${renderDataAttributes(categoryButtons)}></ul>
          </div>

          <div class='hidden grid gap-4 rounded border bg-white p-3' ${renderDataAttributes(apiList)}>
            <h3 class='font-medium'>List API</h3>
            <ul class='grid gap-3 items-start sm:grid-cols-2 md:grid-cols-3' ${renderDataAttributes(apiCards)}></ul>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Инициализирует элементы DOM в состоянии приложения
 */
function initDOMElements(): void {
  APP_STATE.elements = {
    searchFormInput: document.querySelector(`${APP_CONFIG.selectors.searchForm} input`) as HTMLInputElement,
    resultContainer: document.querySelector(APP_CONFIG.selectors.resultContainer) as HTMLElement,
    categoriesCount: document.querySelector(APP_CONFIG.selectors.categoriesCount) as HTMLElement,
    categoryButtons: document.querySelector(APP_CONFIG.selectors.categoryButtons) as HTMLElement,
    apiList: document.querySelector(APP_CONFIG.selectors.apiList) as HTMLElement,
    apiCards: document.querySelector(APP_CONFIG.selectors.apiCards) as HTMLElement,
  };
}

/**
 * Инициализирует приложение
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();
  (async () => {
    await getCategories();
    APP_STATE.elements.searchFormInput.addEventListener('input', APP_UTILS.debounce((event: Event) => {
      handleInputChange(event as InputEvent);
    }, 300) as EventListener);
  })();
}

/**
 * Получает и отображает категории API.
 * @async
 * @returns {Promise<void>}
 * @throws {Error} Если не удалось получить категории.
 */
async function getCategories(): Promise<void> {
  try {
    renderCategories(CATEGORIES);
  } catch (error) {
    APP_UTILS.handleError('Failed to fetch categories', error);
  }
}

/**
 * Отображает категории API на странице.
 * @param {Categories} param0 - Объект с данными категорий.
 * @param {number} param0.count - Общее количество категорий.
 * @param {Array<{name: string, slug: string}>} param0.entries - Массив категорий.
 */
function renderCategories({ count, entries }: Categories): void {
  APP_STATE.elements.categoriesCount.textContent = String(count);
  APP_STATE.elements.categoryButtons.innerHTML = '';

  const fragment = document.createDocumentFragment();

  entries.forEach(({ name, slug }) => {
    const li = document.createElement('li');
    li.innerHTML = `<button class='px-3 py-2 border hover:bg-slate-50' data-category='${slug}'>${name}</button>`;
    const button = li.querySelector('[data-category]') as HTMLButtonElement;

    button.addEventListener('click', async () => {
      updateButtonStyles(button);
      await getCategory(name);
    });

    fragment.appendChild(li);
  });

  APP_STATE.elements.categoryButtons.appendChild(fragment);
}

/**
 * Обновляет стили кнопок категорий, выделяя выбранную.
 * @param {HTMLButtonElement} selectedButton - Выбранная кнопка категории.
 */
function updateButtonStyles(selectedButton: HTMLButtonElement): void {
  const allButtons = document.querySelectorAll('[data-category]');
  allButtons.forEach(button => button.classList.remove(...APP_CONFIG.ACTIVE_BUTTON_CLASSES));
  selectedButton.classList.add(...APP_CONFIG.ACTIVE_BUTTON_CLASSES);
}

/**
 * Получает и отображает API для выбранной категории.
 * @async
 * @param {string} category - Название выбранной категории.
 * @returns {Promise<void>}
 * @throws {Error} Если не удалось получить API для категории.
 */
async function getCategory(category: string): Promise<void> {
  try {
    const categorizedEntries = RESOURCES.entries.reduce((acc: { [key: string]: ApiEntry[] }, entry) => {
      const entryCategory = entry.Category;
      if (!acc[entryCategory]) {
        acc[entryCategory] = [];
      }
      acc[entryCategory].push(entry);
      return acc;
    }, {});
    renderApiCards(categorizedEntries[category] || []);
  } catch (error) {
    APP_UTILS.handleError('Failed to fetch APIs for category', error);
  }
}

/**
 * Отображает карточки API на странице.
 * @param {ApiEntry[]} items - Массив API для отображения.
 */
function renderApiCards(items: ApiEntry[]): void {
  APP_STATE.elements.apiList.classList.remove('hidden');
  const cardItems = items.map(createApiCard).join('');
  APP_STATE.elements.apiList.innerHTML = `<ul class="grid gap-3 items-start sm:grid-cols-2 md:grid-cols-3">${cardItems}</ul>`;
}

/**
 * Создает HTML-разметку для карточки API.
 * @param {ApiEntry} entry - Объект с данными API.
 * @returns {string} HTML-разметка карточки API.
 */
function createApiCard(entry: ApiEntry): string {
  const cardContent = APP_CONFIG.FIELDS.map(({ key, label }) => `
    <p class="mb-1">
      <span class="font-bold">${label}:</span>
      <span>${entry[key] || '-'}</span>
    </p>
  `).join('');

  return `
    <li class="bg-slate-50 rounded p-3 border hover:shadow-md transition-shadow">
      <a href="${entry.Link}" target="_blank" rel="noopener noreferrer" class="block">
        ${cardContent}
      </a>
    </li>
  `;
}

/**
 * Обрабатывает изменение ввода в поле поиска.
 * @param {InputEvent} event - Событие ввода.
 */
function handleInputChange(event: InputEvent): void {
  const target = event.target as HTMLInputElement;
  if (!target) return;

  const value = target.value.trim();
  if (!value) {
    APP_STATE.elements.apiList.classList.add('hidden');
    return;
  }

  const filteredItems = RESOURCES.entries.filter(
    (entry) =>
      entry.Description.toLowerCase().includes(value.toLowerCase()) ||
      entry.API.toLowerCase().includes(value.toLowerCase()),
  );

  renderApiCards(filteredItems);
}

// Инициализация приложения
initApp();
