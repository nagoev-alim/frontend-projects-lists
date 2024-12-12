/**
 * Этот код реализует игру "Угадай число". Игрок должен угадать случайно сгенерированное число от 1 до 10 за 3 попытки.
 * Код управляет логикой игры, обрабатывает пользовательский ввод, отображает сообщения и обновляет состояние игры.
 */

import './style.css';
import confetti from "canvas-confetti";
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

/**
 * Интерфейс для конфигурации приложения
 * @interface
 */
interface AppConfig {
  /** Корневой селектор приложения */
  root: string;
  /** Объект с селекторами элементов */
  selectors: {
    game: string;
    message: string;
    restartButton: string;
    input: string;
  };
}

/**
 * Конфигурация приложения
 * @type {AppConfig}
 */
const APP_CONFIG: AppConfig = {
  root: '#app',
  selectors: {
    game: '[data-game]',
    message: '[data-message]',
    restartButton: '[data-restart-button]',
    input: '[data-input]',
  },
};

/**
 * Интерфейс для состояния приложения
 * @interface
 */
interface AppState {
  /** Случайное число, которое нужно угадать */
  randomNumber: number;
  /** Максимальное количество попыток */
  maxAttempts: number;
  /** Объект с элементами DOM */
  elements: {
    game: HTMLFormElement | null;
    message: HTMLDivElement | null;
    restartButton: HTMLButtonElement | null;
    input: HTMLInputElement | null;
  };
}

/**
 * Состояние приложения
 * @type {AppState}
 */
const APP_STATE: AppState = {
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
 * Интерфейс для утилит приложения
 * @interface
 */
interface AppUtils {
  /** Функция для рендеринга data-атрибутов */
  renderDataAttributes: (element: string) => string;
  /** Функция для отображения toast-сообщения */
  showToast: (message: string) => void;
  /** Функция для получения случайного числа в заданном диапазоне */
  getRandomNumber: (min: number, max: number) => number;
}

/**
 * Утилиты приложения
 * @type {AppUtils}
 */
const APP_UTILS: AppUtils = {
  renderDataAttributes: (element: string): string => element.slice(1, -1),

  showToast: (message: string): void => {
    Toastify({
      text: message,
      className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
      duration: 3000,
      gravity: 'bottom',
      position: 'center',
    }).showToast();
  },

  getRandomNumber: (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min,
};

/**
 * Создает HTML-структуру приложения
 */
function createAppHTML(): void {
  const { root, selectors: { game, message, input } } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector<HTMLDivElement>(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='grid max-w-md w-full gap-4 rounded border p-3 shadow'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>Угадай число</h1>
      <p>Угадай число - это игра, в которой вы должны угадать число, заданное компьютером от 0 до 10. Используйте как можно меньше попыток. Удачи!</p>
      <form ${renderDataAttributes(game)}>
        <label aria-label='Введите число'>
          <input class='w-full border-2 px-3 py-2.5' type='number' name='guess' placeholder='Введите число' min='1' max='10' ${renderDataAttributes(input)}>
        </label>
      </form>
      <div class='hidden' ${renderDataAttributes(message)}></div>
    </div>
  `;
}

/**
 * Инициализирует DOM-элементы
 */
function initDOMElements(): void {
  APP_STATE.elements = {
    game: document.querySelector<HTMLFormElement>(APP_CONFIG.selectors.game),
    message: document.querySelector<HTMLDivElement>(APP_CONFIG.selectors.message),
    input: document.querySelector<HTMLInputElement>(APP_CONFIG.selectors.input),
    restartButton: null,
  };
}

/**
 * Инициализирует приложение
 */
function initApp(): void {
  console.log(APP_STATE.randomNumber);
  createAppHTML();
  initDOMElements();
  APP_STATE.elements.game?.addEventListener('submit', handleFormSubmit);
}

/**
 * Отображает конфетти при победе
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
 * Интерфейс для обработчиков сообщений
 * @interface
 */
interface MessageHandlers {
  error: (message: string) => void;
  lost: () => void;
  success: () => void;
}

/**
 * Обработчики сообщений
 * @type {MessageHandlers}
 */
const messageHandlers: MessageHandlers = {
  error: (message: string) => {
    APP_UTILS.showToast(message);
    if (APP_STATE.elements.input) {
      APP_STATE.elements.input.disabled = true;
      setTimeout(() => {
        if (APP_STATE.elements.input) {
          APP_STATE.elements.input.disabled = false;
          APP_STATE.elements.input.focus();
        }
      }, 2000);
    }
  },
  lost: () => renderMessage('orange'),
  success: () => renderMessage('green'),
};

/**
 * Обрабатывает отправку формы
 * @param {Event} event - Событие отправки формы
 */
function handleFormSubmit(event: Event): void {
  event.preventDefault();
  const target = event.target as HTMLFormElement;
  const guessInput = +(target.guess as HTMLInputElement).value;
  try {
    if (!guessInput) {
      throw new Error('Пожалуйста, введите число.');
    }
    if (isNaN(guessInput)) {
      throw new Error('Пожалуйста, введите корректное число.');
    }
    if (guessInput < 1 || guessInput > 10) {
      throw new Error('Пожалуйста, введите число от 1 до 10.');
    }
    if (guessInput === APP_STATE.randomNumber) {
      showMessage('success', 'Вы угадали! 🥳');
      APP_STATE.elements.game?.remove();
      showConfetti();
    } else {
      APP_STATE.maxAttempts--;
      if (APP_STATE.maxAttempts === 0) {
        APP_STATE.elements.game?.remove();
        showMessage(
          'lost',
          `Вы проиграли 🥲! Загаданное число было ${APP_STATE.randomNumber}`,
        );
      } else {
        showMessage('error', `Попробуйте еще раз. Осталось попыток: ${APP_STATE.maxAttempts}`);
        APP_STATE.elements.game?.reset();
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      APP_UTILS.showToast(error.message);
    }
  }
}

/**
 * Отображает сообщение
 * @param {keyof MessageHandlers} messageType - Тип сообщения
 * @param {string} message - Текст сообщения
 */
function showMessage(messageType: keyof MessageHandlers, message: string): void {
  if (APP_STATE.elements.message) {
    APP_STATE.elements.message.textContent = message;
    const handler = messageHandlers[messageType];
    if (handler) {
      handler(message);
    }
  }

  const restartButton = document.querySelector<HTMLButtonElement>(APP_CONFIG.selectors.restartButton);
  if (restartButton && messageType !== 'error') {
    restartButton.addEventListener('click', () => location.reload());
  }
}

/**
 * Отображает сообщение с определенным цветом
 * @param {'orange' | 'green'} type - Тип цвета сообщения
 */
function renderMessage(type: 'orange' | 'green'): void {
  if (APP_STATE.elements.message) {
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
      `<button class='border ${buttonClass} text-white px-3 py-2.5' data-restart-button>Сыграть еще раз?</button>`,
    );
  }
}

initApp();