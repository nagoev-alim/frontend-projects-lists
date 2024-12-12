import './style.css';
import { icons } from 'feather-icons';
import { v4 as uuidv4 } from 'uuid';

/**
 * Конфигурация приложения.
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента приложения.
 * @property {Object} selectors - Объект с селекторами элементов.
 * @property {string} selectors.main - Селектор основного контейнера.
 * @property {string} selectors.addEntry - Селектор кнопки добавления записи.
 */

/**
 * @type {AppConfig}
 */
const APP_CONFIG = {
  root: '#app',
  selectors: {
    main: '[data-workout-main]',
    addEntry: '[data-workout-add]',
  },
};

/**
 * Состояние приложения.
 * @typedef {Object} AppState
 * @property {Object} elements - Объект с DOM элементами.
 * @property {HTMLElement|null} elements.main - Основной контейнер.
 * @property {HTMLElement|null} elements.addEntry - Кнопка добавления записи.
 * @property {Array} workoutsCollection - Коллекция тренировок.
 */

/**
 * @type {AppState}
 */
const APP_STATE = {
  elements: {
    main: null,
    addEntry: null,
  },
  workoutsCollection: [],
};

/**
 * Утилиты приложения.
 * @typedef {Object} AppUtils
 * @property {Function} renderDataAttributes - Функция для обработки data-атрибутов.
 */

/**
 * @type {AppUtils}
 */
const APP_UTILS = {
  /**
   * Обрабатывает строку с data-атрибутом, удаляя квадратные скобки.
   * @param {string} element - Строка с data-атрибутом.
   * @returns {string} Обработанная строка без квадратных скобок.
   */
  renderDataAttributes: (element) => element.slice(1, -1),
};

/**
 * Создает HTML-структуру приложения и вставляет ее в корневой элемент.
 * @function
 */
function createAppHTML() {
  const { root, selectors: { main, addEntry } } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
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
 * Инициализирует DOM-элементы приложения.
 * @function
 */
function initDOMElements() {
  APP_STATE.elements = {
    main: document.querySelector(APP_CONFIG.selectors.main),
    addEntry: document.querySelector(APP_CONFIG.selectors.addEntry),
  };
}

/**
 * Инициализирует приложение.
 * @function
 */
function initApp() {
  createAppHTML();
  initDOMElements();
  APP_STATE.workoutsCollection = getLocalStorageData();
  updateView();
  APP_STATE.elements.addEntry.addEventListener('click', handleAddEntryClick);
}

/**
 * Получает данные о тренировках из локального хранилища.
 * @function
 * @returns {Array} Массив тренировок или пустой массив, если данных нет.
 */
function getLocalStorageData() {
  return JSON.parse(localStorage.getItem('workout')) || [];
}

/**
 * Сохраняет данные о тренировках в локальное хранилище.
 * @function
 */
function setLocalStorageData() {
  localStorage.setItem('workout', JSON.stringify(APP_STATE.workoutsCollection));
}

/**
 * Обновляет отображение списка тренировок в пользовательском интерфейсе.
 * Очищает существующее содержимое основного контейнера и заполняет его
 * новыми строками для каждой тренировки из коллекции.
 *
 * @function
 */
function updateView() {
  const { main } = APP_STATE.elements;
  main.innerHTML = '';

  const fragment = document.createDocumentFragment();

  APP_STATE.workoutsCollection.forEach((entry) => {
    const row = createWorkoutRow(entry);
    fragment.appendChild(row);
  });

  main.appendChild(fragment);
}

/**
 * Создает и настраивает строку для отображения информации о тренировке.
 *
 * @function
 * @param {Object} entry - Объект с данными о тренировке.
 * @param {string} entry.id - Уникальный идентификатор тренировки.
 * @param {string} entry.date - Дата тренировки.
 * @param {string} entry.workout - Тип тренировки.
 * @param {number} entry.duration - Продолжительность тренировки в минутах.
 * @returns {HTMLElement} Элемент div, представляющий строку с информацией о тренировке.
 */
function createWorkoutRow(entry) {
  const row = document.createElement('div');
  row.classList.add('row', 'grid', 'grid-cols-3');

  row.innerHTML = createRowHTML(entry);

  const elements = getRowElements(row);

  setInitialValues(entry, elements);
  addEventListeners(entry, elements);

  return row;
}

/**
 * Создает HTML-разметку для строки с информацией о тренировке.
 *
 * @function
 * @param {Object} entry - Объект с данными о тренировке.
 * @param {string} entry.id - Уникальный идентификатор тренировки.
 * @returns {string} HTML-разметка для строки тренировки.
 */
function createRowHTML(entry) {
  const options = [
    'walking',
    'running',
    'outdoor-cycling',
    'indoor-cycling',
    'swimming',
    'yoga',
  ];

  const optionsHTML = options
    .map(option => `<option value="${option}">${capitalizeFirstLetter(option)}</option>`)
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
 * Преобразует первую букву строки в заглавную.
 *
 * @function
 * @param {string} str - Исходная строка.
 * @returns {string} Строка с заглавной первой буквой.
 */
function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Получает элементы строки тренировки.
 *
 * @function
 * @param {HTMLElement} row - DOM-элемент строки тренировки.
 * @returns {Object} Объект с элементами строки тренировки.
 * @property {HTMLInputElement} fieldDate - Поле ввода даты.
 * @property {HTMLSelectElement} fieldSelect - Поле выбора типа тренировки.
 * @property {HTMLInputElement} fieldNumber - Поле ввода продолжительности.
 * @property {HTMLButtonElement} buttonDelete - Кнопка удаления записи.
 */
function getRowElements(row) {
  const selectors = {
    fieldDate: '[type="date"]',
    fieldSelect: 'select',
    fieldNumber: '[type="number"]',
    buttonDelete: 'button',
  };

  /**
   * Преобразует объект селекторов в объект DOM-элементов.
   *
   * @param {Object} selectors - Объект с селекторами элементов.
   * @param {HTMLElement} row - DOM-элемент строки, в котором производится поиск.
   * @returns {Object} Объект, где ключи - имена селекторов, а значения - найденные DOM-элементы.
   */
  return Object.fromEntries(
    Object.entries(selectors).map(([key, selector]) => [
      key,
      row.querySelector(selector) || null,
    ]),
  );
}

/**
 * Устанавливает начальные значения для полей ввода тренировки.
 *
 * @function
 * @param {Object} entry - Объект с данными о тренировке.
 * @param {string} entry.date - Дата тренировки.
 * @param {string} entry.workout - Тип тренировки.
 * @param {number} entry.duration - Продолжительность тренировки.
 * @param {Object} fields - Объект с DOM-элементами полей ввода.
 * @param {HTMLInputElement} fields.fieldDate - Поле ввода даты.
 * @param {HTMLSelectElement} fields.fieldSelect - Поле выбора типа тренировки.
 * @param {HTMLInputElement} fields.fieldNumber - Поле ввода продолжительности.
 */
function setInitialValues(entry, { fieldDate, fieldSelect, fieldNumber }) {
  const fieldsMap = {
    date: fieldDate,
    workout: fieldSelect,
    duration: fieldNumber,
  };

  /**
   * Устанавливает значения полей ввода на основе данных о тренировке.
   *
   * @param {Object} fieldsMap - Объект, сопоставляющий ключи entry с полями ввода.
   * @param {Object} entry - Объект с данными о тренировке.
   * @throws {Error} Выбрасывает ошибку, если field не является элементом формы.
   */
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
 * Добавляет обработчики событий к полям ввода и кнопке удаления для записи тренировки.
 *
 * @function
 * @param {Object} entry - Объект с данными о тренировке.
 * @param {Object} fields - Объект с DOM-элементами полей ввода и кнопкой удаления.
 * @param {HTMLInputElement} fields.fieldDate - Поле ввода даты.
 * @param {HTMLSelectElement} fields.fieldSelect - Поле выбора типа тренировки.
 * @param {HTMLInputElement} fields.fieldNumber - Поле ввода продолжительности.
 * @param {HTMLButtonElement} fields.buttonDelete - Кнопка удаления записи.
 */
function addEventListeners(entry, { fieldDate, fieldSelect, fieldNumber, buttonDelete }) {
  const fieldListeners = [
    { field: fieldDate, key: 'date' },
    { field: fieldSelect, key: 'workout' },
    { field: fieldNumber, key: 'duration' },
  ];

  fieldListeners.forEach(({ field, key }) => {
    if (field instanceof HTMLElement) {
      field.addEventListener('change', (event) => {
        if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) {
          updateEntry(entry, key, event.target.value);
        }
      });
    }
  });

  if (buttonDelete instanceof HTMLButtonElement) {
    buttonDelete.addEventListener('click', (event) => {
      if (event.target instanceof HTMLElement && event.target.dataset.id) {
        deleteEntry(event.target.dataset.id);
      }
    });
  }
}

/**
 * Обновляет запись о тренировке и, если значение изменилось, обновляет локальное хранилище и представление.
 *
 * @function
 * @param {Object} entry - Объект записи о тренировке.
 * @param {string} field - Название поля для обновления ('date', 'workout', или 'duration').
 * @param {string|number} value - Новое значение для указанного поля.
 */
function updateEntry(entry, field, value) {
  if (entry[field] !== value) {
    if (field === 'duration') {
      entry[field] = Number(value);
    } else {
      entry[field] = value;
    }
    setLocalStorageData();
    updateView();
  }
}

/**
 * Удаляет запись о тренировке из коллекции.
 *
 * @function
 * @param {string} rowID - Уникальный идентификатор записи для удаления.
 * @throws {Error} Выбрасывает ошибку, если rowID не является строкой.
 */
function deleteEntry(rowID) {
  if (typeof rowID !== 'string') {
    throw new Error('rowID must be a string');
  }

  if (!confirm('Are you sure you want to remove this?')) return;

  APP_STATE.workoutsCollection = APP_STATE.workoutsCollection.filter(({ id }) => id !== rowID);

  setLocalStorageData();
  updateView();
}

/**
 * Обрабатывает событие клика по кнопке добавления новой записи о тренировке.
 * Создает новую запись, добавляет ее в коллекцию тренировок,
 * обновляет локальное хранилище и представление.
 *
 * @function
 * @throws {Error} Может выбросить ошибку, если createNewEntry() вернет невалидные данные.
 */
function handleAddEntryClick() {
  try {
    const newEntry = createNewEntry();
    if (!isValidEntry(newEntry)) {
      throw new Error('Invalid entry data');
    }

    APP_STATE.workoutsCollection.push(newEntry);
    setLocalStorageData();
    updateView();
  } catch (error) {
    console.error('Error adding new entry:', error);
  }
}

/**
 * Проверяет валидность новой записи о тренировке.
 *
 * @function
 * @param {Object} entry - Объект с данными о тренировке.
 * @returns {boolean} True, если запись валидна, иначе false.
 */
function isValidEntry(entry) {
  return entry && typeof entry.date === 'string' &&
    typeof entry.workout === 'string' &&
    typeof entry.duration === 'number' &&
    typeof entry.id === 'string';
}

/**
 * Создает новую запись о тренировке с текущей датой и предустановленными значениями.
 *
 * @function
 * @returns {Object} Новый объект записи о тренировке.
 * @property {string} date - Текущая дата в формате 'YYYY-MM-DD'.
 * @property {string} workout - Тип тренировки (по умолчанию 'walking').
 * @property {number} duration - Продолжительность тренировки в минутах (по умолчанию 30).
 * @property {string} id - Уникальный идентификатор записи.
 */
function createNewEntry() {
  const today = new Date();
  return {
    date: today.toISOString().split('T')[0],
    workout: 'walking',
    duration: 30,
    id: uuidv4(),
  };
}


initApp();
