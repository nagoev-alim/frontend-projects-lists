/**
 * Этот код реализует приложение для дыхательной релаксации.
 * Оно создает интерфейс с анимированными инструкциями для дыхательных упражнений,
 * помогая пользователю следовать циклу вдоха, задержки и выдоха.
 */

import './style.css';

/**
 * Интерфейс для конфигурации приложения
 * @interface
 */
interface AppConfig {
  /** Корневой селектор для приложения */
  root: string;
  /** Селекторы для элементов приложения */
  selectors: {
    /** Селектор для контейнера релаксации */
    relaxerContainer: string;
    /** Селектор для текста релаксации */
    relaxerText: string;
  };
  /** Общая продолжительность цикла дыхания в миллисекундах */
  total: number;
  /** Продолжительность вдоха */
  get breathe(): number;
  /** Продолжительность задержки дыхания */
  get hold(): number;
}

/**
 * Интерфейс для состояния приложения
 * @interface
 */
interface AppState {
  /** Элементы DOM */
  elements: {
    /** Контейнер релаксации */
    relaxerContainer: HTMLDivElement | null;
    /** Текст релаксации */
    relaxerText: HTMLParagraphElement | null;
  };
}

/**
 * Класс, реализующий функциональность приложения для дыхательной релаксации
 */
class BreathRelaxing {
  /** Конфигурация приложения */
  private readonly config: AppConfig;
  /** Состояние приложения */
  private readonly state: AppState;
  /** Вспомогательные утилиты */
  private readonly utils: {
    /** Функция для рендеринга data-атрибутов */
    renderDataAttributes: (element: string) => string;
  };

  /**
   * Конструктор класса BreathRelaxing
   */
  constructor() {
    this.config = {
      root: '#app',
      selectors: {
        relaxerContainer: '[data-relaxer-container]',
        relaxerText: '[data-relaxer-text]',
      },
      total: 7500,
      get breathe() {
        return (this.total / 5) * 2;
      },
      get hold() {
        return this.total / 5;
      },
    };

    this.state = {
      elements: {
        relaxerContainer: null,
        relaxerText: null,
      },
    };

    this.utils = {
      renderDataAttributes: (element) => element.slice(1, -1),
    };

    this.init();
  }

  /**
   * Создает HTML-структуру приложения
   * @private
   */
  private createAppHTML(): void {
    const {
      root,
      selectors: { relaxerContainer, relaxerText },
    } = this.config;
    const { renderDataAttributes } = this.utils;
    const rootElement = document.querySelector(root);

    if (!rootElement) return;

    rootElement.innerHTML = `
    <div class='grid max-w-md w-full place-items-center gap-4 p-3'>
      <div class='relaxer-app'>
        <h2 class='text-center text-2xl font-bold'>Relaxer App</h2>
        <div class='relaxer-app__container' ${renderDataAttributes(relaxerContainer)}>
          <div class='relaxer-app__circle'></div>
          <p ${renderDataAttributes(relaxerText)}></p>
          <div class='relaxer-app__pointer'>
            <span class='pointer'></span>
          </div>
          <div class='relaxer-app__gradient-circle'></div>
        </div>
      </div>
    </div>
  `;
  }

  /**
   * Инициализирует элементы DOM
   * @private
   */
  private initDOMElements(): void {
    this.state.elements = {
      relaxerContainer: document.querySelector(this.config.selectors.relaxerContainer),
      relaxerText: document.querySelector(this.config.selectors.relaxerText),
    };
  }

  /**
   * Инициализирует приложение
   * @private
   */
  private init(): void {
    this.createAppHTML();
    this.initDOMElements();
    this.startBreathingAnimation();
    setInterval(this.startBreathingAnimation.bind(this), this.config.total);
  }

  /**
   * Запускает анимацию дыхания
   * @private
   */
  private startBreathingAnimation(): void {
    this.updateTextContent('Breathe In!');
    this.updateContainerClassName('relaxer-app__container grow');

    setTimeout(() => {
      this.updateTextContent('Hold');

      setTimeout(() => {
        this.updateTextContent('Breathe Out!');
        this.updateContainerClassName('relaxer-app__container shrink');
      }, this.config.hold);
    }, this.config.breathe);
  }

  /**
   * Обновляет текстовое содержимое
   * @param {string} text - Новый текст
   * @private
   */
  private updateTextContent(text: string): void {
    if (this.state.elements.relaxerText) {
      this.state.elements.relaxerText.textContent = text;
    }
  }

  /**
   * Обновляет класс контейнера
   * @param {string} className - Новый класс
   * @private
   */
  private updateContainerClassName(className: string): void {
    if (this.state.elements.relaxerContainer) {
      this.state.elements.relaxerContainer.className = className;
    }
  }
}

new BreathRelaxing();
