/**
 * Этот код реализует игру "Камень, ножницы, бумага" с интерфейсом пользователя.
 * Он включает в себя логику игры, отображение результатов и обновление счета.
 * Используются внешние библиотеки для иконок и визуальных эффектов.
 */

import './style.css';
import confetti from 'canvas-confetti';
import { icons } from 'feather-icons';

/**
 * Класс, представляющий игру "Камень, ножницы, бумага".
 */
class RockPaperScissorsGame {
  /**
   * Создает экземпляр игры.
   */
  constructor() {
    /**
     * Конфигурация игры.
     * @type {Object}
     */
    this.config = {
      /** @type {string} Корневой элемент для отображения игры */
      root: '#app',
      /** @type {Object} Селекторы для DOM-элементов */
      selectors: {
        choice: '[data-choice]',
        score: '[data-score]',
        message: '[data-message]',
        replay: '[data-action]',
        description: '[data-description]',
        options: '[data-options]',
      },
      /** @type {Object} Сообщения для различных состояний игры */
      gameMessages: {
        start: 'Get Started, Let\'s Rock!',
        win: 'You WIN 🥳',
        lose: 'You LOSE 🤥',
        draw: 'DRAW 🤝',
        makeMove: 'Make your move.',
      },
      /** @type {Object} SVG-иконки для вариантов выбора */
      icons: {
        rock: icons.octagon.toSvg({ width: 40, height: 40 }),
        paper: icons.file.toSvg({ width: 40, height: 40 }),
        scissors: icons.scissors.toSvg({ width: 40, height: 40 }),
      },
    };

    /**
     * Состояние игры.
     * @type {Object}
     */
    this.state = {
      /** @type {number} Максимальное количество попыток */
      maxAttempts: 3,
      /** @type {Object} Счет игры */
      scores: {
        user: 0,
        computer: 0,
      },
      /** @type {Object} DOM-элементы */
      elements: {
        score: null,
        message: null,
        replay: null,
        description: null,
        options: null,
      },
    };

    /**
     * Утилитарные функции.
     * @type {Object}
     */
    this.utils = {
      /**
       * Форматирует строку атрибута данных.
       * @param {string} element - Строка атрибута данных.
       * @returns {string} Отформатированная строка.
       */
      renderDataAttributes: (element) => element.slice(1, -1),
      /**
       * Генерирует случайное число в заданном диапазоне.
       * @param {number} min - Минимальное значение.
       * @param {number} max - Максимальное значение.
       * @returns {number} Случайное число.
       */
      getRandomNumber: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
    };

    this.init();
  }

  /**
   * Создает HTML-разметку игры.
   */
  createAppHTML() {
    const {
      root,
      selectors: {
        choice,
        score,
        message,
        replay,
        description,
        options,
      },
      gameMessages: {
        start,
        makeMove,
      },
      icons: {
        rock,
        paper,
        scissors,
      },
    } = this.config;
    const { renderDataAttributes } = this.utils;
    const { scores: { computer, user } } = this.state;
    const rootElement = document.querySelector(root);

    if (!rootElement) return;

    rootElement.innerHTML = `
     <div class='border shadow rounded max-w-xl w-full p-3 grid gap-4 md:p-5 bg-white'>
      <h1 class='text-center font-bold text-2xl md:text-4xl'>Rock Paper Scissors</h1>
      <main>
        <div class='border-4 border-black relative font-bold text-6xl md:text-8xl flex justify-center items-center p-10'>
          <span class='absolute top-1/2 -translate-y-1/2  text-sm left-0 p-2 bg-red-400 text-white'>user</span>
          <span class='absolute top-1/2 -translate-y-1/2  text-sm right-0 p-2 bg-red-400 text-white'>computer</span>
          <span ${renderDataAttributes(score)}='user'>${user}</span>:
          <span ${renderDataAttributes(score)}='computer'>${computer}</span>
        </div>
        <div class='text-center font-bold my-4' ${renderDataAttributes(message)}>${start}</div>
        <ul ${renderDataAttributes(options)} class='options grid gap-4 grid-cols-3 justify-items-center max-w-md mx-auto'>
          <li>
            <button class='border-4 border-black w-[80px] sm:w-[100px] h-[80px] sm:h-[100px] p-2 rounded-full' ${renderDataAttributes(choice)}='rock'>
              <div class='pointer-events-none flex justify-center'>${rock}</div>
            </button>
          </li>
          <li>
            <button class='border-4 border-black w-[80px] sm:w-[100px] h-[80px] sm:h-[100px] p-2 rounded-full' ${renderDataAttributes(choice)}='paper'>
              <div class='pointer-events-none flex justify-center'>${paper}</div>
            </button>
          </li>
          <li>
            <button class='border-4 border-black w-[80px] sm:w-[100px] h-[80px] sm:h-[100px] p-2 rounded-full' ${renderDataAttributes(choice)}='scissors'>
              <div class='pointer-events-none flex justify-center'>${scissors}</div>
            </button>
          </li>
        </ul>
      </main>
      <footer class='text-center grid place-items-center gap-3'>
        <p ${renderDataAttributes(description)}>${makeMove}</p>
        <button class='hidden px-3 py-2.5 border text-white bg-red-400 hover:bg-red-500' ${renderDataAttributes(replay)}='replay'>Repeat Game</button>
      </footer>
    </div>
  `;
  }

  /**
   * Инициализирует DOM-элементы.
   */
  initDOMElements() {
    this.state.elements = {
      score: document.querySelectorAll(this.config.selectors.score),
      message: document.querySelector(this.config.selectors.message),
      replay: document.querySelector(this.config.selectors.replay),
      description: document.querySelector(this.config.selectors.description),
      options: document.querySelector(this.config.selectors.options),
    };
  }

  /**
   * Инициализирует игру.
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();
    this.state.elements.options.addEventListener('click', (event) => {
      const choice = event.target.closest(this.config.selectors.choice);
      if (choice) {
        this.handleChoiceClick({ target: choice });
      }
    });
    this.state.elements.replay.addEventListener('click', () => location.reload());
  }

  /**
   * Отображает эффект конфетти.
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
   * Обрабатывает клик по выбору игрока.
   * @param {Object} param0 - Объект с целью клика.
   * @param {HTMLElement} param0.target - Элемент, по которому кликнули.
   */
  handleChoiceClick({ target: choice }) {
    const choices = ['rock', 'paper', 'scissors'];
    const userChoice = choice.dataset.choice;
    const computerChoice = choices[Math.floor(Math.random() * choices.length)];
    const result = this.getResult(userChoice, computerChoice);
    this.showResult(userChoice, computerChoice, result);
  }

  /**
   * Определяет результат игры.
   * @param {string} user - Выбор пользователя.
   * @param {string} computer - Выбор компьютера.
   * @returns {string} Результат игры.
   */
  getResult(user, computer) {
    if (user === computer) return 'draw';
    const winConditions = {
      rock: 'scissors',
      paper: 'rock',
      scissors: 'paper',
    };
    return winConditions[user] === computer ? 'win' : 'lose';
  }

  /**
   * Отображает результат игры.
   * @param {string} userChoice - Выбор пользователя.
   * @param {string} computerChoice - Выбор компьютера.
   * @param {string} result - Результат игры.
   */
  showResult(userChoice, computerChoice, result) {
    const { score: scoreElements } = this.state.elements;
    const [userScoreElement, computerScoreElement] = scoreElements;
    const { [result]: scoreUpdate = { user: 0, computer: 0 } } = {
      win: { user: 1, computer: 0 },
      lose: { user: 0, computer: 1 },
      draw: { user: 1, computer: 1 },
    };
    this.state.scores.user += scoreUpdate.user;
    this.state.scores.computer += scoreUpdate.computer;

    userScoreElement.textContent = this.state.scores.user.toString();
    computerScoreElement.textContent = this.state.scores.computer.toString();

    this.showMessage(userChoice, computerChoice, result);
    this.checkGameEnd();
  }

  /**
   * Проверяет, закончилась ли игра.
   */
  checkGameEnd() {
    if (this.state.scores.user === this.state.maxAttempts && this.state.scores.computer !== this.state.maxAttempts) {
      this.finishGame('win', 'text-green-500');
      this.showConfetti();
    } else if (this.state.scores.computer === this.state.maxAttempts) {
      this.finishGame('lose', 'text-red-500');
    } else if (this.state.scores.user === this.state.maxAttempts && this.state.scores.computer === this.state.maxAttempts) {
      this.finishGame('draw', 'text-gray-500');
    }
  }

  /**
   * Завершает игру.
   * @param {string} result - Результат игры.
   * @param {string} color - Цвет текста результата.
   */
  finishGame(result, color) {
    this.state.elements.message.classList.add('text-2xl', color);
    this.state.elements.message.textContent = this.config.gameMessages[result];
    this.state.elements.options.classList.add('hidden');
    this.state.elements.description.classList.add('hidden');
    this.state.elements.replay.classList.remove('hidden');
  }

  /**
   * Отображает сообщение о результате раунда.
   * @param {string} userChoice - Выбор пользователя.
   * @param {string} computerChoice - Выбор компьютера.
   * @param {string} result - Результат раунда.
   */
  showMessage(userChoice, computerChoice, result) {
    const choices = { rock: 'Rock', paper: 'Paper', scissors: 'Scissors' };
    const resultText = { win: 'beats', lose: 'loses to', draw: 'equals' };
    this.state.elements.message.innerHTML = `
    ${choices[userChoice]} <span class='text-sm'>(user)</span>
    ${resultText[result]}
    ${choices[computerChoice]} <span class='text-sm'>(comp)</span>.
  `;
  }
}

new RockPaperScissorsGame();