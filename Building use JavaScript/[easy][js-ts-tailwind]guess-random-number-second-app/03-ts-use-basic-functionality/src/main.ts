/**
 * Этот код реализует игру "Угадай число". Игрок вводит свое имя, затем пытается угадать
 * случайное число от 1 до 100. После каждой попытки игрок получает подсказку.
 * Когда число угадано, показывается количество попыток и запускается анимация конфетти.
 */

import './style.css';
import confetti from 'canvas-confetti';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

/**
 * Интерфейс для конфигурации приложения
 */
interface AppConfig {
  /** Селектор корневого элемента */
  root: string;
  /** Объект с селекторами элементов */
  selectors: {
    /** Селектор для истории предположений */
    guessHistory: string;
    /** Селектор для формы ввода предположений */
    guessForm: string;
    /** Селектор для поля ввода предположений */
    guessInput: string;
  };
}

/**
 * Объект конфигурации приложения
 */
const APP_CONFIG: AppConfig = {
  root: '#app',
  selectors: {
    guessHistory: '[data-guess-history]',
    guessForm: '[data-guess-form]',
    guessInput: '[data-guess-input]',
  },
};

/**
 * Интерфейс для состояния приложения
 */
interface AppState {
  /** Имя игрока */
  player: string | null;
  /** Счетчик попыток */
  counter: number;
  /** Загаданное число */
  secretNumber: number;
  /** Объект с DOM элементами */
  elements: {
    /** Элемент истории предположений */
    guessHistory: HTMLElement | null;
    /** Элемент формы ввода предположений */
    guessForm: HTMLFormElement | null;
    /** Элемент поля ввода предположений */
    guessInput: HTMLInputElement | null;
  };
}

/**
 * Объект состояния приложения
 */
const APP_STATE: AppState = {
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
 * Интерфейс для утилитарных функций
 */
interface AppUtils {
  /** Функция для рендеринга data-атрибутов */
  renderDataAttributes: (element: string) => string;
  /** Функция для получения случайного числа */
  getRandomNumber: (min: number, max: number) => number;
  /** Функция для отображения всплывающего уведомления */
  showToast: (message: string) => void;
}

/**
 * Объект с утилитарными функциями
 */
const APP_UTILS: AppUtils = {
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
function createAppHTML(): void {
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
function initDOMElements(): void {
  APP_STATE.elements = {
    guessHistory: document.querySelector(APP_CONFIG.selectors.guessHistory),
    guessForm: document.querySelector(APP_CONFIG.selectors.guessForm),
    guessInput: document.querySelector(APP_CONFIG.selectors.guessInput),
  };
}

/**
 * Инициализирует приложение
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();

  if (APP_STATE.elements.guessInput) {
    APP_STATE.elements.guessInput.focus();
  }
  displayMessage('👨 Enter your name:');
  APP_STATE.elements.guessForm?.addEventListener('submit', handleGuessFormSubmit);
}

/**
 * Запускает анимацию конфетти
 */
function showConfetti(): void {
  confetti({
    angle: APP_UTILS.getRandomNumber(55, 125),
    spread: APP_UTILS.getRandomNumber(50, 70),
    particleCount: APP_UTILS.getRandomNumber(50, 100),
    origin: { y: 0.6 },
  });
}

/**
 * Отображает сообщение в истории игры
 * @param message - Сообщение для отображения
 */
function displayMessage(message: string): void {
  const li = document.createElement('li');
  li.className = 'text-xl';
  li.textContent = message;
  APP_STATE.elements.guessHistory?.appendChild(li);
}

/**
 * Обрабатывает отправку формы с предположением
 * @param event - Событие отправки формы
 */
function handleGuessFormSubmit(event: Event): void {
  event.preventDefault();
  const target = event.target as HTMLFormElement;
  const { guess } = Object.fromEntries(new FormData(target));

  if (!guess) {
    APP_UTILS.showToast('Please enter a guess');
    return;
  }

  if (!APP_STATE.player) {
    initializePlayer(guess.toString());
    return;
  }

  const guessNumber = Number(guess);
  if (isNaN(guessNumber)) {
    APP_UTILS.showToast('Please enter a valid number');
    return;
  }

  processGuess(guessNumber, target);
  if (APP_STATE.elements.guessInput) {
    APP_STATE.elements.guessInput.value = '';
  }
}

/**
 * Инициализирует игрока
 * @param name - Имя игрока
 */
function initializePlayer(name: string): void {
  APP_STATE.player = name;
  if (APP_STATE.elements.guessHistory) {
    APP_STATE.elements.guessHistory.innerHTML = '';
  }
  displayMessage(
    `👨 ${name}, there is a number between 0 and 100. Try to guess it in the fewest number of tries. After each attempt, there will be a message with the text - 'Few', 'Many' or 'Right'.`,
  );
  if (APP_STATE.elements.guessInput) {
    APP_STATE.elements.guessInput.value = '';
    APP_STATE.elements.guessInput.setAttribute('type', 'number');
  }
}

/**
 * Обрабатывает предположение игрока
 * @param guessNumber - Предполагаемое число
 * @param form - Форма ввода предположения
 */
function processGuess(guessNumber: number, form: HTMLFormElement): void {
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