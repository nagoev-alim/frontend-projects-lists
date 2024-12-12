/**
 * Этот код реализует игру "Угадай число". Пользователь должен угадать случайно сгенерированное число
 * от 1 до 100. Игра включает в себя ввод имени пользователя, подсказки после каждой попытки
 * и отображение результата в конце игры.
 */

import './style.css';
import confetti from 'canvas-confetti';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

/**
 * Интерфейс для конфигурации игры
 */
interface Config {
  /** Селектор корневого элемента */
  root: string;
  /** Объект с селекторами элементов */
  selectors: {
    /** Селектор истории догадок */
    guessHistory: string;
    /** Селектор формы ввода */
    guessForm: string;
    /** Селектор поля ввода */
    guessInput: string;
  };
}

/**
 * Интерфейс для состояния игры
 */
interface State {
  /** Имя игрока */
  player: string | null;
  /** Счетчик попыток */
  counter: number;
  /** Загаданное число */
  secretNumber: number;
  /** Объект с DOM элементами */
  elements: {
    /** Элемент истории догадок */
    guessHistory: HTMLUListElement | null;
    /** Элемент формы ввода */
    guessForm: HTMLFormElement | null;
    /** Элемент поля ввода */
    guessInput: HTMLInputElement | null;
  };
}

/**
 * Интерфейс для вспомогательных функций
 */
interface Utils {
  /** Функция для рендеринга data-атрибутов */
  renderDataAttributes: (element: string) => string;
  /** Функция для генерации случайного числа */
  getRandomNumber: (min: number, max: number) => number;
  /** Функция для отображения всплывающего уведомления */
  showToast: (message: string) => void;
}

/**
 * Класс, реализующий игру "Угадай число"
 */
class GuessNumber {
  private readonly config: Config;
  private state: State;
  private readonly utils: Utils;

  /**
   * Конструктор класса GuessNumber
   */
  constructor() {
    this.config = {
      root: '#app',
      selectors: {
        guessHistory: '[data-guess-history]',
        guessForm: '[data-guess-form]',
        guessInput: '[data-guess-input]',
      },
    };

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

    this.utils = {
      renderDataAttributes: (element: string): string => element.slice(1, -1),
      getRandomNumber: (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min,
      showToast: (message: string): void => {
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
   * Создает HTML разметку приложения
   */
  private createAppHTML(): void {
    const { root, selectors: { guessHistory, guessForm, guessInput } } = this.config;
    const { renderDataAttributes } = this.utils;
    const rootElement = document.querySelector<HTMLElement>(root);

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
  private initDOMElements(): void {
    this.state.elements = {
      guessHistory: document.querySelector<HTMLUListElement>(this.config.selectors.guessHistory),
      guessForm: document.querySelector<HTMLFormElement>(this.config.selectors.guessForm),
      guessInput: document.querySelector<HTMLInputElement>(this.config.selectors.guessInput),
    };
  }

  /**
   * Инициализирует игру
   */
  private init(): void {
    this.createAppHTML();
    this.initDOMElements();

    if (this.state.elements.guessInput) {
      this.state.elements.guessInput.focus();
    }
    this.displayMessage('👨 Enter your name:');
    this.state.elements.guessForm?.addEventListener('submit', this.handleGuessFormSubmit.bind(this));
  }

  /**
   * Отображает эффект конфетти
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
   * Отображает сообщение в истории игры
   * @param message - Сообщение для отображения
   */
  private displayMessage(message: string): void {
    const li = document.createElement('li');
    li.className = 'text-xl';
    li.textContent = message;
    this.state.elements.guessHistory?.appendChild(li);
  }

  /**
   * Обрабатывает отправку формы с предположением
   * @param event - Событие отправки формы
   */
  private handleGuessFormSubmit(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const guess = formData.get('guess') as string;

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

    this.processGuess(guessNumber, form);
    if (this.state.elements.guessInput) {
      this.state.elements.guessInput.value = '';
    }
  }

  /**
   * Инициализирует игрока
   * @param name - Имя игрока
   */
  private initializePlayer(name: string): void {
    this.state.player = name;
    if (this.state.elements.guessHistory) {
      this.state.elements.guessHistory.innerHTML = '';
    }
    this.displayMessage(
      `👨 ${name}, there is a number between 0 and 100. Try to guess it in the fewest number of tries. After each attempt, there will be a message with the text - 'Few', 'Many' or 'Right'.`,
    );
    if (this.state.elements.guessInput) {
      this.state.elements.guessInput.value = '';
      this.state.elements.guessInput.setAttribute('type', 'number');
    }
  }

  /**
   * Обрабатывает предположение игрока
   * @param guessNumber - Предполагаемое число
   * @param form - Форма ввода
   */
  private processGuess(guessNumber: number, form: HTMLFormElement): void {
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