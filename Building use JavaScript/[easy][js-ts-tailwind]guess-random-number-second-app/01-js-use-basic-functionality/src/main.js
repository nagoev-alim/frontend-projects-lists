/**
 * Этот код реализует игру "Угадай число". Пользователь вводит свое имя, затем пытается угадать
 * случайно сгенерированное число от 1 до 100. После каждой попытки игрок получает подсказку:
 * "Много", "Мало" или "Правильно". Когда число угадано, показывается количество попыток и
 * запускается анимация конфетти.
 */

import './style.css';
import confetti from 'canvas-confetti';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

/**
 * Объект конфигурации приложения
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента приложения
 * @property {Object} selectors - Объект с селекторами элементов
 * @property {string} selectors.guessHistory - Селектор для истории предположений
 * @property {string} selectors.guessForm - Селектор для формы ввода предположений
 * @property {string} selectors.guessInput - Селектор для поля ввода предположений
 */
const APP_CONFIG = {
  root: '#app',
  selectors: {
    guessHistory: '[data-guess-history]',
    guessForm: '[data-guess-form]',
    guessInput: '[data-guess-input]',
  },
};

/**
 * Объект состояния приложения
 * @typedef {Object} AppState
 * @property {string|null} player - Имя игрока
 * @property {number} counter - Счетчик попыток
 * @property {number} secretNumber - Загаданное число
 * @property {Object} elements - Объект с DOM элементами
 * @property {HTMLElement|null} elements.guessHistory - Элемент истории предположений
 * @property {HTMLElement|null} elements.guessForm - Элемент формы ввода предположений
 * @property {HTMLElement|null} elements.guessInput - Элемент поля ввода предположений
 */
const APP_STATE = {
  player: null,
  counter: 0,
  secretNumber: Math.floor(Math.random() * (100 - 1 + 1)) + 1,
  elements: {
    guessHistory: null,
    guessForm: null,
    guessInput: null,
  },
};

/**
 * Объект с утилитарными функциями
 * @typedef {Object} AppUtils
 * @property {function(string): string} renderDataAttributes - Функция для рендеринга data-атрибутов
 * @property {function(number, number): number} getRandomNumber - Функция для получения случайного числа
 * @property {function(string): void} showToast - Функция для отображения всплывающего уведомления
 */
const APP_UTILS = {
  renderDataAttributes: (element) => element.slice(1, -1),
  getRandomNumber: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
  showToast: (message) => {
    Toastify({
      text: message,
      className:
        'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
      duration: 3000,
      gravity: 'bottom',
      position: 'center',
    }).showToast();
  },
};

/**
 * Создает HTML-разметку приложения
 */
function createAppHTML() {
  const {
    root,
    selectors: { guessHistory, guessForm, guessInput },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='grid gap-3 p-4 text-yellow-400'>
      <h1 class='text-2xl font-bold md:text-5xl'>🎲 Guess number</h1>
      <ul class='grid gap-2' ${renderDataAttributes(guessHistory)}></ul>
      <form ${renderDataAttributes(guessForm)}>
        <label>
          <input 
            class='border-b-2 border-yellow-400 bg-transparent px-3 py-2.5 outline-none'
            type='text'
            name='guess'
            ${renderDataAttributes(guessInput)}
          >
        </label>
      </form>
    </div>
  `;
}

/**
 * Инициализирует DOM элементы в состоянии приложения
 */
function initDOMElements() {
  APP_STATE.elements = {
    guessHistory: document.querySelector(APP_CONFIG.selectors.guessHistory),
    guessForm: document.querySelector(APP_CONFIG.selectors.guessForm),
    guessInput: document.querySelector(APP_CONFIG.selectors.guessInput),
  };
}

/**
 * Инициализирует приложение
 */
function initApp() {
  createAppHTML();
  initDOMElements();

  APP_STATE.elements.guessInput.focus();
  displayMessage('👨 Enter your name:');
  APP_STATE.elements.guessForm.addEventListener('submit', handleGuessFormSubmit);
}

/**
 * Показывает анимацию конфетти
 */
function showConfetti() {
  confetti({
    angle: APP_UTILS.getRandomNumber(55, 125),
    spread: APP_UTILS.getRandomNumber(50, 70),
    particleCount: APP_UTILS.getRandomNumber(50, 100),
    origin: { y: 0.6 },
  });
}

/**
 * Отображает сообщение в истории предположений
 * @param {string} message - Сообщение для отображения
 */
function displayMessage(message) {
  const li = document.createElement('li');
  li.className = 'text-xl';
  li.textContent = message;
  APP_STATE.elements.guessHistory.appendChild(li);
}

/**
 * Обрабатывает отправку формы с предположением
 * @param {Event} event - Событие отправки формы
 */
function handleGuessFormSubmit(event) {
  event.preventDefault();
  const { guess } = Object.fromEntries(new FormData(event.target));

  if (!guess) {
    APP_UTILS.showToast('Please enter a guess');
    return;
  }

  if (!APP_STATE.player) {
    initializePlayer(guess);
    return;
  }

  const guessNumber = Number(guess);
  if (isNaN(guessNumber)) {
    APP_UTILS.showToast('Please enter a valid number');
    return;
  }

  processGuess(guessNumber, event.target);
  APP_STATE.elements.guessInput.value = '';
}

/**
 * Инициализирует игрока
 * @param {string} name - Имя игрока
 */
function initializePlayer(name) {
  APP_STATE.player = name;
  APP_STATE.elements.guessHistory.innerHTML = '';
  displayMessage(
    `👨 ${name}, there is a number between 0 and 100. Try to guess it in the fewest number of tries. After each attempt, there will be a message with the text - 'Few', 'Many' or 'Right'.`,
  );
  APP_STATE.elements.guessInput.value = '';
  APP_STATE.elements.guessInput.setAttribute('type', 'number');
}

/**
 * Обрабатывает предположение игрока
 * @param {number} guessNumber - Предполагаемое число
 * @param {HTMLFormElement} form - Форма ввода предположения
 */
function processGuess(guessNumber, form) {
  displayMessage(guessNumber.toString());
  APP_STATE.counter++;

  if (guessNumber !== APP_STATE.secretNumber) {
    displayMessage(
      guessNumber > APP_STATE.secretNumber
        ? '⬇️ Many. Try again 😸'
        : '⬆️ Few. Try again 😸',
    );
  } else {
    displayMessage(`🎊 Right. The number you've guessed: ${guessNumber}`);
    displayMessage(`🎉 Number of attempts: ${APP_STATE.counter}`);
    showConfetti();
    form.remove();
  }
}

initApp();