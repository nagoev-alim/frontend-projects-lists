import './style.css';
import WORDS from './mock';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

/**
 * @file Word Scramble Game
 * @description Игра "Анаграмма", в которой пользователь должен угадать перемешанное слово за ограниченное время.
 * Приложение включает в себя функции для инициализации игры, обработки пользовательского ввода,
 * отображения подсказок и таймера, а также для проверки правильности ответа пользователя.
 */

/**
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента приложения
 * @property {Object} selectors - Объект с селекторами элементов DOM
 */
interface AppConfig {
  root: string;
  selectors: {
    [key: string]: string;
  };
}

/**
 * @typedef {Object} AppState
 * @property {Object} elements - Объект с элементами DOM
 * @property {Array} wordsCollection - Коллекция слов для игры
 * @property {string|null} correctWord - Текущее правильное слово
 * @property {number|null} timer - Идентификатор таймера
 */
interface AppState {
  elements: {
    [key: string]: HTMLElement | HTMLInputElement | HTMLButtonElement | null;
  };
  wordsCollection: Array<{ word: string; hint: string }>;
  correctWord: string | null;
  timer: number | null;
}

/**
 * @typedef {Object} AppUtils
 * @property {Function} renderDataAttributes - Функция для рендеринга data-атрибутов
 * @property {Object} toastConfig - Конфигурация для уведомлений
 * @property {Function} showToast - Функция для отображения уведомлений
 */
interface AppUtils {
  renderDataAttributes: (element: string) => string;
  toastConfig: {
    className: string;
    duration: number;
    gravity: string;
    position: string;
  };
  showToast: (message: string) => void;
}

/**
 * Класс WordScramble представляет игру "Анаграмма"
 */
class WordScramble {
  private readonly config: AppConfig;
  private state: AppState;
  private readonly utils: AppUtils;

  /**
   * Создает экземпляр игры Word Scramble.
   * Инициализирует конфигурацию, состояние и утилиты игры.
   */
  constructor() {
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

    this.utils = {
      renderDataAttributes: (element) => element.slice(1, -1),
      toastConfig: {
        className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
        duration: 3000,
        gravity: 'bottom',
        position: 'center',
      },
      showToast: (message) => {
        // @ts-ignore
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
  private createAppHTML(): void {
    const { root, selectors } = this.config;
    const { renderDataAttributes } = this.utils;
    const rootElement = document.querySelector(root);

    if (!rootElement) return;

    rootElement.innerHTML = `
    <div class='grid gap-4 max-w-md w-full rounded border bg-white p-3 shadow'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>Word Scramble Game</h1>
      <div class='grid gap-3'>
        <p class='text-center text-2xl font-bold uppercase tracking-widest' ${renderDataAttributes(selectors.word)}></p>
        <div class='grid gap-3'>
          <p class='font-medium'>Hint: <span class='rounded bg-gray-200 p-1 font-normal' ${renderDataAttributes(selectors.hint)}>A politically identified region</span></p>
          <p class='font-medium'>Time Left: <span class='rounded bg-gray-200 p-1 font-normal' ${renderDataAttributes(selectors.timer)}>0s</span></p>
        </div>
        <input class='w-full rounded border bg-slate-50 px-3 py-2 focus:border-blue-400 focus:outline-none' type='text' spellcheck='false' placeholder='Enter a valid word' maxlength='7' ${renderDataAttributes(selectors.input)}>
        <div class='grid grid-cols-2 gap-2'>
          <button class='border px-3 py-2 hover:bg-slate-50' ${renderDataAttributes(selectors.refreshButton)}>Refresh Word</button>
          <button class='border px-3 py-2 hover:bg-slate-50 disabled:bg-gray-200 disabled:text-gray-300' ${renderDataAttributes(selectors.checkButton)}>Check Word</button>
        </div>
      </div>
    </div>
  `;
  }

  /**
   * Инициализирует элементы DOM в состоянии приложения
   */
  private initDOMElements(): void {
    const { selectors } = this.config;
    this.state.elements = {
      word: document.querySelector(selectors.word),
      hint: document.querySelector(selectors.hint),
      timer: document.querySelector(selectors.timer),
      input: document.querySelector(selectors.input),
      refreshButton: document.querySelector(selectors.refreshButton),
      checkButton: document.querySelector(selectors.checkButton),
    };
  }

  /**
   * Инициализирует приложение
   */
  private init(): void {
    this.createAppHTML();
    this.initDOMElements();
    this.state.wordsCollection = WORDS;
    this.initGame();
    this.state.elements.refreshButton?.addEventListener('click', this.initGame.bind(this));
    this.state.elements.checkButton?.addEventListener('click', this.handleCheckButtonClick.bind(this));
  }

  /**
   * Запускает таймер игры
   * @param {number} duration - Продолжительность таймера в секундах
   */
  private startTimer(duration: number): void {
    let timeLeft = duration;
    this.state.timer = window.setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        if (this.state.elements.timer) {
          this.state.elements.timer.textContent = `${timeLeft}s`;
        }
      } else {
        this.endGame();
      }
    }, 1000);
  }

  /**
   * Завершает игру
   */
  private endGame(): void {
    if (this.state.correctWord) {
      this.utils.showToast(`Time off! ${this.state.correctWord.toUpperCase()} was the correct word`);
    }
    if (this.state.elements.checkButton instanceof HTMLButtonElement) {
      this.state.elements.checkButton.disabled = true;
    }
    if (this.state.elements.input instanceof HTMLInputElement) {
      this.state.elements.input.disabled = true;
    }
    if (this.state.timer !== null) {
      clearInterval(this.state.timer);
    }
  }

  /**
   * Перемешивает буквы в слове
   * @param {string} word - Слово для перемешивания
   * @returns {string} Перемешанное слово
   */
  private shuffleWord(word: string): string {
    return word
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }

  /**
   * Инициализирует новую игру
   */
  private initGame(): void {
    this.startTimer(30);
    const { word, hint } = WORDS[Math.floor(Math.random() * WORDS.length)];
    console.log(word);
    if (this.state.elements.word) {
      this.state.elements.word.textContent = this.shuffleWord(word);
    }
    if (this.state.elements.hint) {
      this.state.elements.hint.textContent = hint;
    }
    this.state.correctWord = word.toLowerCase();
    if (this.state.elements.input instanceof HTMLInputElement) {
      this.state.elements.input.value = '';
      this.state.elements.input.maxLength = this.state.correctWord.length;
    }
    if (this.state.elements.checkButton instanceof HTMLButtonElement) {
      this.state.elements.checkButton.disabled = false;
    }
  }

  /**
   * Обрабатывает нажатие на кнопку проверки слова
   */
  private handleCheckButtonClick(): void {
    const userWord = this.state.elements.input?.value.trim().toLowerCase() ?? '';

    if (!userWord) {
      this.utils.showToast('Please enter a valid word');
      return;
    }

    if (userWord !== this.state.correctWord) {
      this.utils.showToast(`Oops! ${userWord.toUpperCase()} is not a correct word`);
      return;
    }

    this.utils.showToast(`Congrats! The correct word is: ${this.state.correctWord!.toUpperCase()}`);
    this.endGame();
  }
}

new WordScramble();
