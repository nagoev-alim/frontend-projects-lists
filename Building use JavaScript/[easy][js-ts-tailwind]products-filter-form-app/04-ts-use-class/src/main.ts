/**
 * Этот код представляет собой приложение для фильтрации продуктов.
 * Он отображает список продуктов, позволяет фильтровать их по компаниям
 * и осуществлять поиск по названию продукта.
 */

import './style.css';
import productsList from './mock';

interface Product {
  id: string;
  title: string;
  company: string;
  image: string;
  price: number;
}

interface Config {
  root: string;
  selectors: {
    filterForm: string;
    companyList: string;
    productContainer: string;
    productList: string;
  };
}

interface State {
  elements: {
    filterForm: HTMLFormElement | null;
    companyList: HTMLUListElement | null;
    productContainer: HTMLDivElement | null;
    productList: HTMLUListElement | null;
  };
  products: Product[];
}

interface Utils {
  renderDataAttributes: (element: string) => string;
  capitalizeFirstLetter: (str: string) => string;
}

/**
 * Класс, представляющий фильтр продуктов
 */
class ProductsFilter {
  private readonly config: Config;
  private state: State;
  private readonly utils: Utils;

  /**
   * Создает экземпляр ProductsFilter
   */
  constructor() {
    this.config = {
      root: '#app',
      selectors: {
        filterForm: '[data-filter-form]',
        companyList: '[data-company-list]',
        productContainer: '[data-product-container]',
        productList: '[data-product-list]',
      },
    };

    this.state = {
      elements: {
        filterForm: null,
        companyList: null,
        productContainer: null,
        productList: null,
      },
      products: productsList,
    };

    this.utils = {
      renderDataAttributes: (element: string): string => element.slice(1, -1),
      capitalizeFirstLetter: (str: string): string => str.charAt(0).toUpperCase() + str.slice(1),
    };

    this.init();
  }

  /**
   * Создает HTML-разметку приложения
   */
  private createAppHTML(): void {
    const {
      root,
      selectors: { filterForm, companyList, productContainer, productList },
    } = this.config;
    const { renderDataAttributes } = this.utils;
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
   * Инициализирует DOM элементы
   */
  private initDOMElements(): void {
    this.state.elements = {
      filterForm: document.querySelector<HTMLFormElement>(this.config.selectors.filterForm),
      companyList: document.querySelector<HTMLUListElement>(this.config.selectors.companyList),
      productContainer: document.querySelector<HTMLDivElement>(this.config.selectors.productContainer),
      productList: document.querySelector<HTMLUListElement>(this.config.selectors.productList),
    };
  }

  /**
   * Инициализирует приложение
   */
  private init(): void {
    this.createAppHTML();
    this.initDOMElements();

    this.renderProducts();
    this.renderFilters();
    this.state.elements.filterForm?.addEventListener('keyup', this.handleFilterFormKeyup.bind(this));
    this.state.elements.companyList?.addEventListener('click', this.handleProductContainerClick.bind(this));
  }

  /**
   * Отрисовывает список продуктов
   */
  private renderProducts(): void {
    const productList = this.state.products
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

    const html = this.state.products.length
      ? `<ul class='grid gap-3 sm:grid-cols-2 md:grid-cols-3' data-products>${productList}</ul>`
      : `<h5 class='font-medium'>No products matched your search</h5>`;

    if (this.state.elements.productContainer) {
      this.state.elements.productContainer.innerHTML = html;
    }
  }

  /**
   * Отрисовывает фильтры
   */
  private renderFilters(): void {
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
        ${this.utils.capitalizeFirstLetter(company)}
      </button>
    </li>
  `,
      )
      .join('');

    if (this.state.elements.companyList) {
      this.state.elements.companyList.innerHTML = filterButtons;
    }
  }

  /**
   * Обработчик события ввода в поле поиска
   * @param {Event} event - Событие ввода
   */
  private handleFilterFormKeyup(event: Event): void {
    const { value } = event.target as HTMLInputElement;
    const buttons = this.state.elements.companyList?.querySelectorAll('button');
    buttons?.forEach((btn) => btn.classList.replace('bg-slate-100', 'bg-white'));

    this.state.products = productsList.filter(({ title }) =>
      title.toLowerCase().includes(value.toLowerCase()),
    );

    if (value.trim() === '') {
      buttons?.[0].classList.replace('bg-white', 'bg-slate-100');
    }
    this.renderProducts();
  }

  /**
   * Обработчик события клика по кнопке фильтра
   * @param {Event} event - Событие клика
   */
  private handleProductContainerClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!!target.dataset.filterBtn) return;
    
    const buttons = this.state.elements.companyList?.querySelectorAll('button');
    buttons?.forEach((btn) => btn.classList.replace('bg-slate-100', 'bg-white'));
    target.classList.replace('bg-white', 'bg-slate-100');

    this.state.products =
      target.dataset.id === 'all'
        ? productsList
        : productsList.filter(({ company }) => company === target.dataset.id);
    this.state.elements.filterForm?.reset();
    this.renderProducts();
  }
}

new ProductsFilter();
