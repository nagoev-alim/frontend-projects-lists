/**
 * Этот код реализует приложение для релаксации, которое помогает пользователю
 * выполнять дыхательные упражнения. Приложение отображает анимированный круг
 * и текстовые инструкции для вдоха, задержки дыхания и выдоха.
 */

import './style.css';

/**
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента приложения
 * @property {Object} selectors - Селекторы для ключевых элементов приложения
 * @property {string} selectors.relaxerContainer - Селектор контейнера релаксации
 * @property {string} selectors.relaxerText - Селектор текста инструкций
 * @property {number} total - Общая продолжительность цикла дыхания в миллисекундах
 * @property {function(): number} breathe - Возвращает продолжительность вдоха/выдоха
 * @property {function(): number} hold - Возвращает продолжительность задержки дыхания
 */
const APP_CONFIG = {
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
 * @typedef {Object} AppState
 * @property {Object} elements - Объект, содержащий ссылки на DOM элементы
 * @property {HTMLElement} elements.relaxerContainer - Контейнер релаксации
 * @property {HTMLElement} elements.relaxerText - Элемент для отображения текста инструкций
 */
const APP_STATE = {
  elements: {
    relaxerContainer: null,
    relaxerText: null,
  },
};

/**
 * @typedef {Object} AppUtils
 * @property {function(string): string} renderDataAttributes - Функция для обработки data-атрибутов
 */
const APP_UTILS = {
  renderDataAttributes: (element) => element.slice(1, -1),
};

/**
 * Создает HTML структуру приложения и вставляет ее в DOM
 */
function createAppHTML() {
  const {
    root,
    selectors: { relaxerContainer, relaxerText },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
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
 * Инициализирует ссылки на DOM элементы
 */
function initDOMElements() {
  APP_STATE.elements = {
    relaxerContainer: document.querySelector(APP_CONFIG.selectors.relaxerContainer),
    relaxerText: document.querySelector(APP_CONFIG.selectors.relaxerText),
  };
}

/**
 * Инициализирует приложение
 */
function initApp() {
  createAppHTML();
  initDOMElements();
  startBreathingAnimation();
  setInterval(startBreathingAnimation, APP_CONFIG.total);
}

/**
 * Запускает анимацию дыхательного цикла
 */
function startBreathingAnimation() {
  updateTextContent('Breathe In!');
  updateContainerClassName('relaxer-app__container grow');

  setTimeout(() => {
    updateTextContent('Hold');

    setTimeout(() => {
      updateTextContent('Breathe Out!');
      updateContainerClassName('relaxer-app__container shrink');
    }, APP_CONFIG.hold);
  }, APP_CONFIG.breathe);
}

/**
 * Обновляет текстовое содержимое инструкции
 * @param {string} text - Текст инструкции
 */
function updateTextContent(text) {
  APP_STATE.elements.relaxerText.textContent = text;
}

/**
 * Обновляет класс контейнера релаксации
 * @param {string} className - Новый класс для контейнера
 */
function updateContainerClassName(className) {
  APP_STATE.elements.relaxerContainer.className = className;
}

// Запуск приложения
initApp();
