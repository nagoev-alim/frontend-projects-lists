/**
 * @fileoverview Модуль для тестирования скорости печати.
 * Этот модуль реализует функциональность теста скорости печати, включая:
 * - Отображение текста для набора
 * - Отслеживание ошибок и скорости набора
 * - Расчет статистики (WPM, CPM)
 * - Обработку пользовательского ввода
 * - Управление таймером
 */

import './style.css';
import MOCK from './mock.js';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';

/**
 * Конфигурация приложения
 * @type {Object}
 */
const APP_CONFIG = {
  root: '#app',
  selectors: {
    input: '[data-typing-input]',
    text: '[data-typing-text]',
    time: '[data-typing-time]',
    mistake: '[data-typing-mistake]',
    wpm: '[data-typing-wpm]',
    cpm: '[data-typing-cpm]',
    reset: '[data-typing-reset]',
  },
  MOCK_DATA: MOCK,
  LABELS: [
    { label: 'Time Left', value: '60s', data: 'typing-time' },
    { label: 'Mistakes', value: 0, data: 'typing-mistake' },
    { label: 'WPM', value: 0, data: 'typing-wpm' },
    { label: 'CPM', value: 0, data: 'typing-cpm' },
  ],
  API_ENDPOINT: 'https://fish-text.ru/get?format=json&type=sentence&number=4&self=true',
};

/**
 * Состояние приложения
 * @type {Object}
 */
const APP_STATE = {
  elements: {},
  timer: null,
  maxTime: 60,
  timeLeft: 0,
  charIndex: 0,
  mistakes: 0,
  isTyping: 0,
};

/**
 * Утилиты приложения
 * @type {Object}
 */
const APP_UTILS = {
  renderDataAttributes: (element) => element.slice(1, -1),
  toastConfig: {
    className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
    duration: 3000,
    gravity: 'bottom',
    position: 'center',
  },
  
  /**
   * Показывает уведомление
   * @param {string} message - Сообщение для отображения
   */
  showToast: (message) => {
    Toastify({
      text: message,
      ...APP_UTILS.toastConfig,
    }).showToast();
  },
  
  /**
   * Обрабатывает ошибки
   * @param {string} message - Сообщение об ошибке
   * @param {Error} [error] - Объект ошибки (необязательно)
   */
  handleError: (message, error = null) => {
    APP_UTILS.showToast(message);
    if (error) console.error(message, error);
  },
};

/**
 * Создает HTML структуру приложения
 */
function createAppHTML() {
  const {
    root,
    selectors: {
      input,
      text,
      reset,
    },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='grid gap-4 max-w-xl w-full rounded border bg-white p-3 shadow'>
      <h1 class='text-center font-bold text-2xl md:text-4xl'>Typing Speed Test</h1>
      <input class='visually-hidden' type='text' ${renderDataAttributes(input)}>
      <p class='rounded border p-1 tracking-widest' ${renderDataAttributes(text)}></p>
      <ul class='grid grid-cols-4 gap-2'>
        ${APP_CONFIG.LABELS.map(
    ({ label, value, data }) => `
          <li class='grid gap-1.5'>
            <p class='font-medium'>${label}:</p>
            <span class='rounded bg-gray-200 p-1' data-${data}>${value}</span>
          </li>
        `,
  ).join('')}
      </ul>
      <button class='border px-3 py-2 hover:bg-slate-50' ${renderDataAttributes(reset)}>Try Again</button>
    </div>
  `;
}

/**
 * Инициализирует DOM элементы
 */
function initDOMElements() {
  APP_STATE.elements = {
    input: document.querySelector(APP_CONFIG.selectors.input),
    text: document.querySelector(APP_CONFIG.selectors.text),
    time: document.querySelector(APP_CONFIG.selectors.time),
    mistake: document.querySelector(APP_CONFIG.selectors.mistake),
    wpm: document.querySelector(APP_CONFIG.selectors.wpm),
    cpm: document.querySelector(APP_CONFIG.selectors.cpm),
    reset: document.querySelector(APP_CONFIG.selectors.reset),
  };
}

/**
 * Инициализирует приложение
 */
function initApp() {
  createAppHTML();
  initDOMElements();
  (async () => {
    await initializeTypingTest();
    APP_STATE.elements.reset.addEventListener('click', handleResetClick);
    APP_STATE.elements.input.addEventListener('input', handleInputChange);
  })();
}

/**
 * Инициализирует тест на скорость печати
 */
async function initializeTypingTest() {
  try {
    APP_STATE.elements.text.textContent = 'Loading...';
    const typingText = await fetchTypingText();
    APP_STATE.elements.text.innerHTML = typingText
      .split('')
      .map((char, idx) => `<span class="${idx === 0 ? 'active border-b-2 border-orange-500 text-orange-500' : ''}">${char}</span>`)
      .join('');
    APP_STATE.elements.text.addEventListener('click', APP_STATE.elements.input.focus());
    document.addEventListener('keydown', APP_STATE.elements.input.focus());
    APP_STATE.timeLeft = APP_STATE.maxTime;
    APP_STATE.elements.time.textContent = String(APP_STATE.timeLeft);
  } catch (error) {
    APP_UTILS.handleError('Failed to load paragraph', error);
    APP_STATE.elements.text.textContent = '';
  }
}

/**
 * Получает текст для теста печати
 * @returns {Promise<string>} Текст для теста
 */
async function fetchTypingText() {
  const randomMockText = APP_CONFIG.MOCK_DATA[Math.floor(Math.random() * APP_CONFIG.MOCK_DATA.length)];
  try {
    const { data: { status, text } } = await axios.get(APP_CONFIG.API_ENDPOINT);
    return status === 'success' ? text : randomMockText;
  } catch {
    return randomMockText;
  }
}

/**
 * Обработчик нажатия кнопки сброса
 */
async function handleResetClick() {
  await initializeTypingTest();

  clearInterval(APP_STATE.timer);
  APP_STATE.timeLeft = APP_STATE.maxTime;

  APP_STATE.charIndex = 0;
  APP_STATE.mistakes = 0;
  APP_STATE.isTyping = false;

  APP_STATE.elements.input.value = '';

  APP_STATE.elements.time.textContent = String(APP_STATE.timeLeft);
  const elementsToReset = [APP_STATE.elements.wpm, APP_STATE.elements.mistake, APP_STATE.elements.cpm];
  elementsToReset.forEach(el => el.textContent = '0');
}

/**
 * Инициализирует таймер
 */
function initTimer() {
  if (APP_STATE.timeLeft > 0) {
    APP_STATE.timeLeft--;
    APP_STATE.elements.time.innerText = String(APP_STATE.timeLeft);

    const elapsedTime = APP_STATE.maxTime - APP_STATE.timeLeft;
    const wordsTyped = (APP_STATE.charIndex - APP_STATE.mistakes) / 5;
    const wpm = Math.round((wordsTyped / elapsedTime) * 60);
    APP_STATE.elements.wpm.textContent = String(wpm);
  } else {
    clearInterval(APP_STATE.timer);
  }
}

/**
 * Обработчик изменения ввода
 * @param {Event} event - Событие ввода
 */
function handleInputChange(event) {
  const value = event.target.value;
  const characters = APP_STATE.elements.text.querySelectorAll('span');
  const typedChar = value[APP_STATE.charIndex];

  if (APP_STATE.charIndex < characters.length - 1 && APP_STATE.timeLeft > 0) {
    if (!APP_STATE.isTyping) {
      APP_STATE.timer = setInterval(initTimer, 1000);
      APP_STATE.isTyping = true;
    }
    processTypedCharacter(typedChar, characters);
    updateCharacterStyles(characters);
    updateStatistics();
  } else {
    clearInterval(APP_STATE.timer);
    APP_STATE.elements.input.value = '';
  }
}

/**
 * Обрабатывает введенный символ
 * @param {string} typedChar - Введенный символ
 * @param {NodeListOf<Element>} characters - Список элементов символов
 */
function processTypedCharacter(typedChar, characters) {
  if (typedChar === undefined) {
    handleBackspace(characters);
  } else {
    handleCharacterInput(typedChar, characters);
  }
}

/**
 * Обрабатывает нажатие клавиши Backspace
 * @param {NodeListOf<Element>} characters - Список элементов символов
 */
function handleBackspace(characters) {
  if (APP_STATE.charIndex > 0) {
    APP_STATE.charIndex--;
    const currentCharacter = characters[APP_STATE.charIndex];
    if (currentCharacter.classList.contains('incorrect')) {
      APP_STATE.mistakes--;
    }
    currentCharacter.classList.remove('correct', 'incorrect');
  }
}

/**
 * Обрабатывает ввод символа
 * @param {string} typedChar - Введенный символ
 * @param {NodeListOf<Element>} characters - Список элементов символов
 */
function handleCharacterInput(typedChar, characters) {
  const currentCharacter = characters[APP_STATE.charIndex];
  const isCorrect = currentCharacter.textContent === typedChar;
  const colorClass = isCorrect ? 'text-green-500' : 'text-red-500';
  const borderClass = isCorrect ? 'border-green-500' : 'border-red-500';

  currentCharacter.classList.add(
    isCorrect ? 'correct' : 'incorrect',
    colorClass,
    borderClass
  );

  if (!isCorrect) APP_STATE.mistakes++;
  APP_STATE.charIndex++;
}

/**
 * Обновляет стили символов
 * @param {NodeListOf<Element>} characters - Список элементов символов
 */
function updateCharacterStyles(characters) {
  characters.forEach((span) => span.classList.remove('active'));
  characters[APP_STATE.charIndex].classList.add('active', 'border-b');
}

/**
 * Обновляет статистику теста
 */
function updateStatistics() {
  const wpm = Math.round(((APP_STATE.charIndex - APP_STATE.mistakes) / 5 / (APP_STATE.maxTime - APP_STATE.timeLeft)) * 60);
  APP_STATE.elements.wpm.textContent = String(
    wpm < 0 || !wpm || wpm === Infinity ? 0 : wpm,
  );
  APP_STATE.elements.mistake.textContent = String(APP_STATE.mistakes);
  APP_STATE.elements.cpm.textContent = String(APP_STATE.charIndex - APP_STATE.mistakes);
}

initApp();
