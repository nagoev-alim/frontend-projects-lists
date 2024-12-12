/**
 * Этот код реализует игру "Угадай число". Игрок должен угадать случайно сгенерированное число от 1 до 10 за 3 попытки.
 * Код управляет логикой игры, обрабатывает пользовательский ввод, отображает сообщения и обновляет состояние игры.
 */

import './style.css';
import confetti from 'canvas-confetti';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

/**
 * Интерфейс конфигурации игры
 * @interface
 */
interface Config {
  /** Селектор корневого элемента */
  root: string;
  /** Объект с селекторами элементов игры */
  selectors: {
    game: string;
    message: string;
    restartButton: string;
    input: string;
  };
}

/**
 * Интерфейс состояния игры
 * @interface
 */
interface State {
  /** Случайно сгенерированное число для угадывания */
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
 * Интерфейс утилит игры
 * @interface
 */
interface Utils {
  /** Функция для рендеринга data-атрибутов */
  renderDataAttributes: (element: string) => string;
  /** Функция для отображения toast-уведомлений */
  showToast: (message: string) => void;
  /** Функция для генерации случайного числа в заданном диапазоне */
  getRandomNumber: (min: number, max: number) => number;
}

/**
 * Класс, реализующий игру "Угадай число"
 */
class GuessRandomNumber {
  /** Конфигурация игры */
  private readonly config: Config;
  /** Состояние игры */
  private state: State;
  /** Утилиты игры */
  private readonly utils: Utils;

  /**
   * Создает экземпляр игры "Угадай число"
   */
  constructor() {
    this.config = {
      root: '#app',
      selectors: {
        game: '[data-game]',
        message: '[data-message]',
        restartButton: '[data-restart-button]',
        input: '[data-input]',
      },
    };

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

    this.utils = {
      renderDataAttributes: (element: string): string => element.slice(1, -1),
      showToast: (message: string): void => {
        Toastify({
          text: message,
          className:
            'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
          duration: 3000,
          gravity: 'bottom',
          position: 'center',
        }).showToast();
      },
      getRandomNumber: (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min,
    };

    this.init();
  }

  /**
   * Создает HTML-разметку игры
   */
  private createAppHTML(): void {
    const { root, selectors: { game, message, input } } = this.config;
    const { renderDataAttributes } = this.utils;
    const rootElement = document.querySelector(root);

    if (!rootElement) return;

    rootElement.innerHTML = `
    <div class='grid max-w-md w-full gap-4 rounded border p-3 shadow'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>Угадай число</h1>
      <p>Угадай число - это игра, в которой вы должны угадать число от 0 до 10, заданное компьютером. Используйте как можно меньше попыток. Удачи!</p>
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
   * Инициализирует элементы DOM
   */
  private initDOMElements(): void {
    this.state.elements = {
      game: document.querySelector<HTMLFormElement>(this.config.selectors.game),
      message: document.querySelector<HTMLDivElement>(this.config.selectors.message),
      input: document.querySelector<HTMLInputElement>(this.config.selectors.input),
      restartButton: null,
    };
  }

  /**
   * Инициализирует игру
   */
  private init(): void {
    console.log(this.state.randomNumber);
    this.createAppHTML();
    this.initDOMElements();
    this.state.elements.game?.addEventListener('submit', this.handleFormSubmit.bind(this));
  }

  /**
   * Отображает конфетти при победе
   */
  private showConfetti(): void {
    confetti({
      angle: this.utils.getRandomNumber(55, 125),
      spread: this.utils.getRandomNumber(50, 70),
      particleCount: this.utils.getRandomNumber(50, 100),
      origin: { y: 0.6 },
    });
  }

  /**
   * Возвращает объект с обработчиками сообщений
   * @returns {Object} Объект с обработчиками сообщений
   */
  private messageHandlers(): { [key: string]: (message?: string) => void } {
    return {
      error: (message?: string) => {
        this.utils.showToast(message || '');
        if (this.state.elements.input) {
          this.state.elements.input.disabled = true;
          setTimeout(() => {
            if (this.state.elements.input) {
              this.state.elements.input.disabled = false;
              this.state.elements.input.focus();
            }
          }, 2000);
        }
      },
      lost: () => this.renderMessage('orange'),
      success: () => this.renderMessage('green'),
    };
  }

  /**
   * Обрабатывает отправку формы
   * @param {Event} event - Событие отправки формы
   */
  private handleFormSubmit(event: Event): void {
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
      if (guessInput === this.state.randomNumber) {
        this.showMessage('success', 'Вы угадали! 🥳');
        this.state.elements.game?.remove();
        this.showConfetti();
      } else {
        this.state.maxAttempts--;
        if (this.state.maxAttempts === 0) {
          this.state.elements.game?.remove();
          this.showMessage(
            'lost',
            `Вы проиграли 🥲! Загаданное число было ${this.state.randomNumber}`,
          );
        } else {
          this.showMessage('error', `Попробуйте еще раз. Осталось попыток: ${this.state.maxAttempts}`);
          this.state.elements.game?.reset();
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        this.utils.showToast(error.message);
      }
    }
  }

  /**
   * Отображает сообщение
   * @param {string} messageType - Тип сообщения
   * @param {string} message - Текст сообщения
   */
  private showMessage(messageType: string, message: string): void {
    if (this.state.elements.message) {
      this.state.elements.message.textContent = message;
      const handler = this.messageHandlers()[messageType];
      if (handler) {
        handler(message);
      }
    }

    const restartButton = document.querySelector<HTMLButtonElement>(this.config.selectors.restartButton);
    if (restartButton && messageType !== 'error') {
      restartButton.addEventListener('click', () => location.reload());
    }
  }

  /**
   * Рендерит сообщение с соответствующим стилем
   * @param {('orange'|'green')} type - Тип сообщения (оранжевый или зеленый)
   */
  private renderMessage(type: 'orange' | 'green'): void {
    if (this.state.elements.message) {
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
        `<button class='border ${buttonClass} text-white px-3 py-2.5' ${this.utils.renderDataAttributes(this.config.selectors.restartButton)}>Сыграть еще раз?</button>`,
      );
    }
  }
}

new GuessRandomNumber();