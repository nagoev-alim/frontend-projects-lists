import './style.css';
import { icons } from 'feather-icons';
import 'toastify-js/src/toastify.css';

/**
 * Accordion Application
 *
 * Это приложение создает два типа аккордеонов:
 * 1. Аккордеон, где можно открыть несколько секций одновременно.
 * 2. Аккордеон, где открывается только одна секция, закрывая предыдущую.
 *
 * Приложение использует TypeScript для типизации и улучшения читаемости кода.
 * Оно также включает в себя иконки из библиотеки Feather Icons для визуального оформления.
 */

/**
 * Конфигурация приложения
 * @typedef {Object} AppConfig
 * @property {string} root - Корневой селектор для приложения
 * @property {Object.<string, string>} selectors - Объект с селекторами элементов
 */
interface AppConfig {
  root: string;
  selectors: {
    [key: string]: string;
  };
}

/**
 * Состояние приложения
 * @typedef {Object} AppState
 * @property {Object} elements - Объект с DOM элементами
 * @property {NodeListOf<HTMLElement> | null} elements.accordionHeaders - Заголовки аккордеона
 */
interface AppState {
  elements: {
    accordionHeaders: NodeListOf<HTMLElement> | null;
  };
}

/**
 * Утилиты приложения
 * @typedef {Object} AppUtils
 * @property {function(string): string} renderDataAttributes - Функция для рендеринга data-атрибутов
 */
interface AppUtils {
  renderDataAttributes: (element: string) => string;
}

/**
 * Конфигурация приложения
 * @type {AppConfig}
 */
const APP_CONFIG: AppConfig = {
  root: '#app',
  selectors: {
    accordion: '.accordion__item',
    accordionFirst: 'accordion__item--first',
    accordionSecond: 'accordion__item--second',
    accordionContainer: '[data-accordion-container]',
    accordionHeader: '[data-accordion-header]',
    accordionBody: '[data-accordion-body]',
    accordionIcon: '[data-accordion-icon]',
  },
};

/**
 * Состояние приложения
 * @type {AppState}
 */
const APP_STATE: AppState = {
  elements: {
    accordionHeaders: null,
  },
};

/**
 * Утилиты приложения
 * @type {AppUtils}
 */
const APP_UTILS: AppUtils = {
  /**
   * Рендерит data-атрибуты для HTML элементов
   * @param {string} element - Строка с data-атрибутом
   * @returns {string} Строка без квадратных скобок
   */
  renderDataAttributes: (element: string) => element.slice(1, -1),
};

/**
 * Создает HTML-структуру приложения
 * Генерирует разметку для двух типов аккордеонов и вставляет её в корневой элемент
 */
function createAppHTML(): void {
  const { root, selectors } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector<HTMLElement>(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='accordion'>
      <div class='column'>
        <h3 class='font-bold text-2xl title'>Accordion</h3>
        <p>${icons.info.toSvg()}Shows the block without closing the previously opened</p>
        <div class='accordion__item accordion__item--first'>
          ${Array.from({ length: 4 })
    .map(
      () => `
                <div class='accordion__container' ${renderDataAttributes(selectors.accordionContainer)}>
                  <div class='accordion__header' ${renderDataAttributes(selectors.accordionHeader)}>
                    <span class='h5 accordion__title'>Lorem ipsum dolor sit amet?</span>
                    <div class='accordion__icon'  ${renderDataAttributes(selectors.accordionIcon)}>${icons.plus.toSvg()}</div>
                  </div>
                  <div class='accordion__body'  ${renderDataAttributes(selectors.accordionBody)}>
                    <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Exercitationem minima nesciunt sapiente veniam voluptatem Consectetur dicta enim laudantium reprehenderit voluptas</p>
                    <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Exercitationem minima nesciunt sapiente veniam voluptatem Consectetur dicta enim laudantium reprehenderit voluptas</p>
                  </div>
                </div>
              `,
    )
    .join('')}
        </div>
      </div>

      <div class='column'>
        <h3 class='font-bold text-2xl title'>Accordion</h3>
        <p>${icons.info.toSvg()}Shows the block by closing the previously opened</p>
        <div class='accordion__item accordion__item--second'>
          ${Array.from({ length: 4 })
    .map(
      () => `
                <div class='accordion__container' ${renderDataAttributes(selectors.accordionContainer)}>
                  <div class='accordion__header' ${renderDataAttributes(selectors.accordionHeader)}>
                    <span class='h5 accordion__title'>Lorem ipsum dolor sit amet?</span>
                    <div class='accordion__icon' ${renderDataAttributes(selectors.accordionIcon)}>${icons.plus.toSvg()}</div>
                  </div>
                  <div class='accordion__body' ${renderDataAttributes(selectors.accordionBody)}>
                    <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Exercitationem minima nesciunt sapiente veniam voluptatem Consectetur dicta enim laudantium reprehenderit voluptas</p>
                    <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Exercitationem minima nesciunt sapiente veniam voluptatem Consectetur dicta enim laudantium reprehenderit voluptas</p>
                  </div>
                </div>
              `,
    )
    .join('')}
        </div>
      </div>
    </div>
  `;
}

/**
 * Инициализирует DOM-элементы
 * Сохраняет ссылки на заголовки аккордеона в состоянии приложения
 */
function initDOMElements(): void {
  APP_STATE.elements = {
    accordionHeaders: document.querySelectorAll<HTMLElement>(APP_CONFIG.selectors.accordionHeader),
  };
}

/**
 * Инициализирует приложение
 * Создает HTML-структуру, инициализирует DOM-элементы и добавляет обработчики событий
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();
  APP_STATE.elements.accordionHeaders?.forEach((header) => header.addEventListener('click', handleHeaderClick));
}

/**
 * Обрабатывает клик по заголовку аккордеона
 * @param {MouseEvent} event - Событие клика
 */
function handleHeaderClick(event: MouseEvent): void {
  const target = event.target as HTMLElement;
  const parentContainer = target.closest<HTMLElement>(APP_CONFIG.selectors.accordion);
  if (!parentContainer) return;

  const { container, body, icon } = getAccordionElements(target);
  if (!container || !body || !icon) return;

  if (parentContainer.classList.contains(APP_CONFIG.selectors.accordionFirst)) {
    toggleAccordion(container, body, icon);
  }

  if (parentContainer.classList.contains(APP_CONFIG.selectors.accordionSecond)) {
    const isOpen = !container.classList.contains('open');
    closeAllAccordions(parentContainer);
    if (isOpen) {
      openAccordion(container, body, icon);
    }
  }
}

/**
 * Получает элементы аккордеона
 * @param {HTMLElement} target - Целевой элемент
 * @returns {Object} Объект с элементами аккордеона
 */
function getAccordionElements(target: HTMLElement): {
  container: HTMLElement | null;
  body: HTMLElement | null;
  icon: HTMLElement | null
} {
  const container = target.closest<HTMLElement>(APP_CONFIG.selectors.accordionContainer);
  return {
    container,
    body: container?.querySelector<HTMLElement>(APP_CONFIG.selectors.accordionBody) ?? null,
    icon: container?.querySelector<HTMLElement>(APP_CONFIG.selectors.accordionIcon) ?? null,
  };
}

/**
 * Переключает состояние аккордеона
 * @param {HTMLElement} container - Контейнер аккордеона
 * @param {HTMLElement} body - Тело аккордеона
 * @param {HTMLElement} icon - Иконка аккордеона
 */
function toggleAccordion(container: HTMLElement, body: HTMLElement, icon: HTMLElement): void {
  const isOpen = container.classList.toggle('open');
  updateAccordionState(body, icon, isOpen);
}

/**
 * Обновляет состояние аккордеона
 * @param {HTMLElement} body - Тело аккордеона
 * @param {HTMLElement} icon - Иконка аккордеона
 * @param {boolean} isOpen - Флаг открытого состояния
 */
function updateAccordionState(body: HTMLElement, icon: HTMLElement, isOpen: boolean): void {
  setAccordionStyles(body, isOpen ? `${body.scrollHeight + 30}px` : '0px', isOpen ? '15px' : '0px');
  icon.innerHTML = icons[isOpen ? 'minus' : 'plus'].toSvg();
}

/**
 * Устанавливает стили для аккордеона
 * @param {HTMLElement} body - Тело аккордеона
 * @param {string} height - Высота
 * @param {string} padding - Отступ
 */
function setAccordionStyles(body: HTMLElement, height: string, padding: string): void {
  Object.assign(body.style, {
    height,
    paddingTop: padding,
    paddingBottom: padding,
  });
}

/**
 * Закрывает все аккордеоны в контейнере
 * @param {HTMLElement} parentContainer - Родительский контейнер
 */
function closeAllAccordions(parentContainer: HTMLElement): void {
  parentContainer.querySelectorAll<HTMLElement>(APP_CONFIG.selectors.accordionContainer).forEach(container => {
    container.classList.remove('open');
    const body = container.querySelector<HTMLElement>(APP_CONFIG.selectors.accordionBody);
    const icon = container.querySelector<HTMLElement>(APP_CONFIG.selectors.accordionIcon);
    if (body && icon) {
      updateAccordionState(body, icon, false);
    }
  });
}

/**
 * Открывает аккордеон
 * @param {HTMLElement} container - Контейнер аккордеона
 * @param {HTMLElement} body - Тело аккордеона
 * @param {HTMLElement} icon - Иконка аккордеона
 */
function openAccordion(container: HTMLElement, body: HTMLElement, icon: HTMLElement): void {
  container.classList.add('open');
  updateAccordionState(body, icon, true);
}

initApp();
