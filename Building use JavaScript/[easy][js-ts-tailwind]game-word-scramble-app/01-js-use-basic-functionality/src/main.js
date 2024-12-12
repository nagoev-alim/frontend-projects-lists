import './style.css';
import WORDS from './mock.js';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

/**
 * @file Word Scramble Game
 * @description Игра, в которой пользователь должен угадать перемешанное слово за ограниченное время.
 */

/**
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента приложения
 * @property {Object} selectors - Объект с селекторами элементов DOM
 */

/**
 * @type {AppConfig}
 */
const APP_CONFIG = {
  root: '#app',
  selectors: {
    word: '[data-scrambled-word]',
    hint: '[data-word-hint]',
    timer: '[data-countdown-timer]',
    input: '[data-word-input]',
    refreshButton: '[data-refresh-button]',
    checkButton: '[data-check-button]',
  },
};

/**
 * @typedef {Object} AppState
 * @property {Object} elements - Объект с элементами DOM
 * @property {Array} wordsCollection - Коллекция слов для игры
 * @property {string|null} correctWord - Текущее правильное слово
 * @property {number|null} timer - Идентификатор таймера
 */

/**
 * @type {AppState}
 */
const APP_STATE = {
  elements: {
    word: null,
    hint: null,
    timer: null,
    input: null,
    refreshButton: null,
    checkButton: null,
  },
  wordsCollection: [],
  correctWord: null,
  timer: null,
};

/**
 * @typedef {Object} AppUtils
 * @property {Function} renderDataAttributes - Функция для рендеринга data-атрибутов
 * @property {Object} toastConfig - Конфигурация для уведомлений
 * @property {Function} showToast - Функция для отображения уведомлений
 */

/**
 * @type {AppUtils}
 */
const APP_UTILS = {
  renderDataAttributes: (element) => element.slice(1, -1),
  toastConfig: {
    className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
    duration: 3000,
    gravity: 'bottom',
    position: 'center',
  },
  showToast: (message) => {
    Toastify({
      text: message,
      ...APP_UTILS.toastConfig,
    }).showToast();
  },
};

/**
 * Создает HTML-разметку приложения
 */
function createAppHTML() {
  const {
    root,
    selectors: {
      word,
      hint,
      timer,
      input,
      refreshButton,
      checkButton,
    },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='grid gap-4 max-w-md w-full rounded border bg-white p-3 shadow'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>Word Scramble Game</h1>
      <div class='grid gap-3'>
        <p class='text-center text-2xl font-bold uppercase tracking-widest' ${renderDataAttributes(word)}></p>
        <div class='grid gap-3'>
          <p class='font-medium'>Hint: <span class='rounded bg-gray-200 p-1 font-normal' ${renderDataAttributes(hint)}>A politically identified region</span></p>
          <p class='font-medium'>Time Left: <span class='rounded bg-gray-200 p-1 font-normal' ${renderDataAttributes(timer)}>0s</span></p>
        </div>
        <input class='w-full rounded border bg-slate-50 px-3 py-2 focus:border-blue-400 focus:outline-none' type='text' spellcheck='false' placeholder='Enter a valid word' maxlength='7' ${renderDataAttributes(input)}>
        <div class='grid grid-cols-2 gap-2'>
          <button class='border px-3 py-2 hover:bg-slate-50' ${renderDataAttributes(refreshButton)}>Refresh Word</button>
          <button class='border px-3 py-2 hover:bg-slate-50 disabled:bg-gray-200 disabled:text-gray-300' ${renderDataAttributes(checkButton)}>Check Word</button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Инициализирует элементы DOM в состоянии приложения
 */
function initDOMElements() {
  APP_STATE.elements = {
    word: document.querySelector(APP_CONFIG.selectors.word),
    hint: document.querySelector(APP_CONFIG.selectors.hint),
    timer: document.querySelector(APP_CONFIG.selectors.timer),
    input: document.querySelector(APP_CONFIG.selectors.input),
    refreshButton: document.querySelector(APP_CONFIG.selectors.refreshButton),
    checkButton: document.querySelector(APP_CONFIG.selectors.checkButton),
  };
}

/**
 * Инициализирует приложение
 */
function initApp() {
  createAppHTML();
  initDOMElements();
  APP_UTILS.wordsCollection = WORDS;
  initGame();
  APP_STATE.elements.refreshButton.addEventListener('click', initGame);
  APP_STATE.elements.checkButton.addEventListener('click', handleCheckButtonClick);
}

/**
 * Запускает таймер игры
 * @param {number} duration - Продолжительность таймера в секундах
 */
function startTimer(duration) {
  let timeLeft = duration;
  APP_STATE.timer = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      APP_STATE.elements.timer.textContent = `${timeLeft}s`;
    } else {
      endGame();
    }
  }, 1000);
}

/**
 * Завершает игру
 */
function endGame() {
  APP_UTILS.showToast(`Time off! ${APP_STATE.correctWord.toUpperCase()} was the correct word`);
  APP_STATE.elements.checkButton.disabled = true;
  APP_STATE.elements.input.disabled = true;
  clearInterval(APP_STATE.timer);
}

/**
 * Перемешивает буквы в слове
 * @param {string} word - Слово для перемешивания
 * @returns {string} Перемешанное слово
 */
function shuffleWord(word) {
  return word
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

/**
 * Инициализирует новую игру
 */
function initGame() {
  startTimer(30);
  const { word, hint } = WORDS[Math.floor(Math.random() * WORDS.length)];
  console.log(word);
  APP_STATE.elements.word.textContent = shuffleWord(word);
  APP_STATE.elements.hint.textContent = hint;
  APP_STATE.correctWord = word.toLowerCase();
  APP_STATE.elements.input.value = '';
  APP_STATE.elements.input.maxLength = APP_STATE.correctWord.length;
  APP_STATE.elements.checkButton.disabled = false;
}

/**
 * Обрабатывает нажатие на кнопку проверки слова
 */
function handleCheckButtonClick() {
  const userWord = APP_STATE.elements.input.value.trim().toLowerCase();

  if (!userWord) {
    APP_UTILS.showToast('Please enter a valid word');
    return;
  }

  if (userWord !== APP_STATE.correctWord) {
    APP_UTILS.showToast(`Oops! ${userWord.toUpperCase()} is not a correct word`);
    return;
  }

  APP_UTILS.showToast(`Congrats! The correct word is: ${APP_STATE.correctWord.toUpperCase()}`);
  endGame();
}

initApp();
