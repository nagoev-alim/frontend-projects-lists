/**
 * Модуль для тестирования скорости печати.
 *
 * Этот модуль реализует функциональность теста скорости печати. Он включает в себя:
 * - Инициализацию приложения и DOM-элементов
 * - Загрузку текста для печати
 * - Обработку ввода пользователя
 * - Расчет статистики (скорость печати, ошибки)
 * - Управление таймером
 * - Сброс теста
 */

import './style.css';
import MOCK from './mock';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';

/**
 * Интерфейс конфигурации приложения.
 */
interface AppConfig {
  /** Корневой элемент приложения */
  root: string;
  /** Селекторы для DOM-элементов */
  selectors: {
    [key: string]: string;
  };
  /** Моковые данные для текста */
  MOCK_DATA: string[];
  /** Метки для отображения статистики */
  LABELS: Array<{
    label: string;
    value: string | number;
    data: string;
  }>;
  /** Конечная точка API для получения текста */
  API_ENDPOINT: string;
}

/**
 * Интерфейс состояния приложения.
 */
interface AppState {
  /** DOM-элементы */
  elements: {
    [key: string]: HTMLElement | null;
  };
  /** Идентификатор таймера */
  timer: number | null;
  /** Максимальное время теста */
  maxTime: number;
  /** Оставшееся время */
  timeLeft: number;
  /** Индекс текущего символа */
  charIndex: number;
  /** Количество ошибок */
  mistakes: number;
  /** Флаг, указывающий, идет ли печать */
  isTyping: boolean | number;
}

/**
 * Интерфейс утилит приложения.
 */
interface AppUtils {
  /** Функция для рендеринга атрибутов данных */
  renderDataAttributes: (element: string) => string;
  /** Конфигурация для тостов */
  toastConfig: {
    className: string;
    duration: number;
    gravity: string;
    position: string;
  };
  /** Функция для отображения тоста */
  showToast: (message: string) => void;
  /** Функция для обработки ошибок */
  handleError: (message: string, error?: any) => void;
}

class TypingSpeedTester {
  private readonly config: AppConfig;
  private state: AppState;
  private readonly utils: AppUtils;

  constructor() {
    this.config = {
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

    this.state = {
      elements: {},
      timer: null,
      maxTime: 60,
      timeLeft: 0,
      charIndex: 0,
      mistakes: 0,
      isTyping: 0,
    };

    this.utils = {
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
        // @ts-ignore
        Toastify({
          text: message,
          ...this.utils.toastConfig,
        }).showToast();
      },

      /**
       * Обрабатывает ошибки
       * @param {string} message - Сообщение об ошибке
       * @param {Error} [error] - Объект ошибки (необязательно)
       */
      handleError: (message, error = null) => {
        this.utils.showToast(message);
        if (error) console.error(message, error);
      },
    };

    this.init();
  }

  /**
   * Создает HTML структуру приложения
   */
  createAppHTML() {
    const { root, selectors: { input, text, reset } } = this.config;
    const { renderDataAttributes } = this.utils;
    const rootElement = document.querySelector<HTMLElement>(root);

    if (!rootElement) return;

    rootElement.innerHTML = `
    <div class='grid gap-4 max-w-xl w-full rounded border bg-white p-3 shadow'>
      <h1 class='text-center font-bold text-2xl md:text-4xl'>Typing Speed Test</h1>
      <input class='visually-hidden' type='text' ${renderDataAttributes(input)}>
      <p class='rounded border p-1 tracking-widest' ${renderDataAttributes(text)}></p>
      <ul class='grid grid-cols-4 gap-2'>
        ${this.config.LABELS.map(({ label, value, data }) => `
          <li class='grid gap-1.5'>
            <p class='font-medium'>${label}:</p>
            <span class='rounded bg-gray-200 p-1' data-${data}>${value}</span>
          </li>
        `).join('')}
      </ul>
      <button class='border px-3 py-2 hover:bg-slate-50' ${renderDataAttributes(reset)}>Try Again</button>
    </div>
  `;
  }

  /**
   * Инициализирует DOM элементы
   */
  initDOMElements() {
    this.state.elements = {
      input: document.querySelector<HTMLInputElement>(this.config.selectors.input),
      text: document.querySelector<HTMLParagraphElement>(this.config.selectors.text),
      time: document.querySelector<HTMLSpanElement>(this.config.selectors.time),
      mistake: document.querySelector<HTMLSpanElement>(this.config.selectors.mistake),
      wpm: document.querySelector<HTMLSpanElement>(this.config.selectors.wpm),
      cpm: document.querySelector<HTMLSpanElement>(this.config.selectors.cpm),
      reset: document.querySelector<HTMLButtonElement>(this.config.selectors.reset),
    };
  }

  /**
   * Инициализирует приложение
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();
    (async () => {
      await this.initializeTypingTest();
      this.state.elements.reset?.addEventListener('click', this.handleResetClick.bind(this));
      this.state.elements.input?.addEventListener('input', this.handleInputChange.bind(this));
    })();
  }

  /**
   * Инициализирует тест печати.
   */
  async initializeTypingTest(): Promise<void> {
    try {
      if (this.state.elements.text) {
        this.state.elements.text.textContent = 'Loading...';
        const typingText = await this.fetchTypingText();
        this.state.elements.text.innerHTML = typingText
          .split('')
          .map((char, idx) => `<span class="${idx === 0 ? 'active border-b-2 border-orange-500 text-orange-500' : ''}">${char}</span>`)
          .join('');
        this.state.elements.text.addEventListener('click', () => this.state.elements.input?.focus());
        document.addEventListener('keydown', () => this.state.elements.input?.focus());
        this.state.timeLeft = this.state.maxTime;
        if (this.state.elements.time) {
          this.state.elements.time.textContent = String(this.state.timeLeft);
        }
      }
    } catch (error) {
      this.utils.handleError('Failed to load paragraph', error);
      if (this.state.elements.text) {
        this.state.elements.text.textContent = '';
      }
    }
  }

  /**
   * Получает текст для теста печати.
   * @returns {Promise<string>} Текст для теста печати.
   */
  async fetchTypingText(): Promise<string> {
    const randomMockText = this.config.MOCK_DATA[Math.floor(Math.random() * this.config.MOCK_DATA.length)];
    try {
      const { data: { status, text } } = await axios.get<{ status: string; text: string }>(this.config.API_ENDPOINT);
      return status === 'success' ? text : randomMockText;
    } catch {
      return randomMockText;
    }
  }

  /**
   * Обрабатывает клик по кнопке сброса.
   */
  async handleResetClick(): Promise<void> {
    await this.initializeTypingTest();

    if (this.state.timer !== null) {
      clearInterval(this.state.timer);
    }
    this.state.timeLeft = this.state.maxTime;

    this.state.charIndex = 0;
    this.state.mistakes = 0;
    this.state.isTyping = false;

    if (this.state.elements.input instanceof HTMLInputElement) {
      this.state.elements.input.value = '';
    }

    if (this.state.elements.time) {
      this.state.elements.time.textContent = String(this.state.timeLeft);
    }
    const elementsToReset = [this.state.elements.wpm, this.state.elements.mistake, this.state.elements.cpm];
    elementsToReset.forEach(el => {
      if (el) el.textContent = '0';
    });
  }

  /**
   * Инициализирует таймер.
   */
  initTimer(): void {
    if (this.state.timeLeft > 0) {
      this.state.timeLeft--;
      if (this.state.elements.time) {
        this.state.elements.time.innerText = String(this.state.timeLeft);
      }

      const elapsedTime = this.state.maxTime - this.state.timeLeft;
      const wordsTyped = (this.state.charIndex - this.state.mistakes) / 5;
      const wpm = Math.round((wordsTyped / elapsedTime) * 60);
      if (this.state.elements.wpm) {
        this.state.elements.wpm.textContent = String(wpm);
      }
    } else if (this.state.timer !== null) {
      clearInterval(this.state.timer);
    }
  }

  /**
   * Обрабатывает изменение ввода.
   * @param {Event} event - Событие ввода
   * @returns {void}
   */
  handleInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    const characters = this.state.elements.text?.querySelectorAll('span');
    const typedChar = value[this.state.charIndex];

    if (characters && this.state.charIndex < characters.length - 1 && this.state.timeLeft > 0) {
      if (!this.state.isTyping) {
        this.state.timer = setInterval(this.initTimer.bind(this), 1000);
        this.state.isTyping = true;
      }
      this.processTypedCharacter(typedChar, characters);
      this.updateCharacterStyles(characters);
      this.updateStatistics();
    } else {
      if (this.state.timer !== null) {
        clearInterval(this.state.timer);
      }
      if (this.state.elements.input instanceof HTMLInputElement) {
        this.state.elements.input.value = '';
      }
    }
  }

  /**
   * Обрабатывает введенный символ.
   * @param {string | undefined} typedChar - Введенный символ
   * @param {NodeListOf<HTMLSpanElement>} characters - Список символов текста
   * @returns {void}
   */
  processTypedCharacter(typedChar: string | undefined, characters: NodeListOf<HTMLSpanElement>): void {
    if (typedChar === undefined) {
      this.handleBackspace(characters);
    } else {
      this.handleCharacterInput(typedChar, characters);
    }
  }

  /**
   * Обрабатывает нажатие клавиши backspace.
   * @param {NodeListOf<HTMLSpanElement>} characters - Список символов текста
   * @returns {void}
   */


  handleBackspace(characters: NodeListOf<HTMLSpanElement>): void {
    if (this.state.charIndex > 0) {
      this.state.charIndex--;
      const currentCharacter = characters[this.state.charIndex];
      if (currentCharacter.classList.contains('incorrect')) {
        this.state.mistakes--;
      }
      currentCharacter.classList.remove('correct', 'incorrect');
    }
  }

  /**
   * Обрабатывает ввод символа.
   * @param {string} typedChar - Введенный символ
   * @param {NodeListOf<HTMLSpanElement>} characters - Список символов текста
   * @returns {void}
   */
  handleCharacterInput(typedChar: string, characters: NodeListOf<HTMLSpanElement>): void {
    const currentCharacter = characters[this.state.charIndex];
    const isCorrect = currentCharacter.textContent === typedChar;
    const colorClass = isCorrect ? 'text-green-500' : 'text-red-500';
    const borderClass = isCorrect ? 'border-green-500' : 'border-red-500';

    currentCharacter.classList.add(
      isCorrect ? 'correct' : 'incorrect',
      colorClass,
      borderClass,
    );

    if (!isCorrect) this.state.mistakes++;
    this.state.charIndex++;
  }

  /**
   * Обновляет стили символов.
   * @param {NodeListOf<HTMLSpanElement>} characters - Список символов текста
   * @returns {void}
   */
  updateCharacterStyles(characters: NodeListOf<HTMLSpanElement>): void {
    characters.forEach((span) => span.classList.remove('active'));
    characters[this.state.charIndex].classList.add('active', 'border-b');
  }

  /**
   * Обновляет статистику.
   * @returns {void}
   */
  updateStatistics(): void {
    const wpm = Math.round(((this.state.charIndex - this.state.mistakes) / 5 / (this.state.maxTime - this.state.timeLeft)) * 60);
    if (this.state.elements.wpm) {
      this.state.elements.wpm.textContent = String(
        wpm < 0 || !wpm || wpm === Infinity ? 0 : wpm,
      );
    }
    if (this.state.elements.mistake) {
      this.state.elements.mistake.textContent = String(this.state.mistakes);
    }
    if (this.state.elements.cpm) {
      this.state.elements.cpm.textContent = String(this.state.charIndex - this.state.mistakes);
    }
  }
}

new TypingSpeedTester();
