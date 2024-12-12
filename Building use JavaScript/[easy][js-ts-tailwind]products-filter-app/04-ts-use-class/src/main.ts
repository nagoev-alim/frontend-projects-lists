/**
 * Этот модуль реализует функциональность фильтрации продуктов на веб-странице.
 * Он создает интерфейс с кнопками категорий и сеткой продуктов, позволяя
 * пользователю фильтровать продукты по категориям. Класс ProductsFilter
 * управляет всей логикой фильтрации и отображения продуктов.
 */

import './style.css';
import mockData from './mock';

/**
 * Интерфейс, описывающий структуру продукта.
 */
interface Product {
  /** Название продукта */
  title: string;
  /** Цена продукта */
  price: number;
  /** URL изображения продукта */
  img: string;
  /** Описание продукта */
  desc: string;
  /** Категория продукта */
  category: string;
}

/**
 * Интерфейс, описывающий конфигурацию приложения.
 */
interface AppConfig {
  /** Селектор корневого элемента приложения */
  root: string;
  /** Объект с селекторами для списка фильтров и сетки продуктов */
  selectors: {
    filterList: string;
    productGrid: string;
  };
}

/**
 * Интерфейс, описывающий состояние приложения.
 */
interface AppState {
  /** Объект с ссылками на DOM элементы */
  elements: {
    filterList: HTMLElement | null;
    productGrid: HTMLElement | null;
  };
}

/**
 * Интерфейс, описывающий вспомогательные функции приложения.
 */
interface AppUtils {
  /** Функция для рендеринга data-атрибутов */
  renderDataAttributes: (element: string) => string;
  /** Функция для капитализации первой буквы строки */
  capitalizeFirstLetter: (str: string) => string;
}

/**
 * Класс для управления фильтрацией продуктов.
 */
class ProductsFilter {
  /** Конфигурация приложения */
  private config: AppConfig;
  /** Состояние приложения */
  private state: AppState;
  /** Вспомогательные функции */
  private utils: AppUtils;

  /**
   * Создает экземпляр ProductsFilter.
   */
  constructor() {
    this.config = {
      root: '#app',
      selectors: {
        filterList: '[data-filter-list]',
        productGrid: '[data-product-grid]',
      },
    };

    this.state = {
      elements: {
        filterList: null,
        productGrid: null,
      },
    };

    this.utils = {
      renderDataAttributes: (element: string): string => element.slice(1, -1),
      capitalizeFirstLetter: (str: string): string => str.charAt(0).toUpperCase() + str.slice(1),
    };

    this.init();
  }

  /**
   * Создает HTML структуру приложения.
   */
  private createAppHTML(): void {
    const { root, selectors: { filterList, productGrid } } = this.config;
    const { renderDataAttributes } = this.utils;
    const rootElement = document.querySelector(root);

    if (!rootElement) return;

    rootElement.innerHTML = `
    <div class='mx-auto grid w-full max-w-6xl items-start gap-3'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>Products Filter</h1>
      <div class='grid gap-3'>
        <ul class='flex flex-wrap justify-center gap-3' ${renderDataAttributes(filterList)}></ul>
        <ul class='grid gap-3 sm:grid-cols-2 md:grid-cols-3' ${renderDataAttributes(productGrid)}></ul>
      </div>
    </div>
  `;
  }

  /**
   * Инициализирует DOM элементы.
   */
  private initDOMElements(): void {
    this.state.elements = {
      filterList: document.querySelector(this.config.selectors.filterList),
      productGrid: document.querySelector(this.config.selectors.productGrid),
    };
  }

  /**
   * Инициализирует приложение.
   */
  private init(): void {
    this.createAppHTML();
    this.initDOMElements();
    this.renderControls();
    this.renderProduct();
    this.state.elements.filterList?.addEventListener('click', this.handleFilterListClick.bind(this));
  }

  /**
   * Отрисовывает кнопки управления фильтрацией.
   */
  private renderControls(): void {
    const categories: string[] = ['all', ...new Set(mockData.map((item) => item.category))];

    const buttons = categories
      .map((category) => `
    <li>
      <button class='rounded-md border px-3 py-1.5 ${category === 'all' ? 'bg-slate-300' : 'bg-white hover:bg-slate-300'}' data-category='${category}'>
        ${category === 'all' ? 'All' : this.utils.capitalizeFirstLetter(category)}
      </button>
    </li>
  `)
      .join('');

    if (this.state.elements.filterList) {
      this.state.elements.filterList.innerHTML = buttons;
    }
  }

  /**
   * Отрисовывает продукты.
   * @param {Product[]} [items] - Массив продуктов для отображения
   */
  private renderProduct(items?: Product[]): void {
    const itemsToRender = items ?? mockData;
    const productItems = itemsToRender
      .map(({ title, price, img, desc, category }) => `
    <li class='overflow-hidden rounded border bg-white' data-category='${category}'>
      <img class='h-[250px] w-full object-cover' src='${img}' alt='${title}'>
      <div class='grid gap-3 p-3'>
        <div class='flex justify-between'>
          <h4 class='text-lg font-bold'>${title}</h4>
          <p class='font-medium'>$${price}</p>
        </div>
        <p class='text-sm text-gray-600'>${desc}</p>
      </div>
    </li>
  `)
      .join('');

    if (this.state.elements.productGrid) {
      this.state.elements.productGrid.innerHTML = productItems;
    }
  }

  /**
   * Обрабатывает клик по кнопке фильтра.
   * @param {MouseEvent} event - Объект события клика
   */
  private handleFilterListClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.matches('button[data-category]')) return;

    const buttons = this.state.elements.filterList?.querySelectorAll('button');
    buttons?.forEach((btn) => btn.classList.replace('bg-slate-300', 'bg-white'));
    target.classList.replace('bg-white', 'bg-slate-300');

    const selectedCategory = target.dataset.category;
    const filteredProducts =
      selectedCategory === 'all'
        ? mockData
        : mockData.filter((product) => product.category === selectedCategory);

    this.renderProduct(filteredProducts);
  }
}

new ProductsFilter();
