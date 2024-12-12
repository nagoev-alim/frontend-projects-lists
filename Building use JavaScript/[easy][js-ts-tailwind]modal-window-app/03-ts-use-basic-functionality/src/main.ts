/**
 * Этот модуль реализует функциональность модального окна.
 * Он включает в себя создание HTML-структуры, управление состоянием модального окна,
 * обработку событий открытия/закрытия и инициализацию приложения.
 */

import './style.css';
import { icons } from 'feather-icons';
import 'toastify-js/src/toastify.css';

/**
 * Интерфейс для конфигурации приложения
 * @interface
 */
interface AppConfig {
  /** Селектор корневого элемента */
  root: string;
  /** Объект с селекторами элементов */
  selectors: {
    /** Селектор для открытия модального окна */
    modalOpen: string;
    /** Селектор оверлея модального окна */
    modalOverlay: string;
    /** Селектор контента модального окна */
    modalContent: string;
    /** Селектор для закрытия модального окна */
    modalClose: string;
  };
  /** Класс для скрытия элементов */
  hiddenClass: string;
}

/**
 * Конфигурация приложения
 * @type {AppConfig}
 */
const APP_CONFIG: AppConfig = {
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
 * Интерфейс для состояния приложения
 * @interface
 */
interface AppState {
  /** Объект с ссылками на DOM-элементы */
  elements: {
    /** Элемент оверлея модального окна */
    modalOverlay: HTMLElement | null;
  };
}

/**
 * Состояние приложения
 * @type {AppState}
 */
const APP_STATE: AppState = {
  elements: {
    modalOverlay: null,
  },
};

/**
 * Интерфейс для утилит приложения
 * @interface
 */
interface AppUtils {
  /**
   * Функция для рендеринга data-атрибутов
   * @param {string} element - Строка с data-атрибутом
   * @returns {string} Отформатированная строка атрибута
   */
  renderDataAttributes: (element: string) => string;
}

/**
 * Утилиты приложения
 * @type {AppUtils}
 */
const APP_UTILS: AppUtils = {
  renderDataAttributes: (element: string): string => element.slice(1, -1),
};

/**
 * Создает HTML-структуру приложения
 */
function createAppHTML(): void {
  const {
    root,
    selectors: {
      modalOpen,
      modalOverlay,
      modalContent,
      modalClose,
    },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
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
function initDOMElements(): void {
  APP_STATE.elements = {
    modalOverlay: document.querySelector<HTMLElement>(APP_CONFIG.selectors.modalOverlay),
  };
}

/**
 * Инициализирует приложение
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();

  document.addEventListener('click', handleModalClick);
  document.addEventListener('keydown', handleKeyDown);
}

/**
 * Открывает модальное окно
 */
function openModal(): void {
  APP_STATE.elements.modalOverlay?.classList.remove(APP_CONFIG.hiddenClass);
}

/**
 * Закрывает модальное окно
 */
function closeModal(): void {
  APP_STATE.elements.modalOverlay?.classList.add(APP_CONFIG.hiddenClass);
}

/**
 * Обрабатывает клики для открытия/закрытия модального окна
 * @param {MouseEvent} event - Событие клика
 */
function handleModalClick(event: MouseEvent): void {
  const target = event.target as HTMLElement;
  if (target.matches(APP_CONFIG.selectors.modalOpen)) {
    openModal();
  } else if (
    target.matches(APP_CONFIG.selectors.modalClose) ||
    (target.matches(APP_CONFIG.selectors.modalOverlay) &&
      !target.closest(APP_CONFIG.selectors.modalContent))
  ) {
    closeModal();
  }
}

/**
 * Обрабатывает нажатия клавиш для закрытия модального окна
 * @param {KeyboardEvent} event - Событие нажатия клавиши
 */
function handleKeyDown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    closeModal();
  }
}

initApp();