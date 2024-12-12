import './style.css';
import { icons } from 'feather-icons';
import { v4 as uuidv4 } from 'uuid';

/**
 * @fileoverview Этот файл содержит класс WorkoutTracker, который реализует
 * функциональность трекера тренировок. Приложение позволяет пользователям
 * добавлять, редактировать и удалять записи о тренировках, а также сохранять
 * данные в локальном хранилище браузера.
 */

/**
 * Класс, представляющий трекер тренировок.
 */
class WorkoutTracker {
  /**
   * Создает экземпляр WorkoutTracker.
   */
  constructor() {
    /**
     * Конфигурация приложения.
     * @type {Object}
     */
    this.config = {
      root: '#app',
      selectors: {
        main: '[data-workout-main]',
        addEntry: '[data-workout-add]',
      },
    };

    /**
     * Состояние приложения.
     * @type {Object}
     */
    this.state = {
      elements: {
        main: null,
        addEntry: null,
      },
      workoutsCollection: [],
    };

    /**
     * Утилиты приложения.
     * @type {Object}
     */
    this.utils = {
      renderDataAttributes: (element) => element.slice(1, -1),
    };

    this.init();
  }

  /**
   * Создает HTML-разметку приложения.
   */
  createAppHTML() {
    const { root, selectors: { main, addEntry } } = this.config;
    const { renderDataAttributes } = this.utils;
    const rootElement = document.querySelector(root);

    if (!rootElement) return;

    rootElement.innerHTML = `
    <div class='grid w-full max-w-2xl rounded border bg-white p-3 shadow'>
      <h1 class='mb-3 text-center text-2xl font-bold md:text-4xl'>Workout Tracker</h1>
      <div class='grid grid-cols-3'>
        <div class='border bg-neutral-900 p-3 text-center font-medium text-white'>Date</div>
        <div class='border bg-neutral-900 p-3 text-center font-medium text-white'>Workout</div>
        <div class='border bg-neutral-900 p-3 text-center font-medium text-white'>Duration</div>
      </div>
      <div class='mb-3' ${renderDataAttributes(main)}></div>
      <div>
        <button class='w-full border px-3 py-2 hover:bg-slate-50' ${renderDataAttributes(addEntry)}>Add Entry</button>
      </div>
    </div>
  `;
  }

  /**
   * Инициализирует DOM-элементы.
   */
  initDOMElements() {
    this.state.elements = {
      main: document.querySelector(this.config.selectors.main),
      addEntry: document.querySelector(this.config.selectors.addEntry),
    };
  }

  /**
   * Инициализирует приложение.
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();
    this.state.workoutsCollection = this.getLocalStorageData();
    this.updateView();
    this.state.elements.addEntry.addEventListener('click', this.handleAddEntryClick.bind(this));
  }

  /**
   * Получает данные из локального хранилища.
   * @returns {Array} Массив тренировок.
   */
  getLocalStorageData() {
    return JSON.parse(localStorage.getItem('workout')) || [];
  }

  /**
   * Сохраняет данные в локальное хранилище.
   */
  setLocalStorageData() {
    localStorage.setItem('workout', JSON.stringify(this.state.workoutsCollection));
  }

  /**
   * Обновляет представление приложения.
   */
  updateView() {
    const { main } = this.state.elements;
    main.innerHTML = '';

    const fragment = document.createDocumentFragment();

    this.state.workoutsCollection.forEach((entry) => {
      const row = this.createWorkoutRow(entry);
      fragment.appendChild(row);
    });

    main.appendChild(fragment);
  }

  /**
   * Создает строку для записи о тренировке.
   * @param {Object} entry - Запись о тренировке.
   * @returns {HTMLElement} Элемент строки.
   */
  createWorkoutRow(entry) {
    const row = document.createElement('div');
    row.classList.add('row', 'grid', 'grid-cols-3');

    row.innerHTML = this.createRowHTML(entry);

    const elements = this.getRowElements(row);

    this.setInitialValues(entry, elements);
    this.addEventListeners(entry, elements);

    return row;
  }

  /**
   * Создает HTML для строки записи о тренировке.
   * @param {Object} entry - Запись о тренировке.
   * @returns {string} HTML-строка.
   */
  createRowHTML(entry) {
    const options = [
      'walking',
      'running',
      'outdoor-cycling',
      'indoor-cycling',
      'swimming',
      'yoga',
    ];

    const optionsHTML = options
      .map(option => `<option value="${option}">${this.capitalizeFirstLetter(option)}</option>`)
      .join('');

    return `
    <div class="date border p-1">
      <input class="px-3 py-2 border rounded w-full focus:outline-none focus:border-blue-400 bg-slate-50" type="date">
    </div>
    <div class="type border p-1">
      <select class="px-3 py-2 border rounded w-full focus:outline-none focus:border-blue-400 bg-slate-50">
        ${optionsHTML}
      </select>
    </div>
    <div class="duration flex items-center border p-1 gap-1">
      <input class="min-w-[60px] max-w-[100px] px-3 py-2 border rounded focus:outline-none focus:border-blue-400 bg-slate-50" type="number">
      <span class="text-sm">minutes</span>
      <button class="ml-auto" data-id="${entry.id}">${icons.x.toSvg()}</button>
    </div>
  `;
  }

  /**
   * Делает первую букву строки заглавной.
   * @param {string} str - Исходная строка.
   * @returns {string} Строка с заглавной первой буквой.
   */
  capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Получает элементы строки.
   * @param {HTMLElement} row - Элемент строки.
   * @returns {Object} Объект с элементами строки.
   */
  getRowElements(row) {
    const selectors = {
      fieldDate: '[type="date"]',
      fieldSelect: 'select',
      fieldNumber: '[type="number"]',
      buttonDelete: 'button',
    };

    return Object.fromEntries(
      Object.entries(selectors).map(([key, selector]) => [
        key,
        row.querySelector(selector) || null,
      ]),
    );
  }

  /**
   * Устанавливает начальные значения для элементов строки.
   * @param {Object} entry - Запись о тренировке.
   * @param {Object} elements - Объект с элементами строки.
   */
  setInitialValues(entry, { fieldDate, fieldSelect, fieldNumber }) {
    const fieldsMap = {
      date: fieldDate,
      workout: fieldSelect,
      duration: fieldNumber,
    };

    Object.entries(fieldsMap).forEach(([key, field]) => {
      if (field && entry[key] !== undefined) {
        if (field instanceof HTMLElement && 'value' in field) {
          field.value = entry[key];
        } else {
          throw new Error(`Field ${key} is not a form element`);
        }
      }
    });
  }

  /**
   * Добавляет обработчики событий для элементов строки.
   * @param {Object} entry - Запись о тренировке.
   * @param {Object} elements - Объект с элементами строки.
   */
  addEventListeners(entry, { fieldDate, fieldSelect, fieldNumber, buttonDelete }) {
    const fieldListeners = [
      { field: fieldDate, key: 'date' },
      { field: fieldSelect, key: 'workout' },
      { field: fieldNumber, key: 'duration' },
    ];

    fieldListeners.forEach(({ field, key }) => {
      if (field instanceof HTMLElement) {
        field.addEventListener('change', (event) => {
          if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) {
            this.updateEntry(entry, key, event.target.value);
          }
        });
      }
    });

    if (buttonDelete instanceof HTMLButtonElement) {
      buttonDelete.addEventListener('click', (event) => {
        if (event.target instanceof HTMLElement && event.target.dataset.id) {
          this.deleteEntry(event.target.dataset.id);
        }
      });
    }
  }

  /**
   * Обновляет запись о тренировке.
   * @param {Object} entry - Запись о тренировке.
   * @param {string} field - Поле для обновления.
   * @param {*} value - Новое значение.
   */
  updateEntry(entry, field, value) {
    if (entry[field] !== value) {
      if (field === 'duration') {
        entry[field] = Number(value);
      } else {
        entry[field] = value;
      }
      this.setLocalStorageData();
      this.updateView();
    }
  }

  /**
   * Удаляет запись о тренировке.
   * @param {string} rowID - ID записи для удаления.
   */
  deleteEntry(rowID) {
    if (typeof rowID !== 'string') {
      throw new Error('rowID must be a string');
    }

    if (!confirm('Are you sure you want to remove this?')) return;

    this.state.workoutsCollection = this.state.workoutsCollection.filter(({ id }) => id !== rowID);

    this.setLocalStorageData();
    this.updateView();
  }

  /**
   * Обрабатывает клик по кнопке добавления новой записи.
   */
  handleAddEntryClick() {
    try {
      const newEntry = this.createNewEntry();
      if (!this.isValidEntry(newEntry)) {
        throw new Error('Invalid entry data');
      }

      this.state.workoutsCollection.push(newEntry);
      this.setLocalStorageData();
      this.updateView();
    } catch (error) {
      console.error('Error adding new entry:', error);
    }
  }

  /**
   * Проверяет валидность записи о тренировке.
   * @param {Object} entry - Запись о тренировке.
   * @returns {boolean} Результат проверки.
   */
  isValidEntry(entry) {
    return entry && typeof entry.date === 'string' &&
      typeof entry.workout === 'string' &&
      typeof entry.duration === 'number' &&
      typeof entry.id === 'string';
  }

  /**
   * Создает новую запись о тренировке.
   * @returns {Object} Новая запись о тренировке.
   */
  createNewEntry() {
    const today = new Date();
    return {
      date: today.toISOString().split('T')[0],
      workout: 'walking',
      duration: 30,
      id: uuidv4(),
    };
  }
}

new WorkoutTracker();
