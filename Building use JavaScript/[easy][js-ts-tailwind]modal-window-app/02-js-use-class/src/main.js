/**
 * Этот модуль реализует функциональность модального окна.
 * Он включает в себя создание HTML-структуры, управление состоянием модального окна,
 * обработку событий открытия/закрытия и инициализацию приложения.
 * Класс ModalWindow инкапсулирует всю логику работы с модальным окном.
 */

import './style.css';
import { icons } from 'feather-icons';

/**
 * Класс, реализующий функциональность модального окна
 */
class ModalWindow {
  /**
   * Создает экземпляр ModalWindow
   */
  constructor() {
    /**
     * Конфигурация модального окна
     * @type {Object}
     */
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

    /**
     * Состояние модального окна
     * @type {Object}
     */
    this.state = {
      elements: {
        modalOverlay: null,
      },
    };

    /**
     * Утилиты для работы с модальным окном
     * @type {Object}
     */
    this.utils = {
      /**
       * Преобразует строку с data-атрибутом в формат для использования в HTML
       * @param {string} element - Строка с data-атрибутом
       * @returns {string} Отформатированная строка атрибута
       */
      renderDataAttributes: (element) => element.slice(1, -1),
    };

    this.init();
  }

  /**
   * Создает HTML-структуру приложения
   */
  createAppHTML() {
    const {
      root, selectors: {
        modalOpen,
        modalOverlay,
        modalContent,
        modalClose,
      },
    } = this.config;
    const { renderDataAttributes } = this.utils;
    const rootElement = document.querySelector(root);

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
  initDOMElements() {
    this.state.elements = {
      modalOverlay: document.querySelector(this.config.selectors.modalOverlay),
    };
  }

  /**
   * Инициализирует приложение
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();

    document.addEventListener('click', this.handleModalClick.bind(this));
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  /**
   * Открывает модальное окно
   */
  openModal() {
    this.state.elements.modalOverlay?.classList.remove(this.config.hiddenClass);
  }

  /**
   * Закрывает модальное окно
   */
  closeModal() {
    this.state.elements.modalOverlay?.classList.add(this.config.hiddenClass);
  }

  /**
   * Обрабатывает клики для открытия/закрытия модального окна
   * @param {MouseEvent} event - Событие клика
   */
  handleModalClick({ target }) {
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
  handleKeyDown({ key }) {
    if (key === 'Escape') {
      this.closeModal();
    }
  }
}

new ModalWindow();