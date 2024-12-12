/**
 * Модуль аккордеона
 *
 * Этот модуль реализует функциональность аккордеона на веб-странице.
 * Он позволяет создавать два типа аккордеонов:
 * 1. Аккордеон, где можно открыть несколько секций одновременно.
 * 2. Аккордеон, где открытие новой секции закрывает ранее открытую.
 */

import './style.css';
import { icons } from 'feather-icons';
import 'toastify-js/src/toastify.css';

/**
 * Конфигурация приложения
 * @type {Object}
 */
const APP_CONFIG = {
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
 * @type {Object}
 */
const APP_STATE = {
  elements: {
    accordionHeader: null,
  },
};

/**
 * Утилиты приложения
 * @type {Object}
 */
const APP_UTILS = {
  /**
   * Обрабатывает строку с data-атрибутом
   * @param {string} element - Строка с data-атрибутом
   * @returns {string} Обработанная строка
   */
  renderDataAttributes: (element) => element.slice(1, -1),
};

/**
 * Создает HTML-разметку приложения
 */
function createAppHTML() {
  const {
    root,
    selectors: {
      accordionContainer,
      accordionHeader,
      accordionBody,
      accordionIcon,
    },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector(root);

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
          <div class='accordion__container' ${renderDataAttributes(accordionContainer)}>
            <div class='accordion__header' ${renderDataAttributes(accordionHeader)}>
              <span class='h5 accordion__title'>Lorem ipsum dolor sit amet?</span>
              <div class='accordion__icon'  ${renderDataAttributes(accordionIcon)}>${icons.plus.toSvg()}</div>
            </div>
            <div class='accordion__body'  ${renderDataAttributes(accordionBody)}>
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
          <div class='accordion__container' ${renderDataAttributes(accordionContainer)}>
            <div class='accordion__header' ${renderDataAttributes(accordionHeader)}>
              <span class='h5 accordion__title'>Lorem ipsum dolor sit amet?</span>
              <div class='accordion__icon' ${renderDataAttributes(accordionIcon)}>${icons.plus.toSvg()}</div>
            </div>
            <div class='accordion__body' ${renderDataAttributes(accordionBody)}>
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
 */
function initDOMElements() {
  APP_STATE.elements = {
    accordionHeaders: document.querySelectorAll(APP_CONFIG.selectors.accordionHeader),
  };
}

/**
 * Инициализирует приложение
 */
function initApp() {
  createAppHTML();
  initDOMElements();
  APP_STATE.elements.accordionHeaders.forEach((header) => header.addEventListener('click', handleHeaderClick));
}

/**
 * Обрабатывает клик по заголовку аккордеона
 * @param {Event} event - Событие клика
 */
function handleHeaderClick(event) {
  const { target } = event;
  const parentContainer = target.closest(APP_CONFIG.selectors.accordion);
  const { container, body, icon } = getAccordionElements(target);

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
function getAccordionElements(target) {
  const container = target.closest(APP_CONFIG.selectors.accordionContainer);
  return {
    container,
    body: container.querySelector(APP_CONFIG.selectors.accordionBody),
    icon: container.querySelector(APP_CONFIG.selectors.accordionIcon),
  };
}

/**
 * Переключает состояние аккордеона
 * @param {HTMLElement} container - Контейнер аккордеона
 * @param {HTMLElement} body - Тело аккордеона
 * @param {HTMLElement} icon - Иконка аккордеона
 */
function toggleAccordion(container, body, icon) {
  const isOpen = container.classList.toggle('open');
  updateAccordionState(body, icon, isOpen);
}

/**
 * Обновляет состояние аккордеона
 * @param {HTMLElement} body - Тело аккордеона
 * @param {HTMLElement} icon - Иконка аккордеона
 * @param {boolean} isOpen - Флаг открытого состояния
 */
function updateAccordionState(body, icon, isOpen) {
  setAccordionStyles(body, isOpen ? `${body.scrollHeight + 30}px` : '0px', isOpen ? '15px' : '0px');
  icon.innerHTML = icons[isOpen ? 'minus' : 'plus'].toSvg();
}

/**
 * Устанавливает стили для тела аккордеона
 * @param {HTMLElement} body - Тело аккордеона
 * @param {string} height - Высота
 * @param {string} padding - Отступ
 */
function setAccordionStyles(body, height, padding) {
  Object.assign(body.style, {
    height,
    paddingTop: padding,
    paddingBottom: padding,
  });
}

/**
 * Закрывает все аккордеоны в родительском контейнере
 * @param {HTMLElement} parentContainer - Родительский контейнер
 */
function closeAllAccordions(parentContainer) {
  parentContainer.querySelectorAll(APP_CONFIG.selectors.accordionContainer).forEach(container => {
    container.classList.remove('open');
    const body = container.querySelector(APP_CONFIG.selectors.accordionBody);
    const icon = container.querySelector(APP_CONFIG.selectors.accordionIcon);
    updateAccordionState(body, icon, false);
  });
}

/**
 * Открывает аккордеон
 * @param {HTMLElement} container - Контейнер аккордеона
 * @param {HTMLElement} body - Тело аккордеона
 * @param {HTMLElement} icon - Иконка аккордеона
 */
function openAccordion(container, body, icon) {
  container.classList.add('open');
  updateAccordionState(body, icon, true);
}

initApp();
