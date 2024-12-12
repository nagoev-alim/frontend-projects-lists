/**
 * Этот код реализует эффект печатной машинки для текста на веб-странице.
 * Он создает HTML-разметку, инициализирует необходимые элементы DOM и
 * запускает анимацию печати и удаления текста.
 */

import './style.css';

/**
 * Конфигурация приложения
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента
 * @property {Object} selectors - Объект с селекторами элементов
 * @property {string} selectors.typewriterTarget - Селектор целевого элемента для эффекта печатной машинки
 */

/** @type {AppConfig} */
const APP_CONFIG = {
  root: '#app',
  selectors: {
    typewriterTarget: '[data-typewriter-target]',
  },
};

/**
 * Состояние приложения
 * @typedef {Object} AppState
 * @property {Object} elements - Объект с элементами DOM
 * @property {HTMLElement} elements.typewriterTarget - Целевой элемент для эффекта печатной машинки
 * @property {string} currentText - Текущий отображаемый текст
 * @property {number} wordIndex - Индекс текущего слова
 * @property {boolean} isDeleting - Флаг, указывающий, идет ли процесс удаления текста
 */

/** @type {AppState} */
const APP_STATE = {
  elements: {
    typewriterTarget: null,
  },
  currentText: '',
  wordIndex: 0,
  isDeleting: false,
};

/**
 * Создает HTML-разметку приложения
 */
function createAppHTML() {
  const { root } = APP_CONFIG;
  const rootElement = document.querySelector(root);

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
function initDOMElements() {
  APP_STATE.elements = {
    typewriterTarget: document.querySelector(APP_CONFIG.selectors.typewriterTarget),
  };
}

/**
 * Инициализирует приложение
 */
function initApp() {
  createAppHTML();
  initDOMElements();
  handleTyping();
}

/**
 * Обрабатывает эффект печатной машинки
 */
function handleTyping() {
  const { currentText, wordIndex, isDeleting } = APP_STATE;
  const { typewriterTarget } = APP_STATE.elements;

  const words = JSON.parse(typewriterTarget.dataset.typewriterWords);
  const pause = parseInt(typewriterTarget.dataset.typewriterPause, 10);

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
