/**
 * Этот файл содержит реализацию приложения для фильтрации продуктов.
 * Приложение позволяет пользователям просматривать список продуктов,
 * фильтровать их по компаниям и осуществлять поиск по названию.
 */

import './style.css';
import productsList from './mock';

/**
 * Интерфейс, описывающий структуру продукта
 * @interface Product
 */
interface Product {
  /** Уникальный идентификатор продукта */
  id: string;
  /** Название продукта */
  title: string;
  /** Компания-производитель */
  company: string;
  /** URL изображения продукта */
  image: string;
  /** Цена продукта */
  price: number;
}

/**
 * Интерфейс, описывающий конфигурацию приложения
 * @interface AppConfig
 */
interface AppConfig {
  /** Селектор корневого элемента приложения */
  root: string;
  /** Объект с селекторами элементов */
  selectors: {
    /** Селектор формы фильтрации */
    filterForm: string;
    /** Селектор списка компаний */
    companyList: string;
    /** Селектор контейнера продуктов */
    productContainer: string;
    /** Селектор списка продуктов */
    productList: string;
  };
}

/**
 * Конфигурация приложения
 * @constant
 */
const APP_CONFIG: AppConfig = {
  root: '#app',
  selectors: {
    filterForm: '[data-filter-form]',
    companyList: '[data-company-list]',
    productContainer: '[data-product-container]',
    productList: '[data-product-list]',
  },
};

/**
 * Интерфейс, описывающий состояние приложения
 * @interface AppState
 */
interface AppState {
  /** Объект с DOM элементами */
  elements: {
    /** Форма фильтрации */
    filterForm: HTMLFormElement | null;
    /** Список компаний */
    companyList: HTMLUListElement | null;
    /** Контейнер продуктов */
    productContainer: HTMLDivElement | null;
    /** Список продуктов */
    productList: HTMLUListElement | null;
  };
  /** Массив отфильтрованных продуктов */
  products: Product[];
}

/**
 * Состояние приложения
 * @constant
 */
const APP_STATE: AppState = {
  elements: {
    filterForm: null,
    companyList: null,
    productContainer: null,
    productList: null,
  },
  products: productsList,
};

/**
 * Интерфейс, описывающий вспомогательные функции приложения
 * @interface AppUtils
 */
interface AppUtils {
  /** Функция для рендеринга data-атрибутов */
  renderDataAttributes: (element: string) => string;
  /** Функция для капитализации первой буквы строки */
  capitalizeFirstLetter: (str: string) => string;
}

/**
 * Вспомогательные функции приложения
 * @constant
 */
const APP_UTILS: AppUtils = {
  renderDataAttributes: (element: string): string => element.slice(1, -1),
  capitalizeFirstLetter: (str: string): string => str.charAt(0).toUpperCase() + str.slice(1),
};

/**
 * Создает HTML-разметку приложения
 */
function createAppHTML(): void {
  const {
    root,
    selectors: { filterForm, companyList, productContainer, productList },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='mx-auto grid w-full max-w-6xl items-start gap-4 p-3'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>Products Filter</h1>
      <div class='grid items-start gap-3 xl:grid-cols-[300px_1fr]'>
        <div class='grid gap-3'>
          <form ${renderDataAttributes(filterForm)}>
            <input
              class='w-full rounded border bg-slate-50 px-3 py-2.5 focus:border-blue-400 focus:outline-none'
              name='query'
              type='search'
              placeholder='Search'
            >
          </form>
          <h5 class='text-sm font-medium'>Company</h5>
          <ul class='flex flex-wrap gap-2 xl:grid' ${renderDataAttributes(companyList)}></ul>
        </div>
        <div ${renderDataAttributes(productContainer)}>
          <ul class='grid gap-3' ${renderDataAttributes(productList)}></ul>
        </div>
      </div>
    </div>
  `;
}

/**
 * Инициализирует DOM элементы приложения
 */
function initDOMElements(): void {
  APP_STATE.elements = {
    filterForm: document.querySelector<HTMLFormElement>(APP_CONFIG.selectors.filterForm),
    companyList: document.querySelector<HTMLUListElement>(APP_CONFIG.selectors.companyList),
    productContainer: document.querySelector<HTMLDivElement>(APP_CONFIG.selectors.productContainer),
    productList: document.querySelector<HTMLUListElement>(APP_CONFIG.selectors.productList),
  };
}

/**
 * Инициализирует приложение
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();

  renderProducts();
  renderFilters();
  APP_STATE.elements.filterForm?.addEventListener('keyup', handleFilterFormKeyup);
  APP_STATE.elements.companyList?.addEventListener('click', handleProductContainerClick);
}

/**
 * Рендерит список продуктов
 */
function renderProducts(): void {
  const productList = APP_STATE.products
    .map(
      ({ id, title, image, price }) => `
    <li class='bg-white border rounded overflow-hidden' data-id='${id}'>
      <img class='h-[250px] w-full object-cover' src='${image}' alt='${title}'>
      <div class='grid gap-3 p-3'>
        <h3 class='text-lg font-bold'>${title}</h3>
        <p>${price}</p>
      </div>
    </li>
  `,
    )
    .join('');

  const html = APP_STATE.products.length
    ? `<ul class='grid gap-3 sm:grid-cols-2 md:grid-cols-3' data-products>${productList}</ul>`
    : `<h5 class='font-medium'>No products matched your search</h5>`;

  if (APP_STATE.elements.productContainer) {
    APP_STATE.elements.productContainer.innerHTML = html;
  }
}

/**
 * Рендерит фильтры по компаниям
 */
function renderFilters(): void {
  const companies = ['all', ...new Set(productsList.map(({ company }) => company))];
  const filterButtons = companies
    .map(
      (company) => `
    <li>
      <button 
        class='border px-3 py-1.5 xl:w-full xl:justify-start ${company === 'all' ? 'bg-slate-100' : 'bg-white'}'
        data-filter-btn 
        data-id='${company}'
      >
        ${APP_UTILS.capitalizeFirstLetter(company)}
      </button>
    </li>
  `,
    )
    .join('');

  if (APP_STATE.elements.companyList) {
    APP_STATE.elements.companyList.innerHTML = filterButtons;
  }
}

/**
 * Обработчик события ввода в поле поиска
 * @param {KeyboardEvent} event - Событие клавиатуры
 */
function handleFilterFormKeyup(event: KeyboardEvent): void {
  const target = event.target as HTMLInputElement;
  const value = target.value;
  const buttons = APP_STATE.elements.companyList?.querySelectorAll('button');
  buttons?.forEach((btn) => btn.classList.replace('bg-slate-100', 'bg-white'));

  APP_STATE.products = productsList.filter(({ title }) =>
    title.toLowerCase().includes(value.toLowerCase()),
  );

  if (value.trim() === '') {
    buttons?.[0].classList.replace('bg-white', 'bg-slate-100');
  }
  renderProducts();
}

/**
 * Обработчик клика по кнопке фильтра
 * @param {MouseEvent} event - Событие мыши
 */
function handleProductContainerClick(event: MouseEvent): void {
  const target = event.target as HTMLButtonElement;
  if (!target.dataset.filterBtn) return;
  const buttons = APP_STATE.elements.companyList?.querySelectorAll('button');
  buttons?.forEach((btn) => btn.classList.replace('bg-slate-100', 'bg-white'));
  target.classList.replace('bg-white', 'bg-slate-100');

  APP_STATE.products =
    target.dataset.id === 'all'
      ? productsList
      : productsList.filter(({ company }) => company === target.dataset.id);
  APP_STATE.elements.filterForm?.reset();
  renderProducts();
}

initApp();
