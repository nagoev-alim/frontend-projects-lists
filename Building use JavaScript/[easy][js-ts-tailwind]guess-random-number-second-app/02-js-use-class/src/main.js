/**
 * Этот код представляет собой игру "Угадай число". Игрок должен угадать случайно сгенерированное число от 1 до 100.
 * Игра включает в себя ввод имени игрока, отображение истории попыток, подсказки и эффект конфетти при победе.
 */

import './style.css';
import confetti from 'canvas-confetti';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

/**
 * Класс, представляющий игру "Угадай число"
 */
class GuessNumber {
  /**
   * Создает экземпляр игры "Угадай число"
   */
  constructor() {
    /**
     * @type {Object} Конфигурация игры
     * @property {string} root - Селектор корневого элемента
     * @property {Object} selectors - Селекторы для элементов DOM
     */
    this.config = {
      root: '#app',
      selectors: {
        guessHistory: '[data-guess-history]',
        guessForm: '[data-guess-form]',
        guessInput: '[data-guess-input]',
      },
    };

    /**
     * @type {Object} Состояние игры
     * @property {string|null} player - Имя игрока
     * @property {number} counter - Счетчик попыток
     * @property {number} secretNumber - Загаданное число
     * @property {Object} elements - DOM элементы
     */
    this.state = {
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
     * @type {Object} Вспомогательные функции
     */
    this.utils = {
      /**
       * Обрабатывает строку для использования в качестве атрибута data-
       * @param {string} element - Строка для обработки
       * @returns {string} Обработанная строка
       */
      renderDataAttributes: (element) => element.slice(1, -1),

      /**
       * Генерирует случайное число в заданном диапазоне
       * @param {number} min - Минимальное значение
       * @param {number} max - Максимальное значение
       * @returns {number} Случайное число
       */
      getRandomNumber: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,

      /**
       * Показывает всплывающее уведомление
       * @param {string} message - Текст уведомления
       */
      showToast: (message) => {
        Toastify({
          text: message,
          className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
          duration: 3000,
          gravity: 'bottom',
          position: 'center',
        }).showToast();
      },
    };

    this.init();
  }

  /**
   * Создает HTML разметку игры
   */
  createAppHTML() {
    const { root, selectors: { guessHistory, guessForm, guessInput } } = this.config;
    const { renderDataAttributes } = this.utils;
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
   * Инициализирует DOM элементы
   */
  initDOMElements() {
    this.state.elements = {
      guessHistory: document.querySelector(this.config.selectors.guessHistory),
      guessForm: document.querySelector(this.config.selectors.guessForm),
      guessInput: document.querySelector(this.config.selectors.guessInput),
    };
  }

  /**
   * Инициализирует игру
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();

    this.state.elements.guessInput.focus();
    this.displayMessage('👨 Enter your name:');
    this.state.elements.guessForm.addEventListener('submit', this.handleGuessFormSubmit.bind(this));
  }

  /**
   * Показывает эффект конфетти
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
   * Отображает сообщение в истории игры
   * @param {string} message - Сообщение для отображения
   */
  displayMessage(message) {
    const li = document.createElement('li');
    li.className = 'text-xl';
    li.textContent = message;
    this.state.elements.guessHistory.appendChild(li);
  }

  /**
   * Обрабатывает отправку формы с предположением
   * @param {Event} event - Событие отправки формы
   */
  handleGuessFormSubmit(event) {
    event.preventDefault();
    const { guess } = Object.fromEntries(new FormData(event.target));

    if (!guess) {
      this.utils.showToast('Please enter a guess');
      return;
    }

    if (!this.state.player) {
      this.initializePlayer(guess);
      return;
    }

    const guessNumber = Number(guess);
    if (isNaN(guessNumber)) {
      this.utils.showToast('Please enter a valid number');
      return;
    }

    this.processGuess(guessNumber, event.target);
    this.state.elements.guessInput.value = '';
  }

  /**
   * Инициализирует игрока
   * @param {string} name - Имя игрока
   */
  initializePlayer(name) {
    this.state.player = name;
    this.state.elements.guessHistory.innerHTML = '';
    this.displayMessage(
      `👨 ${name}, there is a number between 0 and 100. Try to guess it in the fewest number of tries. After each attempt, there will be a message with the text - 'Few', 'Many' or 'Right'.`,
    );
    this.state.elements.guessInput.value = '';
    this.state.elements.guessInput.setAttribute('type', 'number');
  }

  /**
   * Обрабатывает предположение игрока
   * @param {number} guessNumber - Предполагаемое число
   * @param {HTMLFormElement} form - Форма ввода
   */
  processGuess(guessNumber, form) {
    this.displayMessage(guessNumber.toString());
    this.state.counter++;

    if (guessNumber !== this.state.secretNumber) {
      this.displayMessage(
        guessNumber > this.state.secretNumber
          ? '⬇️ Many. Try again 😸'
          : '⬆️ Few. Try again 😸',
      );
    } else {
      this.displayMessage(`🎊 Right. The number you've guessed: ${guessNumber}`);
      this.displayMessage(`🎉 Number of attempts: ${this.state.counter}`);
      this.showConfetti();
      form.remove();
    }
  }
}

new GuessNumber();