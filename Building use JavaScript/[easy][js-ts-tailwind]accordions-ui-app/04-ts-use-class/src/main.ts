/**
 * Модуль аккордеона
 *
 * Этот модуль реализует функциональность аккордеона на веб-странице.
 * Он позволяет создавать два типа аккордеонов:
 * 1. Аккордеон, где можно открыть несколько секций одновременно.
 * 2. Аккордеон, где открытие новой секции закрывает ранее открытую.
 *
 * Класс Accordion управляет всей логикой работы аккордеона, включая
 * создание HTML-структуры, обработку событий и управление состоянием.
 */

import './style.css';
import { icons } from 'feather-icons';
import 'toastify-js/src/toastify.css';

/**
 * Интерфейс конфигурации приложения
 */
interface AppConfig {
  /** Корневой селектор для приложения */
  root: string;
  /** Объект с селекторами элементов */
  selectors: {
    [key: string]: string;
  };
}

/**
 * Интерфейс состояния приложения
 */
interface AppState {
  elements: {
    /** Заголовки аккордеона */
    accordionHeaders: NodeListOf<HTMLElement> | null;
  };
}

/**
 * Интерфейс утилит приложения
 */
interface AppUtils {
  /** Функция для рендеринга data-атрибутов */
  renderDataAttributes: (element: string) => string;
}

/**
 * Класс, реализующий функциональность аккордеона
 */
class Accordion {
  private readonly config: AppConfig;
  private readonly state: AppState;
  private readonly utils: AppUtils;

  /**
   * Создает экземпляр класса Accordion
   */
  constructor() {
    this.config = {
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

    this.state = {
      elements: {
        accordionHeaders: null,
      },
    };

    this.utils = {
      renderDataAttributes: (element) => element.slice(1, -1),
    };

    this.init();
  }

  /**
   * Создает HTML-структуру приложения
   */
  private createAppHTML(): void {
    const { root, selectors } = this.config;
    const { renderDataAttributes } = this.utils;
    const rootElement = document.querySelector<HTMLElement>(root);

    if (!rootElement) return;

    rootElement.innerHTML = `
      <div class='accordion'>
        <div class='column'>
          <h3 class='font-bold text-2xl title'>Accordion</h3>
          <p>${icons.info.toSvg()}Shows the block without closing the previously opened</p>
          <div class='accordion__item accordion__item--first'>
            ${Array.from({ length: 4 }).map(() => `
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
            `).join('')}
          </div>
        </div>

        <div class='column'>
          <h3 class='font-bold text-2xl title'>Accordion</h3>
          <p>${icons.info.toSvg()}Shows the block by closing the previously opened</p>
          <div class='accordion__item accordion__item--second'>
            ${Array.from({ length: 4 }).map(() => `
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
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Инициализирует DOM-элементы
   */
  private initDOMElements(): void {
    this.state.elements.accordionHeaders = document.querySelectorAll<HTMLElement>(this.config.selectors.accordionHeader);
  }

  /**
   * Инициализирует приложение
   */
  private init(): void {
    this.createAppHTML();
    this.initDOMElements();
    this.state.elements.accordionHeaders?.forEach((header) => 
      header.addEventListener('click', this.handleHeaderClick.bind(this))
    );
  }

  /**
   * Обрабатывает клик по заголовку аккордеона
   * @param {MouseEvent} event - Событие клика
   */
  private handleHeaderClick(event: MouseEvent): void {
    const target = event.currentTarget as HTMLElement;
    const parentContainer = target.closest<HTMLElement>(this.config.selectors.accordion);
    if (!parentContainer) return;

    const { container, body, icon } = this.getAccordionElements(target);
    if (!container || !body || !icon) return;

    if (parentContainer.classList.contains(this.config.selectors.accordionFirst)) {
      this.toggleAccordion(container, body, icon);
    }

    if (parentContainer.classList.contains(this.config.selectors.accordionSecond)) {
      const isOpen = !container.classList.contains('open');
      this.closeAllAccordions(parentContainer);
      if (isOpen) {
        this.openAccordion(container, body, icon);
      }
    }
  }

  /**
   * Получает элементы аккордеона
   * @param {HTMLElement} target - Целевой элемент
   * @returns {Object} Объект с элементами аккордеона
   */
  private getAccordionElements(target: HTMLElement): {
    container: HTMLElement | null;
    body: HTMLElement | null;
    icon: HTMLElement | null
  } {
    const container = target.closest<HTMLElement>(this.config.selectors.accordionContainer);
    return {
      container,
      body: container?.querySelector<HTMLElement>(this.config.selectors.accordionBody) ?? null,
      icon: container?.querySelector<HTMLElement>(this.config.selectors.accordionIcon) ?? null,
    };
  }

  /**
   * Переключает состояние аккордеона
   * @param {HTMLElement} container - Контейнер аккордеона
   * @param {HTMLElement} body - Тело аккордеона
   * @param {HTMLElement} icon - Иконка аккордеона
   */
  private toggleAccordion(container: HTMLElement, body: HTMLElement, icon: HTMLElement): void {
    const isOpen = container.classList.toggle('open');
    this.updateAccordionState(body, icon, isOpen);
  }

  /**
   * Обновляет состояние аккордеона
   * @param {HTMLElement} body - Тело аккордеона
   * @param {HTMLElement} icon - Иконка аккордеона
   * @param {boolean} isOpen - Флаг открытого состояния
   */
  private updateAccordionState(body: HTMLElement, icon: HTMLElement, isOpen: boolean): void {
    this.setAccordionStyles(body, isOpen ? `${body.scrollHeight + 30}px` : '0px', isOpen ? '15px' : '0px');
    icon.innerHTML = icons[isOpen ? 'minus' : 'plus'].toSvg();
  }

  /**
   * Устанавливает стили для аккордеона
   * @param {HTMLElement} body - Тело аккордеона
   * @param {string} height - Высота
   * @param {string} padding - Отступ
   */
  private setAccordionStyles(body: HTMLElement, height: string, padding: string): void {
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
  private closeAllAccordions(parentContainer: HTMLElement): void {
    parentContainer.querySelectorAll<HTMLElement>(this.config.selectors.accordionContainer).forEach(container => {
      container.classList.remove('open');
      const body = container.querySelector<HTMLElement>(this.config.selectors.accordionBody);
      const icon = container.querySelector<HTMLElement>(this.config.selectors.accordionIcon);
      if (body && icon) {
        this.updateAccordionState(body, icon, false);
      }
    });
  }

  /**
   * Открывает аккордеон
   * @param {HTMLElement} container - Контейнер аккордеона
   * @param {HTMLElement} body - Тело аккордеона
   * @param {HTMLElement} icon - Иконка аккордеона
   */
  private openAccordion(container: HTMLElement, body: HTMLElement, icon: HTMLElement): void {
    container.classList.add('open');
    this.updateAccordionState(body, icon, true);
  }
}

// Инициализация приложения
new Accordion();
