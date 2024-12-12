import './style.css';
import 'toastify-js/src/toastify.css';

/**
 * @fileoverview Этот модуль реализует сортируемую таблицу с возможностью 
 * сортировки по клику на заголовок столбца. Таблица создается динамически 
 * и поддерживает сортировку по возрастанию и убыванию для каждого столбца.
 */

/**
 * @interface
 * @description Конфигурация приложения
 */
interface AppConfig {
  /** Корневой селектор для вставки таблицы */
  root: string;
  /** Селекторы элементов таблицы */
  selectors: {
    /** Селектор таблицы */
    table: string;
    /** Селектор строки заголовка таблицы */
    tableRow: string;
  };
}

/**
 * @interface
 * @description Состояние приложения
 */
interface AppState {
  /** Элементы DOM */
  elements: {
    /** Строки заголовка таблицы */
    tableRow: HTMLElement[] | null;
  };
}

/**
 * @interface
 * @description Утилиты приложения
 */
interface AppUtils {
  /**
   * Преобразует строку селектора в строку data-атрибута
   * @param {string} element - Строка селектора
   * @returns {string} Строка data-атрибута
   */
  renderDataAttributes: (element: string) => string;
}

/**
 * @class
 * @description Класс, реализующий функциональность сортируемой таблицы
 */
class SortableTable {
  private readonly config: AppConfig;
  private readonly state: AppState;
  private readonly utils: AppUtils;

  /**
   * @constructor
   * @description Создает экземпляр SortableTable и инициализирует приложение
   */
  constructor() {
    this.config = {
      root: '#app',
      selectors: {
        table: '[data-sortable-table]',
        tableRow: '[data-sortable-row]',
      },
    };

    this.state = {
      elements: {
        tableRow: null,
      },
    };

    this.utils = {
      renderDataAttributes: (element) => element.slice(1, -1),
    };

    this.init();
  }

  /**
   * @private
   * @description Создает HTML-структуру приложения
   */
  private createAppHTML(): void {
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
   * @private
   * @description Инициализирует DOM-элементы
   */
  private initDOMElements(): void {
    this.state.elements = {
      tableRow: Array.from(document.querySelectorAll(this.config.selectors.tableRow)),
    };
  }

  /**
   * @private
   * @description Инициализирует приложение
   */
  private init(): void {
    this.createAppHTML();
    this.initDOMElements();
    this.state.elements.tableRow?.forEach((row) => row.addEventListener('click', this.handleHeaderClick.bind(this)));
  }

  /**
   * @private
   * @description Сортирует таблицу
   * @param {HTMLTableElement} table - Таблица для сортировки
   * @param {number} columnIndex - Индекс столбца для сортировки
   * @param {boolean} isAscending - Флаг направления сортировки
   */
  private sortTable(table: HTMLTableElement, columnIndex: number, isAscending: boolean): void {
    const direction = isAscending ? 1 : -1;
    const tableBody = table.tBodies[0];
    const rows = Array.from(tableBody.querySelectorAll<HTMLTableRowElement>('tr'));

    const sortedRows = rows.sort((rowA, rowB) => {
      const cellA = rowA.cells[columnIndex].textContent?.trim() || '';
      const cellB = rowB.cells[columnIndex].textContent?.trim() || '';
      return cellA.localeCompare(cellB, 'en', { numeric: true }) * direction;
    });

    tableBody.replaceChildren(...sortedRows);

    this.updateHeaderClasses(table, columnIndex, isAscending);
  }

  /**
   * @private
   * @description Обновляет классы заголовков таблицы
   * @param {HTMLTableElement} table - Таблица
   * @param {number} columnIndex - Индекс активного столбца
   * @param {boolean} isAscending - Флаг направления сортировки
   */
  private updateHeaderClasses(table: HTMLTableElement, columnIndex: number, isAscending: boolean): void {
    const headers = table.querySelectorAll<HTMLTableCellElement>('th');
    headers.forEach((header) => header.classList.remove('asc', 'desc'));
    headers[columnIndex].classList.toggle('asc', isAscending);
    headers[columnIndex].classList.toggle('desc', !isAscending);
  }

  /**
   * @private
   * @description Обработчик клика по заголовку таблицы
   * @param {Event} event - Объект события
   */
  private handleHeaderClick(event: Event): void {
    const target = event.target as HTMLTableCellElement;
    const table = target.closest(this.config.selectors.table) as HTMLTableElement;
    const headerCells = Array.from(target.parentElement!.children);
    const columnIndex = headerCells.indexOf(target);
    const isCurrentlySortedAscending = target.classList.contains('asc');

    this.sortTable(table, columnIndex, !isCurrentlySortedAscending);
  }
}

new SortableTable();
