/**
 * @fileoverview Этот модуль реализует сортируемую таблицу с возможностью сортировки по клику на заголовок столбца.
 * Он создает HTML-структуру таблицы, инициализирует необходимые элементы DOM и обрабатывает события сортировки.
 */

import './style.css';
import 'toastify-js/src/toastify.css';

/**
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента приложения
 * @property {Object} selectors - Объект с селекторами элементов
 * @property {string} selectors.table - Селектор таблицы
 * @property {string} selectors.tableRow - Селектор строки таблицы
 */

/**
 * Конфигурация приложения
 * @type {AppConfig}
 */
const APP_CONFIG = {
  root: '#app',
  selectors: {
    table: '[data-sortable-table]',
    tableRow: '[data-sortable-row]',
  },
};

/**
 * @typedef {Object} AppState
 * @property {Object} elements - Объект с элементами DOM
 * @property {HTMLElement[]} elements.tableRow - Массив элементов строк таблицы
 */

/**
 * Состояние приложения
 * @type {AppState}
 */
const APP_STATE = {
  elements: {
    tableRow: null,
  },
};

/**
 * Утилиты приложения
 * @type {Object}
 */
const APP_UTILS = {
  /**
   * Обрабатывает строку с data-атрибутами
   * @param {string} element - Строка с data-атрибутами
   * @returns {string} Обработанная строка
   */
  renderDataAttributes: (element) => element.slice(1, -1),
};

/**
 * Создает HTML-структуру приложения
 */
function createAppHTML() {
  const { root, selectors: { table, tableRow } } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='grid w-full max-w-xl gap-4 rounded border bg-white p-3 shadow'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>Sortable Table</h1>
      <table ${renderDataAttributes(table)}>
        <thead>
          <tr>${['Rank', 'Name', 'Age', 'Occupation'].map((n) => `<th class='border bg-neutral-900 p-3 text-white' ${renderDataAttributes(tableRow)}>${n}</th>`).join('')}</tr>
        </thead>
        <tbody data-sortable-body>
          <tr>${['1', 'Dom', '35', 'Web Developer'].map((n) => `<td class='border p-3'>${n}</td>`).join('')}</tr>
          <tr>${['2', 'Rebecca', '29', 'Teacher'].map((n) => `<td class='border p-3'>${n}</td>`).join('')}</tr>
          <tr>${['3', 'John', '30', 'Civil Engineer'].map((n) => `<td class='border p-3'>${n}</td>`).join('')}</tr>
          <tr>${['4', 'Andre', '20', 'Dentist'].map((n) => `<td class='border p-3'>${n}</td>`).join('')}</tr>
        </tbody>
      </table>
    </div>
  `;
}

/**
 * Инициализирует элементы DOM
 */
function initDOMElements() {
  APP_STATE.elements = {
    tableRow: Array.from(document.querySelectorAll(APP_CONFIG.selectors.tableRow)),
  };
}

/**
 * Инициализирует приложение
 */
function initApp() {
  createAppHTML();
  initDOMElements();
  APP_STATE.elements.tableRow.forEach((row) => row.addEventListener('click', handleHeaderClick));
}

/**
 * Сортирует таблицу
 * @param {HTMLTableElement} table - Таблица для сортировки
 * @param {number} columnIndex - Индекс столбца для сортировки
 * @param {boolean} isAscending - Флаг направления сортировки
 */
function sortTable(table, columnIndex, isAscending) {
  const direction = isAscending ? 1 : -1;
  const tableBody = table.tBodies[0];
  const rows = Array.from(tableBody.querySelectorAll('tr'));

  const sortedRows = rows.sort((rowA, rowB) => {
    const cellA = rowA.cells[columnIndex].textContent.trim();
    const cellB = rowB.cells[columnIndex].textContent.trim();
    return cellA.localeCompare(cellB, 'en', { numeric: true }) * direction;
  });

  tableBody.replaceChildren(...sortedRows);

  updateHeaderClasses(table, columnIndex, isAscending);
}

/**
 * Обновляет классы заголовков таблицы
 * @param {HTMLTableElement} table - Таблица
 * @param {number} columnIndex - Индекс активного столбца
 * @param {boolean} isAscending - Флаг направления сортировки
 */
function updateHeaderClasses(table, columnIndex, isAscending) {
  const headers = table.querySelectorAll('th');
  headers.forEach((header) => header.classList.remove('asc', 'desc'));
  headers[columnIndex].classList.toggle('asc', isAscending);
  headers[columnIndex].classList.toggle('desc', !isAscending);
}

/**
 * Обработчик клика по заголовку таблицы
 * @param {Event} event - Объект события
 */
function handleHeaderClick({ target }) {
  const table = target.closest(APP_CONFIG.selectors.table);
  const headerCells = Array.from(target.parentElement.children);
  const columnIndex = headerCells.indexOf(target);
  const isCurrentlySortedAscending = target.classList.contains('asc');

  sortTable(table, columnIndex, !isCurrentlySortedAscending);
}

initApp();
