/**
 * Этот модуль реализует функциональность модального окна.
 * Он включает в себя создание HTML-структуры, управление состоянием модального окна,
 * обработку событий открытия/закрытия и инициализацию приложения.
 */

import './style.css';
import { icons } from 'feather-icons';

/**
 * Интерфейс для конфигурации модального окна
 */
interface Config {
  /** Селектор корневого элемента */
  root: string;
  /** Объект с селекторами элементов модального окна */
  selectors: {
    /** Селектор для открытия модального окна */
    modalOpen: string;
    /** Селектор оверлея модального окна */
    modalOverlay: string;
    /** Селектор содержимого модального окна */
    modalContent: string;
    /** Селектор для закрытия модального окна */
    modalClose: string;
  };
  /** Класс для скрытия элементов */
  hiddenClass: string;
}

/**
 * Интерфейс для состояния модального окна
 */
interface State {
  /** Объект с элементами DOM */
  elements: {
    /** Элемент оверлея модального окна */
    modalOverlay: HTMLElement | null;
  };
}

/**
 * Класс, реализующий функциональность модального окна
 */
class ModalWindow {
  /** Конфигурация модального окна */
  private readonly config: Config;
  /** Состояние модального окна */
  private state: State;
  /** Утилиты для работы с модальным окном */
  private readonly utils: {
    /** Функция для рендеринга data-атрибутов */
    renderDataAttributes: (element: string) => string;
  };

  /**
   * Создает экземпляр ModalWindow
   */
  constructor() {
    this.config = {
      root: '#app',
      selectors: {
        modalOpen: '[data-modal-open]',
        modalOverlay: '[data-modal-overlay]',
        modalContent: '[data-modal-content]',
        modalClose: '[data-modal-close]',
      },
      hiddenClass: 'hidden',
    };

    this.state = {
      elements: {
        modalOverlay: null,
      },
    };

    this.utils = {
      renderDataAttributes: (element: string): string => element.slice(1, -1),
    };

    this.init();
  }

  /**
   * Создает HTML-структуру приложения
   */
  private createAppHTML(): void {
    const {
      root,
      selectors: { modalOpen, modalOverlay, modalContent, modalClose },
    } = this.config;
    const { renderDataAttributes } = this.utils;
    const rootElement: HTMLElement | null = document.querySelector(root);

    if (!rootElement) return;

    rootElement.innerHTML = `
     <div class='border shadow rounded max-w-md w-full p-3 grid gap-4'>
      <h1 class='text-center font-bold text-2xl md:text-4xl'>Modal Window</h1>
      <div class='text-center'>
        <button class='border max-w-max p-2' ${renderDataAttributes(modalOpen)}>Open Modal</button>
      </div>
      <div class='fixed bg-neutral-900/50 top-0 left-0 w-full h-full grid place-items-center p-3 hidden' ${renderDataAttributes(modalOverlay)}>
        <section class='bg-white p-4 rounded max-w-md relative grid gap-4' ${renderDataAttributes(modalContent)}>
          <button class='absolute top-2 right-2' ${renderDataAttributes(modalClose)}>
            <span class='pointer-events-none'>${icons.x.toSvg()}</span>
          </button>
          <h2 class='text-2xl font-bold'>Title</h2>
          <p>"It's only after we've lost everything that we're free to do anything."― Chuck Palahniuk, Fight Club</p>
          <button class='border max-w-max p-2' ${renderDataAttributes(modalClose)}>Close Modal</button>
        </section>
      </div>
    </div>
    `;
  }

  /**
   * Инициализирует DOM-элементы
   */
  private initDOMElements(): void {
    this.state.elements = {
      modalOverlay: document.querySelector(this.config.selectors.modalOverlay),
    };
  }

  /**
   * Инициализирует приложение
   */
  private init(): void {
    this.createAppHTML();
    this.initDOMElements();

    document.addEventListener('click', this.handleModalClick.bind(this));
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  /**
   * Открывает модальное окно
   */
  private openModal(): void {
    this.state.elements.modalOverlay?.classList.remove(this.config.hiddenClass);
  }

  /**
   * Закрывает модальное окно
   */
  private closeModal(): void {
    this.state.elements.modalOverlay?.classList.add(this.config.hiddenClass);
  }

  /**
   * Обрабатывает клики для открытия/закрытия модального окна
   * @param {MouseEvent} event - Событие клика
   */
  private handleModalClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.matches(this.config.selectors.modalOpen)) {
      this.openModal();
    } else if (
      target.matches(this.config.selectors.modalClose) ||
      (target.matches(this.config.selectors.modalOverlay) &&
        !target.closest(this.config.selectors.modalContent))
    ) {
      this.closeModal();
    }
  }

  /**
   * Обрабатывает нажатия клавиш для закрытия модального окна
   * @param {KeyboardEvent} event - Событие нажатия клавиши
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeModal();
    }
  }
}

new ModalWindow();