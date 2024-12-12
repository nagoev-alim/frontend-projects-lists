/**
 * Этот код реализует приложение для поиска информации о штатах США.
 * Пользователь может ввести название или аббревиатуру штата, и приложение
 * отобразит соответствующую информацию, включая столицу и координаты.
 */

import './style.css';
import mockData from './mock.json';

/**
 * Интерфейс, представляющий информацию о штате.
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
 * Интерфейс для конфигурации приложения.
 */
interface Config {
  /** Селектор корневого элемента */
  root: string;
  /** Селекторы для элементов ввода и списка результатов */
  selectors: {
    stateInput: string;
    resultsList: string;
  };
}

/**
 * Интерфейс для состояния приложения.
 */
interface AppState {
  /** DOM элементы */
  elements: {
    stateInput: HTMLInputElement | null;
    resultsList: HTMLUListElement | null;
  };
  /** Массив совпадений при поиске */
  matches: State[];
}

/**
 * Интерфейс для утилит приложения.
 */
interface Utils {
  /** Функция для рендеринга data-атрибутов */
  renderDataAttributes: (element: string) => string;
  /** Функция для реализации debounce */
  debounce: <T extends (...args: any[]) => void>(func: T, delay: number) => (...args: Parameters<T>) => void;
}

/**
 * Класс, представляющий приложение для поиска информации о столицах штатов.
 */
class StateCapitalLookup {
  /** Конфигурация приложения */
  private readonly config: Config;
  /** Состояние приложения */
  private state: AppState;
  /** Утилиты приложения */
  private readonly utils: Utils;

  /**
   * Создает экземпляр приложения StateCapitalLookup.
   */
  constructor() {
    this.config = {
      root: '#app',
      selectors: {
        stateInput: '[data-state-input]',
        resultsList: '[data-results-list]',
      },
    };

    this.state = {
      elements: {
        stateInput: null,
        resultsList: null,
      },
      matches: [],
    };

    this.utils = {
      renderDataAttributes: (element: string): string => element.slice(1, -1),
      debounce: <T extends (...args: any[]) => void>(func: T, delay: number): (...args: Parameters<T>) => void => {
        let timeoutId: NodeJS.Timeout;
        return (...args: Parameters<T>): void => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
      },
    };

    this.init();
  }

  /**
   * Создает HTML структуру приложения.
   */
  private createAppHTML(): void {
    const { root, selectors: { stateInput, resultsList } } = this.config;
    const { renderDataAttributes } = this.utils;
    const rootElement = document.querySelector(root);

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
   * Инициализирует DOM элементы.
   */
  private initDOMElements(): void {
    this.state.elements = {
      stateInput: document.querySelector<HTMLInputElement>(this.config.selectors.stateInput),
      resultsList: document.querySelector<HTMLUListElement>(this.config.selectors.resultsList),
    };
  }

  /**
   * Инициализирует приложение.
   */
  private init(): void {
    this.createAppHTML();
    this.initDOMElements();

    this.state.elements.stateInput?.addEventListener('input', this.utils.debounce(this.handleStateInputChange.bind(this), 300));
  }

  /**
   * Обрабатывает изменение ввода в поле поиска.
   * @param event - Событие ввода
   */
  private handleStateInputChange(event: Event): void {
    const { value } = event.target as HTMLInputElement;
    const searchValue = value.toLowerCase();
    this.state.matches = searchValue
      ? (mockData as State[]).filter(({ name, abbr }) => {
        const regex = new RegExp(`^${searchValue}`, 'i');
        return regex.test(name.toLowerCase()) || regex.test(abbr.toLowerCase());
      })
      : [];

    this.updateResultsList(searchValue);
  }

  /**
   * Обновляет список результатов.
   * @param searchValue - Введенное значение поиска
   */
  private updateResultsList(searchValue: string): void {
    if (this.state.matches.length > 0) {
      if (this.state.elements.resultsList) {
        this.state.elements.resultsList.innerHTML = this.state.matches.map(this.createListItem).join('');
      }
    } else {
      if (this.state.elements.resultsList) {
        this.state.elements.resultsList.innerHTML = searchValue
          ? `<li class='text-center font-bold'>No matches</li>`
          : '';
      }
    }
  }

  /**
   * Создает элемент списка для отображения информации о штате.
   * @param state - Объект с информацией о штате
   * @returns HTML строка для элемента списка
   */
  private createListItem({ name, abbr, capital, lat, long }: State): string {
    return `
    <li class='border-2 bg-gray-50 rounded grid place-items-center p-3 text-center gap-1.5'>
      <h5 class='font-bold'>${name} (${abbr}):</h5>
      <div class='grid gap-1.5'>
        <p>${capital}</p>
        <p>Lat: ${lat} / Long: ${long}</p>
      </div>
    </li>`;
  }
}

new StateCapitalLookup();