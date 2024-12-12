/**
 * Этот код создает класс StatsCounter, который генерирует и управляет
 * интерактивной статистикой на веб-странице. Он создает HTML-разметку
 * с тремя счетчиками, которые анимированно увеличиваются от 0 до заданного значения.
 */

import './style.css';

/**
 * Интерфейс для конфигурации класса StatsCounter
 */
interface Config {
  /** Селектор корневого элемента */
  root: string;
  selectors: {
    /** Селектор для элементов с целевыми значениями */
    target: string;
  };
}

/**
 * Интерфейс для состояния класса StatsCounter
 */
interface State {
  elements: {
    /** Коллекция элементов с целевыми значениями */
    target: NodeListOf<Element> | null;
  };
}

/**
 * Класс для создания и управления анимированными счетчиками статистики
 */
class StatsCounter {
  /** Конфигурация класса */
  private readonly config: Config;
  /** Текущее состояние класса */
  private state: State;
  /** Утилиты для работы с данными */
  private readonly utils: { renderDataAttributes: (element: string) => string };

  /**
   * Создает экземпляр класса StatsCounter и инициализирует его
   */
  constructor() {
    this.config = {
      root: '#app',
      selectors: {
        target: '[data-target]',
      },
    };

    this.state = {
      elements: {
        target: null,
      },
    };

    this.utils = {
      /** Преобразует селектор атрибута в строку для data-атрибута */
      renderDataAttributes: (element: string): string => element.slice(1, -1),
    };

    this.init();
  }

  /**
   * Создает HTML-разметку для счетчиков статистики
   */
  private createAppHTML(): void {
    const {
      root,
      selectors: { target },
    } = this.config;
    const { renderDataAttributes } = this.utils;
    const rootElement = document.querySelector(root);

    if (!rootElement) return;

    rootElement.innerHTML = `
    <div class='grid w-full max-w-4xl gap-4 rounded border bg-white p-3 shadow'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>Our stats</h1>
      <ul class='grid gap-3 place-items-center text-center lg:grid-cols-3'>
        <li>
          <span class='text-4xl font-bold sm:text-8xl' ${renderDataAttributes(target)}='120'>0</span>
          <p class='font-medium'>Succeeded projects</p>
        </li>
        <li>
          <span class='text-4xl font-bold sm:text-8xl' ${renderDataAttributes(target)}='140'>0</span>
          <p class='font-medium'>Working hours spent</p>
        </li>
        <li>
          <span class='text-4xl font-bold sm:text-8xl' ${renderDataAttributes(target)}='150'>0</span>
          <p class='font-medium'>Happy clients</p>
        </li>
      </ul>
    </div>
  `;
  }

  /**
   * Инициализирует DOM-элементы и сохраняет их в состоянии
   */
  private initDOMElements(): void {
    this.state.elements = {
      target: document.querySelectorAll(this.config.selectors.target),
    };
  }

  /**
   * Инициализирует приложение: создает HTML, инициализирует элементы и запускает обработку
   */
  private init(): void {
    this.createAppHTML();
    this.initDOMElements();

    if (this.state.elements.target) {
      [...this.state.elements.target].forEach((element) => this.handleElement(element));
    }
  }

  /**
   * Обрабатывает отдельный элемент счетчика, анимируя его значение
   * @param {Element} element - DOM-элемент счетчика
   */
  private handleElement(element: Element): void {
    const targetValue = parseInt(element.getAttribute('data-target') || '0', 10);
    const increment = Math.ceil(targetValue / 100);
    let currentValue = 0;

    const updateCounter = (): void => {
      currentValue += increment;
      if (currentValue >= targetValue) {
        element.textContent = `${targetValue}+`;
        clearInterval(counterInterval);
      } else {
        element.textContent = `${currentValue}+`;
      }
    };

    const counterInterval = setInterval(updateCounter, 20);
  }
}

new StatsCounter();
