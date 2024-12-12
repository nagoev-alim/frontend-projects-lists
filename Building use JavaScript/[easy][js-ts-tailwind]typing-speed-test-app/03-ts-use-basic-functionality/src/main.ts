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
  isTyping: boolean;
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

/**
 * Конфигурация приложения.
 */
const APP_CONFIG: AppConfig = {
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
 * Состояние приложения.
 */
const APP_STATE: AppState = {
  elements: {},
  timer: null,
  maxTime: 60,
  timeLeft: 0,
  charIndex: 0,
  mistakes: 0,
  isTyping: false,
};

/**
 * Утилиты приложения.
 */
const APP_UTILS: AppUtils = {
  renderDataAttributes: (element: string): string => element.slice(1, -1),
  toastConfig: {
    className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
    duration: 3000,
    gravity: 'bottom',
    position: 'center',
  },
  showToast: (message: string): void => {
    // @ts-ignore
    Toastify({
      text: message,
      ...APP_UTILS.toastConfig,
    }).showToast();
  },
  handleError: (message: string, error: any = null): void => {
    APP_UTILS.showToast(message);
    if (error) console.error(message, error);
  },
};

/**
 * Создает HTML-разметку для приложения.
 */
function createAppHTML(): void {
  const { root, selectors: { input, text, reset } } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector<HTMLElement>(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='grid gap-4 max-w-xl w-full rounded border bg-white p-3 shadow'>
      <h1 class='text-center font-bold text-2xl md:text-4xl'>Typing Speed Test</h1>
      <input class='visually-hidden' type='text' ${renderDataAttributes(input)}>
      <p class='rounded border p-1 tracking-widest' ${renderDataAttributes(text)}></p>
      <ul class='grid grid-cols-4 gap-2'>
        ${APP_CONFIG.LABELS.map(({ label, value, data }) => `
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
 * Инициализирует DOM-элементы приложения.
 */
function initDOMElements(): void {
  APP_STATE.elements = {
    input: document.querySelector<HTMLInputElement>(APP_CONFIG.selectors.input),
    text: document.querySelector<HTMLParagraphElement>(APP_CONFIG.selectors.text),
    time: document.querySelector<HTMLSpanElement>(APP_CONFIG.selectors.time),
    mistake: document.querySelector<HTMLSpanElement>(APP_CONFIG.selectors.mistake),
    wpm: document.querySelector<HTMLSpanElement>(APP_CONFIG.selectors.wpm),
    cpm: document.querySelector<HTMLSpanElement>(APP_CONFIG.selectors.cpm),
    reset: document.querySelector<HTMLButtonElement>(APP_CONFIG.selectors.reset),
  };
}

/**
 * Инициализирует приложение.
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();
  (async () => {
    await initializeTypingTest();
    APP_STATE.elements.reset?.addEventListener('click', handleResetClick);
    APP_STATE.elements.input?.addEventListener('input', handleInputChange);
  })();
}

/**
 * Инициализирует тест печати.
 */
async function initializeTypingTest(): Promise<void> {
  try {
    if (APP_STATE.elements.text) {
      APP_STATE.elements.text.textContent = 'Loading...';
      const typingText = await fetchTypingText();
      APP_STATE.elements.text.innerHTML = typingText
        .split('')
        .map((char, idx) => `<span class="${idx === 0 ? 'active border-b-2 border-orange-500 text-orange-500' : ''}">${char}</span>`)
        .join('');
      APP_STATE.elements.text.addEventListener('click', () => APP_STATE.elements.input?.focus());
      document.addEventListener('keydown', () => APP_STATE.elements.input?.focus());
      APP_STATE.timeLeft = APP_STATE.maxTime;
      if (APP_STATE.elements.time) {
        APP_STATE.elements.time.textContent = String(APP_STATE.timeLeft);
      }
    }
  } catch (error) {
    APP_UTILS.handleError('Failed to load paragraph', error);
    if (APP_STATE.elements.text) {
      APP_STATE.elements.text.textContent = '';
    }
  }
}

/**
 * Получает текст для теста печати.
 * @returns {Promise<string>} Текст для теста печати.
 */
async function fetchTypingText(): Promise<string> {
  const randomMockText = APP_CONFIG.MOCK_DATA[Math.floor(Math.random() * APP_CONFIG.MOCK_DATA.length)];
  try {
    const { data: { status, text } } = await axios.get<{ status: string; text: string }>(APP_CONFIG.API_ENDPOINT);
    return status === 'success' ? text : randomMockText;
  } catch {
    return randomMockText;
  }
}

/**
 * Обрабатывает клик по кнопке сброса.
 */
async function handleResetClick(): Promise<void> {
  await initializeTypingTest();

  if (APP_STATE.timer !== null) {
    clearInterval(APP_STATE.timer);
  }
  APP_STATE.timeLeft = APP_STATE.maxTime;

  APP_STATE.charIndex = 0;
  APP_STATE.mistakes = 0;
  APP_STATE.isTyping = false;

  if (APP_STATE.elements.input instanceof HTMLInputElement) {
    APP_STATE.elements.input.value = '';
  }

  if (APP_STATE.elements.time) {
    APP_STATE.elements.time.textContent = String(APP_STATE.timeLeft);
  }
  const elementsToReset = [APP_STATE.elements.wpm, APP_STATE.elements.mistake, APP_STATE.elements.cpm];
  elementsToReset.forEach(el => {
    if (el) el.textContent = '0';
  });
}

/**
 * Инициализирует таймер.
 */

function initTimer(): void {
  if (APP_STATE.timeLeft > 0) {
    APP_STATE.timeLeft--;
    if (APP_STATE.elements.time) {
      APP_STATE.elements.time.innerText = String(APP_STATE.timeLeft);
    }

    const elapsedTime = APP_STATE.maxTime - APP_STATE.timeLeft;
    const wordsTyped = (APP_STATE.charIndex - APP_STATE.mistakes) / 5;
    const wpm = Math.round((wordsTyped / elapsedTime) * 60);
    if (APP_STATE.elements.wpm) {
      APP_STATE.elements.wpm.textContent = String(wpm);
    }
  } else if (APP_STATE.timer !== null) {
    clearInterval(APP_STATE.timer);
  }
}

/**
 * Обрабатывает изменение ввода.
 * @param {Event} event - Событие ввода
 * @returns {void}
 */
function handleInputChange(event: Event): void {
  const target = event.target as HTMLInputElement;
  const value = target.value;
  const characters = APP_STATE.elements.text?.querySelectorAll('span');
  const typedChar = value[APP_STATE.charIndex];

  if (characters && APP_STATE.charIndex < characters.length - 1 && APP_STATE.timeLeft > 0) {
    if (!APP_STATE.isTyping) {
      APP_STATE.timer = setInterval(initTimer, 1000);
      APP_STATE.isTyping = true;
    }
    processTypedCharacter(typedChar, characters);
    updateCharacterStyles(characters);
    updateStatistics();
  } else {
    if (APP_STATE.timer !== null) {
      clearInterval(APP_STATE.timer);
    }
    if (APP_STATE.elements.input instanceof HTMLInputElement) {
      APP_STATE.elements.input.value = '';
    }
  }
}

/**
 * Обрабатывает введенный символ.
 * @param {string | undefined} typedChar - Введенный символ
 * @param {NodeListOf<HTMLSpanElement>} characters - Список символов текста
 * @returns {void}
 */
function processTypedCharacter(typedChar: string | undefined, characters: NodeListOf<HTMLSpanElement>): void {
  if (typedChar === undefined) {
    handleBackspace(characters);
  } else {
    handleCharacterInput(typedChar, characters);
  }
}

/**
 * Обрабатывает нажатие клавиши backspace.
 * @param {NodeListOf<HTMLSpanElement>} characters - Список символов текста
 * @returns {void}
 */
function handleBackspace(characters: NodeListOf<HTMLSpanElement>): void {
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
 * Обрабатывает ввод символа.
 * @param {string} typedChar - Введенный символ
 * @param {NodeListOf<HTMLSpanElement>} characters - Список символов текста
 * @returns {void}
 */
function handleCharacterInput(typedChar: string, characters: NodeListOf<HTMLSpanElement>): void {
  const currentCharacter = characters[APP_STATE.charIndex];
  const isCorrect = currentCharacter.textContent === typedChar;
  const colorClass = isCorrect ? 'text-green-500' : 'text-red-500';
  const borderClass = isCorrect ? 'border-green-500' : 'border-red-500';

  currentCharacter.classList.add(
    isCorrect ? 'correct' : 'incorrect',
    colorClass,
    borderClass,
  );

  if (!isCorrect) APP_STATE.mistakes++;
  APP_STATE.charIndex++;
}

/**
 * Обновляет стили символов.
 * @param {NodeListOf<HTMLSpanElement>} characters - Список символов текста
 * @returns {void}
 */
function updateCharacterStyles(characters: NodeListOf<HTMLSpanElement>): void {
  characters.forEach((span) => span.classList.remove('active'));
  characters[APP_STATE.charIndex].classList.add('active', 'border-b');
}

/**
 * Обновляет статистику.
 * @returns {void}
 */
function updateStatistics(): void {
  const wpm = Math.round(((APP_STATE.charIndex - APP_STATE.mistakes) / 5 / (APP_STATE.maxTime - APP_STATE.timeLeft)) * 60);
  if (APP_STATE.elements.wpm) {
    APP_STATE.elements.wpm.textContent = String(
      wpm < 0 || !wpm || wpm === Infinity ? 0 : wpm,
    );
  }
  if (APP_STATE.elements.mistake) {
    APP_STATE.elements.mistake.textContent = String(APP_STATE.mistakes);
  }
  if (APP_STATE.elements.cpm) {
    APP_STATE.elements.cpm.textContent = String(APP_STATE.charIndex - APP_STATE.mistakes);
  }
}

initApp();
