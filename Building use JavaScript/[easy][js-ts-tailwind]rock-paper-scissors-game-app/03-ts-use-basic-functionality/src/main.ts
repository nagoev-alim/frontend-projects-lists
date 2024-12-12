/**
 * Этот код реализует игру "Камень, ножницы, бумага" с интерфейсом пользователя.
 * Он включает в себя логику игры, управление состоянием, обновление пользовательского интерфейса
 * и эффекты конфетти при победе пользователя.
 */

import './style.css';
import confetti from 'canvas-confetti';
import { icons } from 'feather-icons';

/**
 * Интерфейс конфигурации приложения
 * @typedef {Object} AppConfig
 * @property {string} root - Корневой элемент приложения
 * @property {Object.<string, string>} selectors - Селекторы элементов
 * @property {Object.<string, string>} gameMessages - Игровые сообщения
 * @property {Object.<string, string>} icons - SVG иконки для выбора
 */
interface AppConfig {
  root: string;
  selectors: {
    [key: string]: string;
  };
  gameMessages: {
    [key: string]: string;
  };
  icons: {
    [key: string]: string;
  };
}

/**
 * Конфигурация приложения
 * @type {AppConfig}
 */
const APP_CONFIG: AppConfig = {
  root: '#app',
  selectors: {
    choice: '[data-choice]',
    score: '[data-score]',
    message: '[data-message]',
    replay: '[data-action]',
    description: '[data-description]',
    options: '[data-options]',
  },
  gameMessages: {
    start: 'Get Started, Let\'s Rock!',
    win: 'You WIN 🥳',
    lose: 'You LOSE 🤥',
    draw: 'DRAW 🤝',
    makeMove: 'Make your move.',
  },
  icons: {
    rock: icons.octagon.toSvg({ width: 40, height: 40 }),
    paper: icons.file.toSvg({ width: 40, height: 40 }),
    scissors: icons.scissors.toSvg({ width: 40, height: 40 }),
  },
};

/**
 * Интерфейс состояния приложения
 * @typedef {Object} AppState
 * @property {number} maxAttempts - Максимальное количество попыток
 * @property {Object} scores - Счет игры
 * @property {Object} elements - DOM элементы
 */
interface AppState {
  maxAttempts: number;
  scores: {
    user: number;
    computer: number;
  };
  elements: {
    [key: string]: HTMLElement | NodeListOf<HTMLElement> | null;
  };
}

/**
 * Состояние приложения
 * @type {AppState}
 */
const APP_STATE: AppState = {
  maxAttempts: 3,
  scores: {
    user: 0,
    computer: 0,
  },
  elements: {
    score: null,
    message: null,
    replay: null,
    description: null,
    options: null,
  },
};

/**
 * Интерфейс утилит приложения
 * @typedef {Object} AppUtils
 * @property {function(string): string} renderDataAttributes - Функция для рендеринга data-атрибутов
 * @property {function(number, number): number} getRandomNumber - Функция для получения случайного числа
 */
interface AppUtils {
  renderDataAttributes: (element: string) => string;
  getRandomNumber: (min: number, max: number) => number;
}

/**
 * Утилиты приложения
 * @type {AppUtils}
 */
const APP_UTILS: AppUtils = {
  renderDataAttributes: (element: string) => element.slice(1, -1),
  getRandomNumber: (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min,
};

/**
 * Создает HTML структуру приложения
 */
function createAppHTML(): void {
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
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const { scores: { computer, user } } = APP_STATE;
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
 * Инициализирует DOM элементы
 */
function initDOMElements(): void {
  APP_STATE.elements = {
    score: document.querySelectorAll(APP_CONFIG.selectors.score),
    message: document.querySelector(APP_CONFIG.selectors.message) as HTMLElement | null,
    replay: document.querySelector(APP_CONFIG.selectors.replay) as HTMLElement | null,
    description: document.querySelector(APP_CONFIG.selectors.description) as HTMLElement | null,
    options: document.querySelector(APP_CONFIG.selectors.options) as HTMLElement | null,
  };
}

/**
 * Инициализирует приложение
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();
  const optionsElement = APP_STATE.elements.options as HTMLElement;
  const replayElement = APP_STATE.elements.replay as HTMLElement;

  optionsElement.addEventListener('click', (event: MouseEvent) => {
    const choice = (event.target as HTMLElement).closest(APP_CONFIG.selectors.choice);
    if (choice) {
      handleChoiceClick({ target: choice as HTMLElement });
    }
  });
  replayElement.addEventListener('click', () => location.reload());
}

/**
 * Показывает эффект конфетти
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
 * Обрабатывает клик по выбору игрока
 * @param {Object} param0 - Объект с целевым элементом
 * @param {HTMLElement} param0.target - Целевой элемент клика
 */
function handleChoiceClick({ target: choice }: { target: HTMLElement }): void {
  const choices: string[] = ['rock', 'paper', 'scissors'];
  const userChoice: string = choice.dataset.choice || '';
  const computerChoice: string = choices[Math.floor(Math.random() * choices.length)];
  const result: string = getResult(userChoice, computerChoice);
  showResult(userChoice, computerChoice, result);
}

/**
 * Определяет результат игры
 * @param {string} user - Выбор пользователя
 * @param {string} computer - Выбор компьютера
 * @returns {string} Результат игры
 */
function getResult(user: string, computer: string): string {
  if (user === computer) return 'draw';
  const winConditions: { [key: string]: string } = {
    rock: 'scissors',
    paper: 'rock',
    scissors: 'paper',
  };
  return winConditions[user] === computer ? 'win' : 'lose';
}

/**
 * Показывает результат игры
 * @param {string} userChoice - Выбор пользователя
 * @param {string} computerChoice - Выбор компьютера
 * @param {string} result - Результат игры
 */
function showResult(userChoice: string, computerChoice: string, result: string): void {
  const { score: scoreElements } = APP_STATE.elements;
  const [userScoreElement, computerScoreElement] = scoreElements as NodeListOf<HTMLElement>;
  const scoreUpdate: { user: number; computer: number } = {
    win: { user: 1, computer: 0 },
    lose: { user: 0, computer: 1 },
    draw: { user: 1, computer: 1 },
  }[result] || { user: 0, computer: 0 };

  APP_STATE.scores.user += scoreUpdate.user;
  APP_STATE.scores.computer += scoreUpdate.computer;

  userScoreElement.textContent = APP_STATE.scores.user.toString();
  computerScoreElement.textContent = APP_STATE.scores.computer.toString();

  showMessage(userChoice, computerChoice, result);
  checkGameEnd();
}

/**
 * Проверяет, закончилась ли игра
 */
function checkGameEnd(): void {
  if (APP_STATE.scores.user === APP_STATE.maxAttempts && APP_STATE.scores.computer !== APP_STATE.maxAttempts) {
    finishGame('win', 'text-green-500');
    showConfetti();
  } else if (APP_STATE.scores.computer === APP_STATE.maxAttempts) {
    finishGame('lose', 'text-red-500');
  } else if (APP_STATE.scores.user === APP_STATE.maxAttempts && APP_STATE.scores.computer === APP_STATE.maxAttempts) {
    finishGame('draw', 'text-gray-500');
  }
}

/**
 * Завершает игру
 * @param {string} result - Результат игры
 * @param {string} color - Цвет текста результата
 */
function finishGame(result: string, color: string): void {
  const messageElement = APP_STATE.elements.message as HTMLElement;
  const optionsElement = APP_STATE.elements.options as HTMLElement;
  const descriptionElement = APP_STATE.elements.description as HTMLElement;
  const replayElement = APP_STATE.elements.replay as HTMLElement;

  messageElement.classList.add('text-2xl', color);
  messageElement.textContent = APP_CONFIG.gameMessages[result];
  optionsElement.classList.add('hidden');
  descriptionElement.classList.add('hidden');
  replayElement.classList.remove('hidden');
}

/**
 * Показывает сообщение о результате хода
 * @param {string} userChoice - Выбор пользователя
 * @param {string} computerChoice - Выбор компьютера
 * @param {string} result - Результат игры
 */
function showMessage(userChoice: string, computerChoice: string, result: string): void {
  const choices: { [key: string]: string } = { rock: 'Rock', paper: 'Paper', scissors: 'Scissors' };
  const resultText: { [key: string]: string } = { win: 'beats', lose: 'loses to', draw: 'equals' };
  const messageElement = APP_STATE.elements.message as HTMLElement;
  messageElement.innerHTML = `
    ${choices[userChoice]} <span class='text-sm'>(user)</span>
    ${resultText[result]}
    ${choices[computerChoice]} <span class='text-sm'>(comp)</span>.
  `;
}

/**
 * Вызывает функцию инициализации приложения.
 */
initApp();