/**
 * Этот код реализует фильтруемый список пользователей.
 * Он генерирует случайных пользователей с помощью Faker.js,
 * отображает их в виде списка и позволяет фильтровать этот список
 * по имени в режиме реального времени.
 */

import './style.css';
import { faker } from '@faker-js/faker';

/**
 * Интерфейс для конфигурации приложения
 * @interface
 */
interface AppConfig {
  /** Селектор корневого элемента */
  root: string;
  /** Объект с селекторами элементов */
  selectors: {
    /** Селектор поля ввода для фильтрации */
    filterInput: string;
    /** Селектор списка для отфильтрованных элементов */
    filteredList: string;
  };
}

/**
 * Конфигурация приложения
 * @constant
 */
const APP_CONFIG: AppConfig = {
  root: '#app',
  selectors: {
    filterInput: '[data-filter-input]',
    filteredList: '[data-filtered-list]',
  },
};

/**
 * Интерфейс для состояния приложения
 * @interface
 */
interface AppState {
  /** Объект с DOM элементами */
  elements: {
    /** Поле ввода для фильтрации */
    filterInput: HTMLInputElement | null;
    /** Список для отфильтрованных элементов */
    filteredList: HTMLUListElement | null;
  };
}

/**
 * Состояние приложения
 * @constant
 */
const APP_STATE: AppState = {
  elements: {
    filterInput: null,
    filteredList: null,
  },
};

/**
 * Интерфейс для утилит приложения
 * @interface
 */
interface AppUtils {
  /** Функция для рендеринга data-атрибутов */
  renderDataAttributes: (element: string) => string;
  /** Функция для дебаунсинга */
  debounce: <T extends (...args: any[]) => void>(func: T, delay: number) => (...args: Parameters<T>) => void;
}

/**
 * Утилиты приложения
 * @constant
 */
const APP_UTILS: AppUtils = {
  /**
   * Подготавливает строку data-атрибута для использования в HTML
   * @param {string} element - Строка с data-атрибутом
   * @returns {string} Подготовленная строка data-атрибута
   */
  renderDataAttributes: (element: string): string => element.slice(1, -1),

  /**
   * Создает дебаунсированную версию функции
   * @param {Function} func - Функция для дебаунсинга
   * @param {number} delay - Задержка в миллисекундах
   * @returns {Function} Дебаунсированная функция
   */
  debounce: <T extends (...args: any[]) => void>(func: T, delay: number): (...args: Parameters<T>) => void => {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>): void => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  },
};

/**
 * Создает HTML-структуру приложения
 */
function createAppHTML(): void {
  const {
    root,
    selectors: { filterInput, filteredList },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
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
 * Инициализирует DOM элементы
 */
function initDOMElements(): void {
  APP_STATE.elements = {
    filterInput: document.querySelector<HTMLInputElement>(APP_CONFIG.selectors.filterInput),
    filteredList: document.querySelector<HTMLUListElement>(APP_CONFIG.selectors.filteredList),
  };
}

/**
 * Инициализирует приложение
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();

  renderUsers();
  APP_STATE.elements.filterInput?.addEventListener(
    'input',
    APP_UTILS.debounce(handleFilterInput, 300)
  );
}

/**
 * Интерфейс для пользователя
 * @interface
 */
interface User {
  /** Имя пользователя */
  firstName: string;
  /** Фамилия пользователя */
  lastName: string;
  /** Область работы пользователя */
  jobArea: string;
}

/**
 * Рендерит список пользователей
 */
function renderUsers(): void {
  const users: User[] = Array.from({ length: 100 }, () => ({
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    jobArea: faker.person.jobArea(),
  }));

  if (APP_STATE.elements.filteredList) {
    APP_STATE.elements.filteredList.innerHTML = users
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
 * Обрабатывает ввод в поле фильтрации
 * @param {Event} event - Событие ввода
 */
function handleFilterInput(event: Event): void {
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

initApp();