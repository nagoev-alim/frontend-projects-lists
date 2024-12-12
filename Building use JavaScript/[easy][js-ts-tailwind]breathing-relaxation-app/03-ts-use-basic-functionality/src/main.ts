/**
 * Этот код реализует приложение для релаксации, которое помогает пользователю
 * контролировать дыхание. Оно отображает анимированные инструкции для вдоха,
 * задержки дыхания и выдоха, создавая визуальный и текстовый ритм дыхания.
 */

import './style.css';

/**
 * Интерфейс для конфигурации приложения
 */
interface AppConfig {
  /** Корневой селектор для приложения */
  root: string;
  /** Объект с селекторами для различных элементов */
  selectors: {
    [key: string]: string;
  };
  /** Общая продолжительность цикла дыхания в миллисекундах */
  total: number;
  /** Геттер для вычисления длительности вдоха */
  get breathe(): number;
  /** Геттер для вычисления длительности задержки дыхания */
  get hold(): number;
}

/**
 * Интерфейс для состояния приложения
 */
interface AppState {
  /** Объект, содержащий ссылки на DOM элементы */
  elements: {
    relaxerContainer: HTMLDivElement | null;
    relaxerText: HTMLParagraphElement | null;
  };
}

/**
 * Интерфейс для утилит приложения
 */
interface AppUtils {
  /** Функция для рендеринга data-атрибутов */
  renderDataAttributes: (element: string) => string;
}

/**
 * Конфигурация приложения
 */
const APP_CONFIG: AppConfig = {
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
 * Состояние приложения
 */
const APP_STATE: AppState = {
  elements: {
    relaxerContainer: null,
    relaxerText: null,
  },
};

/**
 * Утилиты приложения
 */
const APP_UTILS: AppUtils = {
  renderDataAttributes: (element) => element.slice(1, -1),
};

/**
 * Создает HTML структуру приложения
 */
function createAppHTML(): void {
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
 * Инициализирует DOM элементы приложения
 */
function initDOMElements(): void {
  APP_STATE.elements = {
    relaxerContainer: document.querySelector(APP_CONFIG.selectors.relaxerContainer),
    relaxerText: document.querySelector(APP_CONFIG.selectors.relaxerText),
  };
}

/**
 * Инициализирует приложение
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();
  startBreathingAnimation();
  setInterval(startBreathingAnimation, APP_CONFIG.total);
}

/**
 * Запускает анимацию дыхания
 */
function startBreathingAnimation(): void {
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
 * Обновляет текстовое содержимое
 * @param {string} text - Новый текст для отображения
 */
function updateTextContent(text: string): void {
  if (!APP_STATE.elements.relaxerText) return;
  APP_STATE.elements.relaxerText.textContent = text;
}

/**
 * Обновляет класс контейнера
 * @param {string} className - Новый класс для контейнера
 */
function updateContainerClassName(className: string): void {
  if (!APP_STATE.elements.relaxerContainer) return;
  APP_STATE.elements.relaxerContainer.className = className;
}

initApp();
