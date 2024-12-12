/**
 * Этот код реализует приложение для поиска информации о штатах США.
 * Пользователь может ввести название или аббревиатуру штата, и приложение
 * отобразит соответствующую информацию, включая столицу и координаты.
 */

import './style.css';
import mockData from './mock.json';

/**
 * Интерфейс, описывающий структуру данных штата
 * @interface
 */
interface State {
  /** Название штата */
  name: string;
  /** Аббревиатура штата */
  abbr: string;
  /** Столица штата */
  capital: string;
  /** Широта */
  lat: number;
  /** Долгота */
  long: number;
}

/**
 * Интерфейс для конфигурации приложения
 * @interface
 */
interface AppConfig {
  /** Селектор корневого элемента */
  root: string;
  /** Объект с селекторами элементов */
  selectors: {
    /** Селектор поля ввода */
    stateInput: string;
    /** Селектор списка результатов */
    resultsList: string;
  };
}

/**
 * Интерфейс для состояния приложения
 * @interface
 */
interface AppState {
  /** Объект с DOM элементами */
  elements: {
    /** Элемент поля ввода */
    stateInput: HTMLInputElement | null;
    /** Элемент списка результатов */
    resultsList: HTMLUListElement | null;
  };
  /** Массив совпадений при поиске */
  matches: State[];
}

/**
 * Интерфейс для утилит приложения
 * @interface
 */
interface AppUtils {
  /** Функция для рендеринга data-атрибутов */
  renderDataAttributes: (element: string) => string;
  /** Функция для debounce */
  debounce: <T extends (...args: any[]) => void>(func: T, delay: number) => (...args: Parameters<T>) => void;
}

/**
 * Конфигурация приложения
 * @constant
 */
const APP_CONFIG: AppConfig = {
  root: '#app',
  selectors: {
    stateInput: '[data-state-input]',
    resultsList: '[data-results-list]',
  },
};

/**
 * Состояние приложения
 * @constant
 */
const APP_STATE: AppState = {
  elements: {
    stateInput: null,
    resultsList: null,
  },
  matches: [],
};

/**
 * Утилиты приложения
 * @constant
 */
const APP_UTILS: AppUtils = {
  /**
   * Рендерит data-атрибуты
   * @param {string} element - Строка с data-атрибутом
   * @returns {string} Отрендеренный data-атрибут
   */
  renderDataAttributes: (element: string): string => element.slice(1, -1),

  /**
   * Реализует debounce для функции
   * @param {Function} func - Функция для debounce
   * @param {number} delay - Задержка в миллисекундах
   * @returns {Function} Функция с debounce
   */
  debounce: <T extends (...args: any[]) => void>(func: T, delay: number): (...args: Parameters<T>) => void => {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  },
};

/**
 * Создает HTML структуру приложения
 */
function createAppHTML(): void {
  const { root, selectors: { stateInput, resultsList } } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector<HTMLElement>(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='w-full max-w-md grid gap-4 rounded border bg-white p-3 shadow'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>State Capital Lookup</h1>
      <input
        class='rounded border-2 bg-slate-50 px-3 py-2.5 focus:border-blue-400 focus:outline-none'
        type='text'
        placeholder='Enter state name or abbreviation...'
        ${renderDataAttributes(stateInput)}
      >
      <ul class='grid gap-3' ${renderDataAttributes(resultsList)}></ul>
    </div>
  `;
}

/**
 * Инициализирует DOM элементы
 */
function initDOMElements(): void {
  APP_STATE.elements = {
    stateInput: document.querySelector<HTMLInputElement>(APP_CONFIG.selectors.stateInput),
    resultsList: document.querySelector<HTMLUListElement>(APP_CONFIG.selectors.resultsList),
  };
}

/**
 * Инициализирует приложение
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();

  if (APP_STATE.elements.stateInput) {
    APP_STATE.elements.stateInput.addEventListener("input", APP_UTILS.debounce(handleStateInputChange, 300));
  }
}

/**
 * Обрабатывает изменение ввода в поле поиска
 * @param {Event} event - Событие ввода
 */
function handleStateInputChange(event: Event): void {
  const target = event.target as HTMLInputElement;
  const searchValue = target.value.toLowerCase();
  APP_STATE.matches = searchValue
    ? mockData.filter(({ name, abbr }: State) => {
      const regex = new RegExp(`^${searchValue}`, "i");
      return regex.test(name.toLowerCase()) || regex.test(abbr.toLowerCase());
    })
    : [];

  updateResultsList(searchValue);
}

/**
 * Обновляет список результатов
 * @param {string} searchValue - Введенное значение поиска
 */
function updateResultsList(searchValue: string): void {
  if (!APP_STATE.elements.resultsList) return;

  if (APP_STATE.matches.length > 0) {
    APP_STATE.elements.resultsList.innerHTML = APP_STATE.matches.map(createListItem).join("");
  } else {
    APP_STATE.elements.resultsList.innerHTML = searchValue
      ? `<li class='text-center font-bold'>No matches</li>`
      : "";
  }
}

/**
 * Создает элемент списка для отображения информации о штате
 * @param {State} state - Объект с информацией о штате
 * @returns {string} HTML строка для элемента списка
 */
function createListItem({ name, abbr, capital, lat, long }: State): string {
  return `
    <li class='border-2 bg-gray-50 rounded grid place-items-center p-3 text-center gap-1.5'>
      <h5 class='font-bold'>${name} (${abbr}):</h5>
      <div class='grid gap-1.5'>
        <p>${capital}</p>
        <p>Lat: ${lat} / Long: ${long}</p>
      </div>
    </li>`;
}

initApp();