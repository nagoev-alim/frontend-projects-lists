import './style.css';
import { icons } from 'feather-icons';
import { v4 as uuidv4 } from 'uuid';

/**
 * Этот код представляет собой приложение для отслеживания тренировок.
 * Он позволяет пользователям добавлять, редактировать и удалять записи о тренировках,
 * включая дату, тип тренировки и продолжительность. Данные сохраняются в локальном хранилище браузера.
 */

/**
 * @interface Config
 * @description Интерфейс для конфигурации приложения
 */
interface Config {
  /** Корневой элемент приложения */
  root: string;
  /** Селекторы для основных элементов приложения */
  selectors: {
    [key: string]: string;
  };
}

/**
 * @constant APP_CONFIG
 * @description Конфигурация приложения
 */
const APP_CONFIG: Config = {
  root: '#app',
  selectors: {
    main: '[data-workout-main]',
    addEntry: '[data-workout-add]',
  },
};

/**
 * @interface Workout
 * @description Интерфейс для записи о тренировке
 */
interface Workout {
  /** Уникальный идентификатор тренировки */
  id: string;
  /** Дата тренировки */
  date: string;
  /** Тип тренировки */
  workout: string;
  /** Продолжительность тренировки в минутах */
  duration: number;
}

/**
 * @interface State
 * @description Интерфейс для состояния приложения
 */
interface State {
  /** Основные элементы DOM */
  elements: {
    /** Основной контейнер для записей */
    main: HTMLElement | null;
    /** Кнопка добавления новой записи */
    addEntry: HTMLElement | null;
  };
  /** Коллекция записей о тренировках */
  workoutsCollection: Workout[];
}

/**
 * @constant APP_STATE
 * @description Состояние приложения
 */
const APP_STATE: State = {
  elements: {
    main: null,
    addEntry: null,
  },
  workoutsCollection: [],
};

/**
 * @interface Utils
 * @description Интерфейс для вспомогательных функций
 */
interface Utils {
  /**
   * Функция для обработки data-атрибутов
   * @param element - Строка с именем data-атрибута
   * @returns Обработанная строка без квадратных скобок
   */
  renderDataAttributes: (element: string) => string;
}

/**
 * @constant APP_UTILS
 * @description Объект с вспомогательными функциями
 */
const APP_UTILS: Utils = {
  renderDataAttributes: (element) => element.slice(1, -1),
};

/**
 * Создает HTML-разметку для основного интерфейса приложения
 * @description Генерирует и вставляет HTML-структуру в корневой элемент приложения
 */
function createAppHTML(): void {
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
 * Инициализирует DOM-элементы приложения
 * @description Находит и сохраняет ссылки на основные элементы интерфейса в APP_STATE
 */
function initDOMElements(): void {
  APP_STATE.elements = {
    main: document.querySelector(APP_CONFIG.selectors.main),
    addEntry: document.querySelector(APP_CONFIG.selectors.addEntry),
  };
}

/**
 * Инициализирует приложение
 * @description Выполняет начальную настройку приложения, включая создание HTML,
 * инициализацию DOM-элементов, загрузку данных и установку обработчиков событий
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();
  APP_STATE.workoutsCollection = getLocalStorageData();
  updateView();
  APP_STATE.elements.addEntry?.addEventListener('click', handleAddEntryClick);
}

/**
 * Получает данные о тренировках из локального хранилища
 * @description Извлекает сохраненные данные о тренировках из localStorage браузера
 * @returns {Workout[]} Массив объектов Workout, представляющих тренировки
 * @throws {Error} Может выбросить ошибку при некорректных данных в localStorage
 */
function getLocalStorageData(): Workout[] {
  const workoutsItems = localStorage.getItem('workout');
  return workoutsItems ? JSON.parse(workoutsItems) : [];
}

/**
 * Сохраняет данные о тренировках в локальное хранилище браузера.
 * @description Преобразует текущую коллекцию тренировок в JSON-строку и сохраняет её в localStorage.
 * @throws {Error} Может выбросить ошибку при проблемах с доступом к localStorage или при ошибке сериализации.
 */
function setLocalStorageData(): void {
  try {
    localStorage.setItem('workout', JSON.stringify(APP_STATE.workoutsCollection));
  } catch (error) {
    console.error('Failed to save data to localStorage:', error);
  }
}

/**
 * Обновляет отображение списка тренировок в интерфейсе
 * @description Очищает текущее содержимое основного контейнера и заново отрисовывает
 * все записи о тренировках из коллекции APP_STATE.workoutsCollection.
 * Использует DocumentFragment для оптимизации производительности при вставке элементов.
 */
function updateView(): void {
  const { main } = APP_STATE.elements;
  if (!main) return;

  main.innerHTML = '';

  const fragment = document.createDocumentFragment();

  APP_STATE.workoutsCollection.forEach((entry) => {
    const row = createWorkoutRow(entry);
    fragment.appendChild(row);
  });

  main.appendChild(fragment);
}

/**
 * Создает и настраивает строку для отображения информации о тренировке
 * @param {Workout} entry - Объект с данными о тренировке
 * @returns {HTMLDivElement} Элемент div, представляющий строку с информацией о тренировке
 * @description Функция создает DOM-элемент для отображения данных о тренировке,
 * устанавливает начальные значения полей и добавляет обработчики событий.
 */
function createWorkoutRow(entry: Workout): HTMLDivElement {
  const row = document.createElement('div');
  row.classList.add('row', 'grid', 'grid-cols-3');

  row.innerHTML = createRowHTML(entry);

  const elements = getRowElements(row);

  setInitialValues(entry, elements as {
    fieldDate: HTMLInputElement;
    fieldSelect: HTMLSelectElement;
    fieldNumber: HTMLInputElement
  });
  addEventListeners(entry, elements as {
    fieldDate: HTMLInputElement;
    fieldSelect: HTMLSelectElement;
    fieldNumber: HTMLInputElement;
    buttonDelete: HTMLButtonElement
  });

  return row;
}

/**
 * Создает HTML-разметку для строки с информацией о тренировке
 * @param {Workout} entry - Объект с данными о тренировке
 * @returns {string} HTML-строка для отображения информации о тренировке
 * @description Генерирует HTML-разметку для отображения даты, типа и продолжительности тренировки,
 * а также кнопки удаления. Использует предопределенный список типов тренировок.
 */
function createRowHTML(entry: Workout): string {
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
 * Преобразует первую букву строки в заглавную
 * @param {string} str - Исходная строка
 * @returns {string} Строка с заглавной первой буквой
 * @description Функция берет первый символ строки, преобразует его в верхний регистр
 * и соединяет с остальной частью строки. Полезна для форматирования текста,
 * например, при отображении названий типов тренировок.
 */
function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Получает элементы строки тренировки
 * @param {HTMLElement} row - DOM-элемент строки тренировки
 * @returns {Record<string, HTMLElement | null>} Объект с найденными элементами строки
 * @description Функция ищет и возвращает ключевые элементы строки тренировки (поля ввода даты,
 * выбора типа тренировки, ввода продолжительности и кнопку удаления) используя селекторы.
 * Если элемент не найден, вместо него возвращается null.
 */
function getRowElements(row: HTMLElement): Record<string, HTMLElement | null> {
  const selectors: Record<string, string> = {
    fieldDate: '[type="date"]',
    fieldSelect: 'select',
    fieldNumber: '[type="number"]',
    buttonDelete: 'button',
  };

  return Object.fromEntries(
    Object.entries(selectors).map(([key, selector]) => [
      key,
      row.querySelector<HTMLElement>(selector) || null,
    ]),
  );
}

/**
 * Устанавливает начальные значения для полей ввода тренировки
 * @param {Workout} entry - Объект с данными о тренировке
 * @param {Object} fields - Объект с полями ввода
 * @param {HTMLInputElement} fields.fieldDate - Поле для ввода даты
 * @param {HTMLSelectElement} fields.fieldSelect - Поле для выбора типа тренировки
 * @param {HTMLInputElement} fields.fieldNumber - Поле для ввода продолжительности
 * @throws {Error} Выбрасывает ошибку, если поле не является элементом формы
 * @description Функция заполняет поля ввода значениями из объекта тренировки.
 * Она обрабатывает различные типы полей и преобразует значения в строки при необходимости.
 */
function setInitialValues(entry: Workout, { fieldDate, fieldSelect, fieldNumber }: {
  fieldDate: HTMLInputElement;
  fieldSelect: HTMLSelectElement;
  fieldNumber: HTMLInputElement;
}): void {
  const fieldsMap: Record<keyof Workout, HTMLInputElement | HTMLSelectElement | null> = {
    date: fieldDate,
    workout: fieldSelect,
    duration: fieldNumber,
    id: null,
  };

  Object.entries(fieldsMap).forEach(([key, field]) => {
    if (field && entry[key as keyof Workout] !== undefined) {
      if ('value' in field) {
        field.value = String(entry[key as keyof Workout]);
      } else {
        throw new Error(`Field ${key} is not a form element`);
      }
    }
  });
}

/**
 * Добавляет обработчики событий для элементов строки тренировки
 * @param {Workout} entry - Объект тренировки, к которому относятся поля ввода
 * @param {Object} fields - Объект, содержащий элементы формы
 * @param {HTMLInputElement} fields.fieldDate - Поле ввода даты
 * @param {HTMLSelectElement} fields.fieldSelect - Поле выбора типа тренировки
 * @param {HTMLInputElement} fields.fieldNumber - Поле ввода продолжительности
 * @param {HTMLButtonElement} fields.buttonDelete - Кнопка удаления записи
 * @description Функция устанавливает обработчики событий для полей ввода и кнопки удаления.
 * Она реагирует на изменения в полях и обновляет данные тренировки, а также
 * обрабатывает клик по кнопке удаления для удаления записи.
 */
function addEventListeners(entry: Workout, {
  fieldDate,
  fieldSelect,
  fieldNumber,
  buttonDelete,
}: {
  fieldDate: HTMLInputElement;
  fieldSelect: HTMLSelectElement;
  fieldNumber: HTMLInputElement;
  buttonDelete: HTMLButtonElement;
}): void {
  const fieldListeners: Array<{ field: HTMLInputElement | HTMLSelectElement; key: keyof Workout }> = [
    { field: fieldDate, key: 'date' },
    { field: fieldSelect, key: 'workout' },
    { field: fieldNumber, key: 'duration' },
  ];

  fieldListeners.forEach(({ field, key }) => {
    field.addEventListener('change', (event: Event) => {
      const target = event.target as HTMLInputElement | HTMLSelectElement;
      updateEntry(entry, key, target.value);
    });
  });

  buttonDelete.addEventListener('click', (event: MouseEvent) => {
    const target = event.currentTarget as HTMLElement;
    if (target.dataset.id) {
      deleteEntry(target.dataset.id);
    }
  });
}

/**
 * Обновляет данные тренировки в коллекции
 * @param {Workout} entry - Объект тренировки для обновления
 * @param {keyof Workout} field - Ключ поля, которое нужно обновить
 * @param {string} value - Новое значение для поля
 * @description Функция обновляет указанное поле в объекте тренировки.
 * Если поле 'duration', значение преобразуется в число.
 * После обновления, данные сохраняются в локальное хранилище и обновляется представление.
 */
function updateEntry(entry: Workout, field: keyof Workout, value: string): void {
  if (entry[field] !== value) {
    if (field === 'duration') {
      entry[field] = Number(value);
    } else {
      (entry[field] as string) = value;
    }
    setLocalStorageData();
    updateView();
  }
}

/**
 * Удаляет запись о тренировке из коллекции
 * @param {string} rowID - Уникальный идентификатор записи для удаления
 * @description Функция запрашивает подтверждение у пользователя, затем удаляет запись
 * с указанным ID из коллекции тренировок. После удаления обновляет локальное хранилище
 * и представление на странице.
 * @throws {Error} Может выбросить ошибку при проблемах с доступом к локальному хранилищу
 */
function deleteEntry(rowID: string): void {
  if (!confirm('Are you sure you want to remove this?')) return;

  APP_STATE.workoutsCollection = APP_STATE.workoutsCollection.filter(({ id }) => id !== rowID);

  setLocalStorageData();
  updateView();
}

/**
 * Обрабатывает нажатие на кнопку добавления новой записи о тренировке.
 * @description Создает новую запись о тренировке, проверяет её валидность,
 * добавляет в коллекцию тренировок, сохраняет в локальное хранилище и обновляет отображение.
 * @throws {Error} Выбрасывает ошибку, если данные новой записи невалидны.
 */
function handleAddEntryClick(): void {
  try {
    const newEntry: Workout = createNewEntry();
    if (!isValidEntry(newEntry)) {
      throw new Error('Invalid entry data');
    }

    APP_STATE.workoutsCollection.push(newEntry);
    setLocalStorageData();
    updateView();
  } catch (error: unknown) {
    console.error('Error adding new entry:', error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Проверяет, является ли переданный объект валидной записью о тренировке.
 * @param {unknown} entry - Объект для проверки
 * @returns {boolean} true, если объект является валидной записью о тренировке, иначе false
 * @description Функция проверяет наличие всех необходимых полей и их типы.
 * Использует оператор type guard для TypeScript.
 */
function isValidEntry(entry: unknown): entry is Workout {
  return !!entry &&
    typeof (entry as Workout).date === 'string' &&
    typeof (entry as Workout).workout === 'string' &&
    typeof (entry as Workout).duration === 'number' &&
    typeof (entry as Workout).id === 'string';
}

/**
 * Создает новую запись о тренировке с значениями по умолчанию.
 * @returns {Workout} Новый объект тренировки
 * @description Функция генерирует новую запись о тренировке с текущей датой,
 * стандартным типом тренировки 'walking', продолжительностью 30 минут и уникальным ID.
 */
function createNewEntry(): Workout {
  const today = new Date();
  return {
    date: today.toISOString().split('T')[0],
    workout: 'walking',
    duration: 30,
    id: uuidv4(),
  };
}

initApp();
