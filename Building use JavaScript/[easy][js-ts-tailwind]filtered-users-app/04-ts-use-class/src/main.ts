/**
 * Этот код создает фильтруемый список пользователей с возможностью поиска по имени.
 * Он использует Faker.js для генерации случайных данных пользователей и
 * реализует функциональность фильтрации в режиме реального времени.
 */

import './style.css';
import { faker } from '@faker-js/faker';

interface Config {
  root: string;
  selectors: {
    filterInput: string;
    filteredList: string;
  };
}

interface State {
  elements: {
    filterInput: HTMLInputElement | null;
    filteredList: HTMLUListElement | null;
  };
}

interface User {
  firstName: string;
  lastName: string;
  jobArea: string;
}

/**
 * Класс для создания и управления фильтруемым списком пользователей.
 */
class FilteredUsers {
  private config: Config;
  private state: State;
  private utils: {
    renderDataAttributes: (element: string) => string;
    debounce: <T extends (...args: any[]) => void>(func: T, delay: number) => (...args: Parameters<T>) => void;
  };

  /**
   * Создает экземпляр FilteredUsers.
   */
  constructor() {
    this.config = {
      root: '#app',
      selectors: {
        filterInput: '[data-filter-input]',
        filteredList: '[data-filtered-list]',
      },
    };

    this.state = {
      elements: {
        filterInput: null,
        filteredList: null,
      },
    };

    this.utils = {
      renderDataAttributes: (element: string): string => element.slice(1, -1),

      debounce: <T extends (...args: any[]) => void>(func: T, delay: number): (...args: Parameters<T>) => void => {
        let timeoutId: NodeJS.Timeout;
        return (...args: Parameters<T>): void => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
      },
    };

    this.init();
  }

  /**
   * Создает HTML структуру приложения.
   */
  private createAppHTML(): void {
    const {
      root,
      selectors: { filterInput, filteredList },
    } = this.config;
    const { renderDataAttributes } = this.utils;
    const rootElement = document.querySelector<HTMLElement>(root);

    if (!rootElement) return;

    rootElement.innerHTML = `
      <div class='grid max-w-xl w-full gap-4 rounded border p-3 shadow'>
        <h1 class='text-center text-2xl font-bold md:text-4xl'>A Filterable List</h1>
        <input 
          class='rounded border-2 px-3 py-2.5 focus:border-blue-400 focus:outline-none' 
          type='text' 
          ${renderDataAttributes(filterInput)}
          placeholder='Search by name'
        >
        <ul ${renderDataAttributes(filteredList)}></ul>
      </div>    
    `;
  }

  /**
   * Инициализирует элементы DOM.
   */
  private initDOMElements(): void {
    this.state.elements = {
      filterInput: document.querySelector<HTMLInputElement>(this.config.selectors.filterInput),
      filteredList: document.querySelector<HTMLUListElement>(this.config.selectors.filteredList),
    };
  }

  /**
   * Инициализирует приложение.
   */
  private init(): void {
    this.createAppHTML();
    this.initDOMElements();
    this.renderUsers();
    this.state.elements.filterInput?.addEventListener(
      'input',
      this.utils.debounce(this.handleFilterInput.bind(this), 300)
    );
  }

  /**
   * Отрисовывает список пользователей.
   */
  private renderUsers(): void {
    const users: User[] = Array.from({ length: 100 }, () => ({
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      jobArea: faker.person.jobArea(),
    }));

    if (this.state.elements.filteredList) {
      this.state.elements.filteredList.innerHTML = users
        .sort((a, b) =>
          `${a.firstName} ${a.lastName}`.localeCompare(
            `${b.firstName} ${b.lastName}`
          )
        )
        .map(
          (user) => `
            <li class='flex gap-1 border p-2'>
              <span class='text-lg'>${user.firstName} ${user.lastName}</span>
              <span class='font-medium ml-auto'>${user.jobArea}</span>
              <div data-filtered-name='' class='hidden'>${user.firstName} ${user.lastName} ${user.jobArea}</div>
            </li>
          `
        )
        .join('');
    }
  }

  /**
   * Обрабатывает ввод в поле фильтра.
   * @param {Event} event - Событие ввода
   */
  private handleFilterInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const trimmedValue = target.value.trim().toLowerCase();
    const nameElements = document.querySelectorAll<HTMLElement>('[data-filtered-name]');

    nameElements.forEach((nameElement) => {
      if (nameElement && nameElement.parentElement) {
        const isVisible =
          trimmedValue === '' ||
          (nameElement.textContent && nameElement.textContent.toLowerCase().includes(trimmedValue));
        nameElement.parentElement.style.display = isVisible ? 'flex' : 'none';
      }
    });
  }
}

new FilteredUsers();