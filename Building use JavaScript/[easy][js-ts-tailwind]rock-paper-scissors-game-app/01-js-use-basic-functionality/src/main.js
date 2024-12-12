/**
 * Этот код реализует игру "Камень, ножницы, бумага" с интерфейсом пользователя.
 * Он включает в себя логику игры, отображение результатов и обновление счета.
 * Используются внешние библиотеки для иконок и визуальных эффектов.
 */

import './style.css';
import confetti from 'canvas-confetti';
import { icons } from 'feather-icons';

/**
 * Конфигурация приложения
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента
 * @property {Object} selectors - Селекторы для различных элементов DOM
 * @property {Object} gameMessages - Сообщения для различных состояний игры
 * @property {Object} icons - SVG иконки для вариантов выбора
 */
const APP_CONFIG = {
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
 * Состояние приложения
 * @typedef {Object} AppState
 * @property {number} maxAttempts - Максимальное количество попыток
 * @property {Object} scores - Текущий счет игры
 * @property {Object} elements - Ссылки на элементы DOM
 */
const APP_STATE = {
  maxAttempts: 3,
  scores: {
    user: 0,
    computer: 0,
  },
  elements: {
    choice: null,
    score: null,
    message: null,
    replay: null,
    description: null,
    options: null,
  },
};

/**
 * Утилиты приложения
 * @typedef {Object} AppUtils
 * @property {Function} renderDataAttributes - Функция для рендеринга data-атрибутов
 * @property {Function} getRandomNumber - Функция для получения случайного числа
 */
const APP_UTILS = {
  renderDataAttributes: (element) => element.slice(1, -1),
  getRandomNumber: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
};

/**
 * Создает HTML-структуру приложения
 */
function createAppHTML() {
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
 * Инициализирует ссылки на элементы DOM
 */
function initDOMElements() {
  APP_STATE.elements = {
    score: document.querySelectorAll(APP_CONFIG.selectors.score),
    message: document.querySelector(APP_CONFIG.selectors.message),
    replay: document.querySelector(APP_CONFIG.selectors.replay),
    description: document.querySelector(APP_CONFIG.selectors.description),
    options: document.querySelector(APP_CONFIG.selectors.options),
  };
}

/**
 * Инициализирует приложение
 */
function initApp() {
  createAppHTML();
  initDOMElements();
  APP_STATE.elements.options.addEventListener('click', (event) => {
    const choice = event.target.closest(APP_CONFIG.selectors.choice);
    if (choice) {
      handleChoiceClick({ target: choice });
    }
  });
  APP_STATE.elements.replay.addEventListener('click', () => location.reload());
}

/**
 * Показывает эффект конфетти
 */
function showConfetti() {
  confetti({
    angle: APP_UTILS.getRandomNumber(55, 125),
    spread: APP_UTILS.getRandomNumber(50, 70),
    particleCount: APP_UTILS.getRandomNumber(50, 100),
    origin: { y: 0.6 },
  });
}

/**
 * Обрабатывает клик по выбору игрока
 * @param {Object} param0 - Объект с целью клика
 * @param {HTMLElement} param0.target - Элемент, по которому кликнули
 */
function handleChoiceClick({ target: choice }) {
  const choices = ['rock', 'paper', 'scissors'];
  const userChoice = choice.dataset.choice;
  const computerChoice = choices[Math.floor(Math.random() * choices.length)];
  const result = getResult(userChoice, computerChoice);
  showResult(userChoice, computerChoice, result);
}

/**
 * Определяет результат игры
 * @param {string} user - Выбор пользователя
 * @param {string} computer - Выбор компьютера
 * @returns {string} Результат игры ('win', 'lose', или 'draw')
 */
function getResult(user, computer) {
  if (user === computer) return 'draw';
  const winConditions = {
    rock: 'scissors',
    paper: 'rock',
    scissors: 'paper',
  };
  return winConditions[user] === computer ? 'win' : 'lose';
}

/**
 * Отображает результат игры
 * @param {string} userChoice - Выбор пользователя
 * @param {string} computerChoice - Выбор компьютера
 * @param {string} result - Результат игры
 */
function showResult(userChoice, computerChoice, result) {
  const { score: scoreElements } = APP_STATE.elements;
  const [userScoreElement, computerScoreElement] = scoreElements;
  const { [result]: scoreUpdate = { user: 0, computer: 0 } } = {
    win: { user: 1, computer: 0 },
    lose: { user: 0, computer: 1 },
    draw: { user: 1, computer: 1 },
  };
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
function checkGameEnd() {
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
 * @param {string} color - Цвет текста для отображения результата
 */
function finishGame(result, color) {
  APP_STATE.elements.message.classList.add('text-2xl', color);
  APP_STATE.elements.message.textContent = APP_CONFIG.gameMessages[result];
  APP_STATE.elements.options.classList.add('hidden');
  APP_STATE.elements.description.classList.add('hidden');
  APP_STATE.elements.replay.classList.remove('hidden');
}

/**
 * Показывает сообщение о результате раунда
 * @param {string} userChoice - Выбор пользователя
 * @param {string} computerChoice - Выбор компьютера
 * @param {string} result - Результат раунда
 */
function showMessage(userChoice, computerChoice, result) {
  const choices = { rock: 'Rock', paper: 'Paper', scissors: 'Scissors' };
  const resultText = { win: 'beats', lose: 'loses to', draw: 'equals' };
  APP_STATE.elements.message.innerHTML = `
    ${choices[userChoice]} <span class='text-sm'>(user)</span>
    ${resultText[result]}
    ${choices[computerChoice]} <span class='text-sm'>(comp)</span>.
  `;
}

initApp();