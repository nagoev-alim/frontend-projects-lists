/**
 * @fileoverview Этот файл содержит код для создания сортируемой таблицы.
 * Он включает функции для генерации HTML-структуры таблицы, инициализации
 * DOM-элементов, сортировки таблицы и обработки пользовательских событий.
 */
import './style.css';
import 'toastify-js/src/toastify.css';


/**
 * Конфигурация приложения
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента
 * @property {Object} selectors - Объект с селекторами элементов
 * @property {string} selectors.table - Селектор таблицы
 * @property {string} selectors.tableRow - Селектор строки таблицы
 */
interface AppConfig {
  root: string;
  selectors: {
    table: string;
    tableRow: string;
  };
}

/**
 * Состояние приложения
 * @typedef {Object} AppState
 * @property {Object} elements - Объект с DOM-элементами
 * @property {HTMLElement[] | null} elements.tableRow - Массив строк таблицы
 */
interface AppState {
  elements: {
    tableRow: HTMLElement[] | null;
  };
}

/**
 * Утилиты приложения
 * @typedef {Object} AppUtils
 * @property {function(string): string} renderDataAttributes - Функция для рендеринга data-атрибутов
 */
interface AppUtils {
  renderDataAttributes: (element: string) => string;
}

/**
 * Конфигурация приложения
 * @type {AppConfig}
 */
const APP_CONFIG: AppConfig = {
  root: '#app',
  selectors: {
    table: '[data-sortable-table]',
    tableRow: '[data-sortable-row]',
  },
};

/**
 * Состояние приложения
 * @type {AppState}
 */
const APP_STATE: AppState = {
  elements: {
    tableRow: null,
  },
};

/**
 * Утилиты приложения
 * @type {AppUtils}
 */
const APP_UTILS: AppUtils = {
  /**
   * Удаляет первый и последний символы строки
   * @param {string} element - Строка для обработки
   * @returns {string} Обработанная строка
   */
  renderDataAttributes: (element: string): string => element.slice(1, -1),
};

/**
 * Создает HTML-структуру приложения
 */
function createAppHTML(): void {
  const { root, selectors: { table, tableRow } } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector<HTMLElement>(root);

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
 * Инициализирует DOM-элементы
 */
function initDOMElements(): void {
  APP_STATE.elements = {
    tableRow: Array.from(document.querySelectorAll<HTMLElement>(APP_CONFIG.selectors.tableRow)),
  };
}

/**
 * Инициализирует приложение
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();
  APP_STATE.elements.tableRow?.forEach((row) => row.addEventListener('click', handleHeaderClick));
}

/**
 * Сортирует таблицу
 * @param {HTMLTableElement} table - Таблица для сортировки
 * @param {number} columnIndex - Индекс столбца для сортировки
 * @param {boolean} isAscending - Флаг направления сортировки
 */
function sortTable(table: HTMLTableElement, columnIndex: number, isAscending: boolean): void {
  const direction = isAscending ? 1 : -1;
  const tableBody = table.tBodies[0];
  const rows = Array.from(tableBody.querySelectorAll<HTMLTableRowElement>('tr'));

  const sortedRows = rows.sort((rowA, rowB) => {
    const cellA = rowA.cells[columnIndex].textContent?.trim() || '';
    const cellB = rowB.cells[columnIndex].textContent?.trim() || '';
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
function updateHeaderClasses(table: HTMLTableElement, columnIndex: number, isAscending: boolean): void {
  const headers = table.querySelectorAll<HTMLTableCellElement>('th');
  headers.forEach((header) => header.classList.remove('asc', 'desc'));
  headers[columnIndex].classList.toggle('asc', isAscending);
  headers[columnIndex].classList.toggle('desc', !isAscending);
}

/**
 * Обработчик клика по заголовку таблицы
 * @param {Event} event - Объект события
 */
function handleHeaderClick(event: Event): void {
  const target = event.target as HTMLTableCellElement;
  const table = target.closest(APP_CONFIG.selectors.table) as HTMLTableElement;
  const headerCells = Array.from(target.parentElement!.children);
  const columnIndex = headerCells.indexOf(target);
  const isCurrentlySortedAscending = target.classList.contains('asc');

  sortTable(table, columnIndex, !isCurrentlySortedAscending);
}

initApp();
