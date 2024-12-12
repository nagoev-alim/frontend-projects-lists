/**
 * Этот код реализует приложение для релаксации дыхания.
 * Оно создает интерфейс с анимированными инструкциями для дыхательных упражнений,
 * помогая пользователю выполнять циклы вдоха, задержки дыхания и выдоха.
 */

import './style.css';

class BreathRelaxing {
  /**
   * Создает экземпляр приложения для релаксации дыхания.
   */
  constructor() {
    /**
     * @type {Object} Конфигурация приложения
     * @property {string} root - Селектор корневого элемента
     * @property {Object} selectors - Селекторы для элементов DOM
     * @property {number} total - Общая продолжительность цикла дыхания в миллисекундах
     * @property {Function} breathe - Вычисляет продолжительность вдоха
     * @property {Function} hold - Вычисляет продолжительность задержки дыхания
     */
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

    /**
     * @type {Object} Состояние приложения
     * @property {Object} elements - Ссылки на элементы DOM
     */
    this.state = {
      elements: {
        relaxerContainer: null,
        relaxerText: null,
      },
    };

    /**
     * @type {Object} Утилиты приложения
     * @property {Function} renderDataAttributes - Форматирует строку атрибута данных
     */
    this.utils = {
      renderDataAttributes: (element) => element.slice(1, -1),
    };

    this.init();
  }

  /**
   * Создает HTML-структуру приложения.
   */
  createAppHTML() {
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
   * Инициализирует ссылки на элементы DOM.
   */
  initDOMElements() {
    this.state.elements = {
      relaxerContainer: document.querySelector(this.config.selectors.relaxerContainer),
      relaxerText: document.querySelector(this.config.selectors.relaxerText),
    };
  }

  /**
   * Инициализирует приложение.
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();
    this.startBreathingAnimation();
    setInterval(this.startBreathingAnimation.bind(this), this.config.total);
  }

  /**
   * Запускает анимацию дыхательного цикла.
   */
  startBreathingAnimation() {
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
   * Обновляет текстовое содержимое инструкции.
   * @param {string} text - Новый текст инструкции
   */
  updateTextContent(text) {
    this.state.elements.relaxerText.textContent = text;
  }

  /**
   * Обновляет класс контейнера для изменения анимации.
   * @param {string} className - Новый класс для контейнера
   */
  updateContainerClassName(className) {
    this.state.elements.relaxerContainer.className = className;
  }
}

new BreathRelaxing();
