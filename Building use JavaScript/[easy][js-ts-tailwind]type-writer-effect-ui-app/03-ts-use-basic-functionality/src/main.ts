/**
 * Этот код реализует эффект печатающейся машинки на веб-странице.
 * Он создает HTML-структуру, инициализирует необходимые элементы DOM
 * и управляет анимацией текста, создавая иллюзию печати и удаления слов.
 */

import './style.css';

/**
 * Интерфейс для конфигурации приложения
 * @interface
 */
interface AppConfig {
  /** Корневой селектор для приложения */
  root: string;
  /** Объект с селекторами */
  selectors: {
    /** Селектор для целевого элемента эффекта печатающейся машинки */
    typewriterTarget: string;
  };
}

/**
 * Интерфейс для состояния приложения
 * @interface
 */
interface AppState {
  /** Объект с элементами DOM */
  elements: {
    /** Целевой элемент для эффекта печатающейся машинки */
    typewriterTarget: HTMLElement | null;
  };
  /** Текущий отображаемый текст */
  currentText: string;
  /** Индекс текущего слова */
  wordIndex: number;
  /** Флаг, указывающий, происходит ли удаление текста */
  isDeleting: boolean;
}

/**
 * Конфигурация приложения
 * @type {AppConfig}
 */
const APP_CONFIG: AppConfig = {
  root: '#app',
  selectors: {
    typewriterTarget: '[data-typewriter-target]',
  },
};

/**
 * Состояние приложения
 * @type {AppState}
 */
const APP_STATE: AppState = {
  elements: {
    typewriterTarget: null,
  },
  currentText: '',
  wordIndex: 0,
  isDeleting: false,
};

/**
 * Создает HTML-структуру приложения
 */
function createAppHTML(): void {
  const { root } = APP_CONFIG;
  const rootElement = document.querySelector<HTMLElement>(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='max-w-md w-full rounded border bg-white p-3 shadow grid gap-4'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>Typewriter Effect</h1>
      <h3 class='text-center text-2xl'>
        John Doe The
        <span 
          data-typewriter-target 
          data-typewriter-pause='1000' 
          data-typewriter-words='["Developer", "Designer", "Creator"]'
        ></span>
      </h3>
    </div>
  `;
}

/**
 * Инициализирует элементы DOM
 */
function initDOMElements(): void {
  APP_STATE.elements = {
    typewriterTarget: document.querySelector<HTMLElement>(APP_CONFIG.selectors.typewriterTarget),
  };
}

/**
 * Инициализирует приложение
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();
  handleTyping();
}

/**
 * Обрабатывает эффект печати
 */
function handleTyping(): void {
  const { currentText, wordIndex, isDeleting } = APP_STATE;
  const { typewriterTarget } = APP_STATE.elements;

  if (!typewriterTarget) return;

  const words: string[] = JSON.parse(typewriterTarget.dataset.typewriterWords || '[]');
  const pause: number = parseInt(typewriterTarget.dataset.typewriterPause || '0', 10);

  const currentWord = words[wordIndex % words.length];
  APP_STATE.currentText = currentWord.substring(0, isDeleting ? currentText.length - 1 : currentText.length + 1);
  typewriterTarget.innerHTML = `<span class='txt'>${APP_STATE.currentText}</span>`;

  const typeSpeed = isDeleting ? 150 : (APP_STATE.currentText === currentWord ? pause : 300);

  if (!isDeleting && APP_STATE.currentText === currentWord) {
    APP_STATE.isDeleting = true;
  } else if (isDeleting && APP_STATE.currentText === '') {
    APP_STATE.isDeleting = false;
    APP_STATE.wordIndex++;
  }

  requestAnimationFrame(() => setTimeout(handleTyping, typeSpeed));
}

initApp();
