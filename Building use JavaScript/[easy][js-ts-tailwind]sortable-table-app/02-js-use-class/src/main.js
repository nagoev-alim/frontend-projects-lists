/**
 * @fileoverview Этот модуль реализует сортируемую таблицу с возможностью сортировки по клику на заголовок столбца.
 * Он создает HTML-структуру таблицы, инициализирует необходимые элементы DOM и обрабатывает события сортировки.
 */

import './style.css';
import 'toastify-js/src/toastify.css';

/**
 * Класс SortableTable представляет сортируемую таблицу
 * @class
 */
class SortableTable {
  /**
   * Создает экземпляр SortableTable
   * @constructor
   */
  constructor() {
    /**
     * Конфигурация таблицы
     * @type {Object}
     * @property {string} root - Селектор корневого элемента
     * @property {Object} selectors - Селекторы элементов таблицы
     */
    this.config = {
      root: '#app',
      selectors: {
        table: '[data-sortable-table]',
        tableRow: '[data-sortable-row]',
      },
    };
    /**
     * Состояние таблицы
     * @type {Object}
     * @property {Object} elements - DOM элементы
     */
    this.state = {
      elements: {
        tableRow: null,
      },
    };
    /**
     * Утилиты для работы с таблицей
     * @type {Object}
     */
    this.utils = {
      /**
       * Обрабатывает строку с data-атрибутами
       * @param {string} element - Строка с data-атрибутами
       * @returns {string} Обработанная строка
       */
      renderDataAttributes: (element) => element.slice(1, -1),
    };

    this.init();
  }

  /**
   * Создает HTML-структуру приложения
   */
  createAppHTML() {
    const { root, selectors: { table, tableRow } } = this.config;
    const { renderDataAttributes } = this.utils;
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
  initDOMElements() {
    this.state.elements = {
      tableRow: Array.from(document.querySelectorAll(this.config.selectors.tableRow)),
    };
  }

  /**
   * Инициализирует приложение
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();
    this.state.elements.tableRow.forEach((row) => row.addEventListener('click', this.handleHeaderClick.bind(this)));
  }

  /**
   * Сортирует таблицу
   * @param {HTMLTableElement} table - Таблица для сортировки
   * @param {number} columnIndex - Индекс столбца для сортировки
   * @param {boolean} isAscending - Флаг направления сортировки
   */
  sortTable(table, columnIndex, isAscending) {
    const direction = isAscending ? 1 : -1;
    const tableBody = table.tBodies[0];
    const rows = Array.from(tableBody.querySelectorAll('tr'));

    const sortedRows = rows.sort((rowA, rowB) => {
      const cellA = rowA.cells[columnIndex].textContent.trim();
      const cellB = rowB.cells[columnIndex].textContent.trim();
      return cellA.localeCompare(cellB, 'en', { numeric: true }) * direction;
    });

    tableBody.replaceChildren(...sortedRows);

    this.updateHeaderClasses(table, columnIndex, isAscending);
  }

  /**
   * Обновляет классы заголовков таблицы
   * @param {HTMLTableElement} table - Таблица
   * @param {number} columnIndex - Индекс активного столбца
   * @param {boolean} isAscending - Флаг направления сортировки
   */
  updateHeaderClasses(table, columnIndex, isAscending) {
    const headers = table.querySelectorAll('th');
    headers.forEach((header) => header.classList.remove('asc', 'desc'));
    headers[columnIndex].classList.toggle('asc', isAscending);
    headers[columnIndex].classList.toggle('desc', !isAscending);
  }

  /**
   * Обработчик клика по заголовку таблицы
   * @param {Event} event - Объект события
   */
  handleHeaderClick({ target }) {
    const table = target.closest(this.config.selectors.table);
    const headerCells = Array.from(target.parentElement.children);
    const columnIndex = headerCells.indexOf(target);
    const isCurrentlySortedAscending = target.classList.contains('asc');

    this.sortTable(table, columnIndex, !isCurrentlySortedAscending);
  }
}

new SortableTable();
