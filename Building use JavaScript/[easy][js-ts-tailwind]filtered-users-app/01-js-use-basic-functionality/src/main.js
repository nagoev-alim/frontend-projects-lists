/**
 * Этот код создает фильтруемый список пользователей с возможностью поиска по имени.
 * Он использует Faker.js для генерации случайных данных пользователей и
 * реализует функциональность фильтрации в режиме реального времени.
 */

import './style.css';
import { faker } from '@faker-js/faker';

/**
 * Конфигурация приложения
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента
 * @property {Object} selectors - Селекторы элементов
 * @property {string} selectors.filterInput - Селектор поля ввода для фильтрации
 * @property {string} selectors.filteredList - Селектор списка для отфильтрованных элементов
 */
const APP_CONFIG = {
  root: '#app',
  selectors: {
    filterInput: '[data-filter-input]',
    filteredList: '[data-filtered-list]',
  },
};

/**
 * Состояние приложения
 * @typedef {Object} AppState
 * @property {Object} elements - DOM элементы
 * @property {HTMLInputElement} elements.filterInput - Поле ввода для фильтрации
 * @property {HTMLUListElement} elements.filteredList - Список для отфильтрованных элементов
 */
const APP_STATE = {
  elements: {
    filterInput: null,
    filteredList: null,
  },
};

/**
 * Утилиты приложения
 * @typedef {Object} AppUtils
 * @property {Function} renderDataAttributes - Функция для рендеринга data-атрибутов
 * @property {Function} debounce - Функция для дебаунсинга
 */
const APP_UTILS = {
  /**
   * Подготавливает строку data-атрибута для использования в HTML
   * @param {string} element - Строка с data-атрибутом
   * @returns {string} Подготовленная строка data-атрибута
   */
  renderDataAttributes: (element) => element.slice(1, -1),

  /**
   * Создает дебаунсированную версию функции
   * @param {Function} func - Функция для дебаунсинга
   * @param {number} delay - Задержка в миллисекундах
   * @returns {Function} Дебаунсированная функция
   */
  debounce: (func, delay) => {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  },
};

/**
 * Создает HTML-структуру приложения
 */
function createAppHTML() {
  const {
    root,
    selectors: { filterInput, filteredList },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector(root);

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
function initDOMElements() {
  APP_STATE.elements = {
    filterInput: document.querySelector(APP_CONFIG.selectors.filterInput),
    filteredList: document.querySelector(APP_CONFIG.selectors.filteredList),
  };
}

/**
 * Инициализирует приложение
 */
function initApp() {
  createAppHTML();
  initDOMElements();

  renderUsers();
  APP_STATE.elements.filterInput.addEventListener(
    'input',
    APP_UTILS.debounce(handleFilterInput, 300)
  );
}

/**
 * Рендерит список пользователей
 */
function renderUsers() {
  const users = Array.from({ length: 100 }, () => ({
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    jobArea: faker.person.jobArea(),
  }));

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

/**
 * Обрабатывает ввод в поле фильтрации
 * @param {Event} event - Событие ввода
 */
function handleFilterInput({ target: { value } }) {
  const trimmedValue = value.trim().toLowerCase();
  const nameElements = document.querySelectorAll('[data-filtered-name]');

  nameElements.forEach((nameElement) => {
    if (nameElement && nameElement.parentElement) {
      const isVisible =
        trimmedValue === '' ||
        nameElement.textContent.toLowerCase().includes(trimmedValue);
      nameElement.parentElement.style.display = isVisible ? 'flex' : 'none';
    }
  });
}

initApp();