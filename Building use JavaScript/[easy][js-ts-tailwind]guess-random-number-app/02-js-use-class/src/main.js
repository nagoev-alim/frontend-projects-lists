/**
 * Этот код реализует игру "Угадай число". Игрок должен угадать случайно сгенерированное число от 1 до 10 за 3 попытки.
 * Код управляет логикой игры, обрабатывает пользовательский ввод, отображает сообщения и обновляет состояние игры.
 */

import './style.css';
import confetti from 'canvas-confetti';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

class GuessRandomNumber {
  /**
   * Создает экземпляр игры "Угадай число".
   * Инициализирует конфигурацию, состояние и утилиты игры.
   */
  constructor() {
    /**
     * @type {Object} Конфигурация игры
     * @property {string} root - Селектор корневого элемента
     * @property {Object} selectors - Селекторы элементов игры
     */
    this.config = {
      root: '#app',
      selectors: {
        game: '[data-game]',
        message: '[data-message]',
        restartButton: '[data-restart-button]',
        input: '[data-input]',
      },
    };

    /**
     * @type {Object} Состояние игры
     * @property {number} randomNumber - Случайное число, которое нужно угадать
     * @property {number} maxAttempts - Максимальное количество попыток
     * @property {Object} elements - DOM элементы игры
     */
    this.state = {
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
     * @type {Object} Утилиты игры
     * @property {Function} renderDataAttributes - Функция для рендеринга data-атрибутов
     * @property {Function} showToast - Функция для отображения уведомлений
     * @property {Function} getRandomNumber - Функция для генерации случайного числа
     */
    this.utils = {
      renderDataAttributes: (element) => element.slice(1, -1),
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
      getRandomNumber: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
    };

    this.init();
  }

  /**
   * Создает HTML-разметку игры и вставляет ее в DOM.
   */
  createAppHTML() {
    const { root, selectors: { game, message, input } } = this.config;
    const { renderDataAttributes } = this.utils;
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
   * Инициализирует DOM-элементы игры.
   */
  initDOMElements() {
    this.state.elements = {
      game: document.querySelector(this.config.selectors.game),
      message: document.querySelector(this.config.selectors.message),
      input: document.querySelector(this.config.selectors.input),
    };
  }

  /**
   * Инициализирует игру, создавая HTML, инициализируя DOM-элементы и добавляя обработчики событий.
   */
  init() {
    console.log(this.state.randomNumber);
    this.createAppHTML();
    this.initDOMElements();
    this.state.elements.game.addEventListener('submit', this.handleFormSubmit.bind(this));
  }

  /**
   * Отображает конфетти при успешном угадывании числа.
   */
  showConfetti() {
    confetti({
      angle: this.utils.getRandomNumber(55, 125),
      spread: this.utils.getRandomNumber(50, 70),
      particleCount: this.utils.getRandomNumber(50, 100),
      origin: { y: 0.6 },
    });
  }

  /**
   * Возвращает объект с обработчиками сообщений для различных ситуаций в игре.
   * @returns {Object} Объект с функциями-обработчиками сообщений
   */
  messageHandlers() {
    return {
      error: (message) => {
        this.utils.showToast(message);
        this.state.elements.input.disabled = true;
        setTimeout(() => {
          this.state.elements.input.disabled = false;
          this.state.elements.input.focus();
        }, 2000);
      },
      lost: () => this.renderMessage('orange'),
      success: () => this.renderMessage('green'),
    };
  }

  /**
   * Обрабатывает отправку формы с предполагаемым числом.
   * @param {Event} event - Событие отправки формы
   */
  handleFormSubmit(event) {
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
      if (guessInput === this.state.randomNumber) {
        this.showMessage('success', 'You guessed it! 🥳');
        this.state.elements.game.remove();
        this.showConfetti();
      } else {
        this.state.maxAttempts--;
        if (this.state.maxAttempts === 0) {
          this.state.elements.game.remove();
          this.showMessage(
            'lost',
            `You lost 🥲! The guessed number was ${this.state.randomNumber}`,
          );
        } else {
          this.showMessage('error', `Try again. Attempts left: ${this.state.maxAttempts}`);
          this.state.elements.game.reset();
        }
      }
    } catch (error) {
      this.utils.showToast(error.message);
    }
  }

  /**
   * Отображает сообщение игры и вызывает соответствующий обработчик.
   * @param {string} messageType - Тип сообщения
   * @param {string} message - Текст сообщения
   */
  showMessage(messageType, message) {
    if (this.state.elements.message) {
      this.state.elements.message.textContent = message;
      const handler = this.messageHandlers()[messageType];
      if (handler) {
        handler(message);
      }
    }

    const restartButton = document.querySelector(this.config.selectors.restartButton);
    if (restartButton && messageType !== 'error') {
      restartButton.addEventListener('click', () => location.reload());
    }
  }

  /**
   * Отображает сообщение с соответствующим стилем и добавляет кнопку перезапуска игры.
   * @param {string} type - Тип сообщения ('orange' или 'green')
   */
  renderMessage(type) {
    this.state.elements.message.classList.remove('hidden');
    this.state.elements.message.classList.add('text-center', 'font-bold');

    if (type === 'orange') {
      this.state.elements.message.classList.add('text-orange-400');
    } else if (type === 'green') {
      this.state.elements.message.classList.add('text-green-400');
    }

    const buttonClass = type === 'orange' ? 'bg-orange-400' : 'bg-green-400';
    this.state.elements.message.insertAdjacentHTML(
      'afterend',
      `<button class='border ${buttonClass} text-white px-3 py-2.5' ${this.utils.renderDataAttributes(this.config.selectors.restartButton)}>Play it again?</button>`,
    );
  }
}

new GuessRandomNumber();