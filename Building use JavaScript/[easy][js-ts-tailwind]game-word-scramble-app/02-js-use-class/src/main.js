import './style.css';
import WORDS from './mock.js';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

/**
 * @file Word Scramble Game
 * @description Игра, в которой пользователь должен угадать перемешанное слово за ограниченное время.
 * Приложение использует Toastify для отображения уведомлений и включает функции для создания HTML,
 * инициализации игры, управления таймером и проверки ответов пользователя.
 */

class WordScramble {
  /**
   * Создает экземпляр игры Word Scramble.
   * Инициализирует конфигурацию, состояние и утилиты игры.
   */
  constructor() {
    /**
     * @type {Object} Конфигурация игры
     * @property {string} root - Селектор корневого элемента
     * @property {Object} selectors - Селекторы для различных элементов игры
     */
    this.config = {
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
     * @type {Object} Состояние игры
     * @property {Object} elements - DOM элементы игры
     * @property {Array} wordsCollection - Коллекция слов для игры
     * @property {string|null} correctWord - Текущее правильное слово
     * @property {number|null} timer - ID таймера
     */
    this.state = {
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
     * @type {Object} Утилиты игры
     * @property {Function} renderDataAttributes - Функция для рендеринга data-атрибутов
     * @property {Object} toastConfig - Конфигурация для Toastify
     * @property {Function} showToast - Функция для отображения уведомлений
     */
    this.utils = {
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
          ...this.utils.toastConfig,
        }).showToast();
      },
    };

    this.init();
  }

  /**
   * Создает HTML-разметку приложения
   */
  createAppHTML() {
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
    } = this.config;
    const { renderDataAttributes } = this.utils;
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
  initDOMElements() {
    this.state.elements = {
      word: document.querySelector(this.config.selectors.word),
      hint: document.querySelector(this.config.selectors.hint),
      timer: document.querySelector(this.config.selectors.timer),
      input: document.querySelector(this.config.selectors.input),
      refreshButton: document.querySelector(this.config.selectors.refreshButton),
      checkButton: document.querySelector(this.config.selectors.checkButton),
    };
  }

  /**
   * Инициализирует приложение
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();
    this.utils.wordsCollection = WORDS;
    this.initGame();
    this.state.elements.refreshButton.addEventListener('click', this.initGame.bind(this));
    this.state.elements.checkButton.addEventListener('click', this.handleCheckButtonClick.bind(this));
  }

  /**
   * Запускает таймер игры
   * @param {number} duration - Продолжительность таймера в секундах
   */
  startTimer(duration) {
    let timeLeft = duration;
    this.state.timer = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        this.state.elements.timer.textContent = `${timeLeft}s`;
      } else {
        this.endGame();
      }
    }, 1000);
  }

  /**
   * Завершает игру
   */
  endGame() {
    this.utils.showToast(`Time off! ${this.state.correctWord.toUpperCase()} was the correct word`);
    this.state.elements.checkButton.disabled = true;
    this.state.elements.input.disabled = true;
    clearInterval(this.state.timer);
  }

  /**
   * Перемешивает буквы в слове
   * @param {string} word - Слово для перемешивания
   * @returns {string} Перемешанное слово
   */
  shuffleWord(word) {
    return word
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }

  /**
   * Инициализирует новую игру
   */
  initGame() {
    this.startTimer(30);
    const { word, hint } = WORDS[Math.floor(Math.random() * WORDS.length)];
    console.log(word);
    this.state.elements.word.textContent = this.shuffleWord(word);
    this.state.elements.hint.textContent = hint;
    this.state.correctWord = word.toLowerCase();
    this.state.elements.input.value = '';
    this.state.elements.input.maxLength = this.state.correctWord.length;
    this.state.elements.checkButton.disabled = false;
  }

  /**
   * Обрабатывает нажатие на кнопку проверки слова
   */
  handleCheckButtonClick() {
    const userWord = this.state.elements.input.value.trim().toLowerCase();

    if (!userWord) {
      this.utils.showToast('Please enter a valid word');
      return;
    }

    if (userWord !== this.state.correctWord) {
      this.utils.showToast(`Oops! ${userWord.toUpperCase()} is not a correct word`);
      return;
    }

    this.utils.showToast(`Congrats! The correct word is: ${this.state.correctWord.toUpperCase()}`);
    this.endGame();
  }
}

new WordScramble();
