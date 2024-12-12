import './style.css';

/**
 * @fileoverview Этот файл содержит реализацию выпадающего списка (dropdown).
 * Он создает интерактивный dropdown элемент, который можно открывать и закрывать.
 * Dropdown заполняется данными из предопределенного массива и управляется кликами пользователя.
 */

/**
 * @interface Config
 * @description Конфигурация для dropdown компонента
 */
interface Config {
  /** Селектор корневого элемента */
  root: string;
  /** Объект с селекторами для различных элементов dropdown */
  selectors: {
    [key: string]: string;
  };
  /** Массив элементов для dropdown */
  mock: Array<{ ico: string; label: string }>;
}

/**
 * @interface State
 * @description Состояние dropdown компонента
 */
interface State {
  /** Объект с DOM элементами dropdown */
  elements: {
    [key: string]: HTMLElement | null
  };
}

/**
 * @class DropDown
 * @description Класс, реализующий функциональность выпадающего списка
 */
class DropDown {
  /** @private Конфигурация компонента */
  private readonly config: Config;
  /** @private Состояние компонента */
  private state: State;

  /**
   * @constructor
   * Инициализирует dropdown компонент
   */
  constructor() {
    this.config = {
      root: '#app',
      selectors: {
        dropdownToggle: '[data-dropdown-toggle]',
        dropdownMenu: '[data-dropdown-menu]',
      },
      mock: [
        { ico: `<i class='bx bx-plus-circle'></i>`, label: 'Create New' },
        { ico: `<i class='bx bx-book'></i>`, label: 'All Drafts' },
        { ico: `<i class='bx bx-folder'></i>`, label: 'Move To' },
        { ico: `<i class='bx bx-user'></i>`, label: 'Profile Settings' },
        { ico: `<i class='bx bx-bell'></i>`, label: 'Notification' },
        { ico: `<i class='bx bx-cog'></i>`, label: 'Settings' },
      ],
    };

    this.state = {
      elements: {
        dropdownToggle: null,
        dropdownMenu: null,
      },
    };

    this.init();
  }

  /**
   * @private
   * @method createAppHTML
   * @description Создает HTML структуру для dropdown
   */
  private createAppHTML():void {
    const {
      root,
      selectors: { dropdownToggle, dropdownMenu },
    } = this.config;
    const rootElement = document.querySelector(root);

    if (!rootElement) return;

    rootElement.innerHTML = `
    <div class='grid w-full max-w-md gap-4 rounded border bg-white p-3 shadow'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'></h1>
      <div class='components'>
        <div class='component01'>
          <div class='dropdown'>
            <button class='dropdown__trigger' ${this.renderDataAttributes(dropdownToggle)}>
              Dropdown
              <i class='bx bx-chevron-down'></i>
            </button>
            <ul class='dropdown__list' ${this.renderDataAttributes(dropdownMenu)}>
              ${this.config.mock.map(
      ({ ico, label }) => `
                <li class='dropdown__item'>
                  <a href='#' class='dropdown__link'>${ico} ${label}</a>
                </li>
              `,
    ).join('')}
            </ul>
          </div>
        </div>
      </div>
    </div>
  `;
  }

  /**
   * @private
   * @method initDOMElements
   * @description Инициализирует DOM элементы dropdown
   */
  private initDOMElements():void {
    this.state.elements = {
      dropdownToggle: document.querySelector(this.config.selectors.dropdownToggle),
      dropdownMenu: document.querySelector(this.config.selectors.dropdownMenu),
    };
  }

  /**
   * @private
   * @method init
   * @description Инициализирует компонент
   */
  private init():void {
    this.createAppHTML();
    this.initDOMElements();
    this.state.elements.dropdownToggle?.addEventListener('click', this.toggleDropdown.bind(this));
    document.documentElement.addEventListener('click', this.closeDropdownIfOpen.bind(this));
  }

  /**
   * @private
   * @method toggleDropdown
   * @description Переключает состояние dropdown (открыт/закрыт)
   */
  private toggleDropdown():void {
    const { dropdownMenu, dropdownToggle } = this.state.elements;
    if (!dropdownMenu || !dropdownToggle) return;
    dropdownMenu.classList.toggle('show');
    dropdownToggle.querySelector('i')?.classList.toggle('arrow');
  }

  /**
   * @private
   * @method closeDropdownIfOpen
   * @param {Event} event - Событие клика
   * @description Закрывает dropdown, если клик был вне его области
   */
  private closeDropdownIfOpen(event: Event): void {
    if (!(event.target instanceof Element)) return;

    const isClickOutsideDropdown = !event.target.matches(this.config.selectors.dropdownToggle);
    const isDropdownOpen = this.state.elements.dropdownMenu?.classList.contains('show');

    if (isClickOutsideDropdown && isDropdownOpen) {
      this.toggleDropdown();
    }
  }

  /**
   * @private
   * @method renderDataAttributes
   * @param {string} element - Строка с data-атрибутом
   * @returns {string} Обработанная строка data-атрибута
   * @description Обрабатывает строку с data-атрибутом
   */
  private renderDataAttributes(element: string): string {
    return element.slice(1, -1);
  }
}

new DropDown();
