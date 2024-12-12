/**
 * Этот код реализует игру "Угадай число". Игрок должен угадать случайно сгенерированное число от 1 до 10 за 3 попытки.
 * Код управляет логикой игры, обрабатывает пользовательский ввод, отображает сообщения и обновляет состояние игры.
 */

import './style.css';
import confetti from "canvas-confetti";
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

/**
 * Конфигурация приложения
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента
 * @property {Object} selectors - Объект с селекторами элементов
 */
const APP_CONFIG = {
  root: '#app',
  selectors: {
    game: '[data-game]',
    message: '[data-message]',
    restartButton: '[data-restart-button]',
    input: '[data-input]',
  },
};

/**
 * Состояние приложения
 * @typedef {Object} AppState
 * @property {number} randomNumber - Случайное число, которое нужно угадать
 * @property {number} maxAttempts - Максимальное количество попыток
 * @property {Object} elements - Объект с DOM элементами
 */
const APP_STATE = {
  randomNumber: Math.floor(Math.random() * (10 - 1 + 1)) + 1,
  maxAttempts: 3,
  elements: {
    game: null,
    message: null,
    restartButton: null,
    input: null,
  },
};

/**
 * Утилиты приложения
 * @typedef {Object} AppUtils
 */
const APP_UTILS = {
  /**
   * Отображает атрибуты данных элемента
   * @param {string} element - Строка с атрибутом данных
   * @returns {string} - Строка без квадратных скобок
   */
  renderDataAttributes: (element) => element.slice(1, -1),

  /**
   * Показывает уведомление
   * @param {string} message - Текст уведомления
   */
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

  /**
   * Генерирует случайное число в заданном диапазоне
   * @param {number} min - Минимальное значение
   * @param {number} max - Максимальное значение
   * @returns {number} - Случайное число
   */
  getRandomNumber: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
};

/**
 * Создает HTML структуру приложения
 */
function createAppHTML() {
  const { root, selectors: { game, message, input } } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='grid max-w-md w-full gap-4 rounded border p-3 shadow'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>Guess the number</h1>
      <p>Guess the Number is a game in which you have to guess a number given by the computer from 0 to 10. Use as few tries as possible. Good luck!</p>
      <form ${renderDataAttributes(game)}>
        <label aria-label='Enter a number'>
          <input class='w-full border-2 px-3 py-2.5' type='number' name='guess' placeholder='Enter a number' min='1' max='10' ${renderDataAttributes(input)}>
        </label>
      </form>
      <div class='hidden' ${renderDataAttributes(message)}></div>
    </div>
  `;
}

/**
 * Инициализирует DOM элементы
 */
function initDOMElements() {
  APP_STATE.elements = {
    game: document.querySelector(APP_CONFIG.selectors.game),
    message: document.querySelector(APP_CONFIG.selectors.message),
    input: document.querySelector(APP_CONFIG.selectors.input),
  };
}

/**
 * Инициализирует приложение
 */
function initApp() {
  console.log(APP_STATE.randomNumber);
  createAppHTML();
  initDOMElements();
  APP_STATE.elements.game.addEventListener('submit', handleFormSubmit);
}

/**
 * Показывает конфетти при победе
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
 * Обработчики сообщений
 * @type {Object}
 */
const messageHandlers = {
  error: (message) => {
    APP_UTILS.showToast(message);
    APP_STATE.elements.input.disabled = true;
    setTimeout(() => {
      APP_STATE.elements.input.disabled = false;
      APP_STATE.elements.input.focus();
    }, 2000);
  },
  lost: () => renderMessage('orange'),
  success: () => renderMessage('green'),
};

/**
 * Обрабатывает отправку формы
 * @param {Event} event - Событие отправки формы
 */
function handleFormSubmit(event) {
  event.preventDefault();
  const guessInput = +event.target.guess.value;
  try {
    if (!guessInput) {
      throw new Error('Please enter a number.');
    }
    if (isNaN(guessInput)) {
      throw new Error('Please enter the correct number.');
    }
    if (guessInput < 1 || guessInput > 10) {
      throw new Error('Please enter a number between 1 and 10.');
    }
    if (guessInput === APP_STATE.randomNumber) {
      showMessage('success', 'You guessed it! 🥳');
      APP_STATE.elements.game.remove();
      showConfetti();
    } else {
      APP_STATE.maxAttempts--;
      if (APP_STATE.maxAttempts === 0) {
        APP_STATE.elements.game.remove();
        showMessage(
          'lost',
          `You lost 🥲! The guessed number was ${APP_STATE.randomNumber}`,
        );
      } else {
        showMessage('error', `Try again. Attempts left: ${APP_STATE.maxAttempts}`);
        APP_STATE.elements.game.reset();
      }
    }
  } catch (error) {
    APP_UTILS.showToast(error.message);
  }
}

/**
 * Показывает сообщение
 * @param {string} messageType - Тип сообщения
 * @param {string} message - Текст сообщения
 */
function showMessage(messageType, message) {
  if (APP_STATE.elements.message) {
    APP_STATE.elements.message.textContent = message;
    const handler = messageHandlers[messageType];
    if (handler) {
      handler(message);
    }
  }

  const restartButton = document.querySelector(APP_CONFIG.selectors.restartButton);
  if (restartButton && messageType !== 'error') {
    restartButton.addEventListener('click', () => location.reload());
  }
}

/**
 * Отображает сообщение с определенным стилем
 * @param {string} type - Тип сообщения ('orange' или 'green')
 */
function renderMessage(type) {
  APP_STATE.elements.message.classList.remove('hidden');
  APP_STATE.elements.message.classList.add('text-center', 'font-bold');

  if (type === 'orange') {
    APP_STATE.elements.message.classList.add('text-orange-400');
  } else if (type === 'green') {
    APP_STATE.elements.message.classList.add('text-green-400');
  }

  const buttonClass = type === 'orange' ? 'bg-orange-400' : 'bg-green-400';
  APP_STATE.elements.message.insertAdjacentHTML(
    'afterend',
    `<button class='border ${buttonClass} text-white px-3 py-2.5' data-restart-button>Play it again?</button>`,
  );
}

initApp();