/**
 * @fileoverview Игра в кости для двух игроков
 *
 * Это приложение реализует игру в кости для двух игроков. Игроки по очереди бросают кость,
 * накапливая очки. Если выпадает 1, текущий счет обнуляется и ход переходит к другому игроку.
 * Игрок может "задержать" свои очки, добавив их к общему счету. Первый игрок, достигший 100 очков, выигрывает.
 */
import './style.css';
import { icons } from 'feather-icons';


/**
 * @interface AppConfig
 * @description Конфигурация приложения
 */
interface AppConfig {
  /** Корневой селектор приложения */
  root: string;
  /** Селекторы для различных элементов игры */
  selectors: {
    playerOne: string;
    playerTwo: string;
    scoreOne: string;
    scoreTwo: string;
    currentOne: string;
    currentTwo: string;
    dice: string;
    newGame: string;
    rollDice: string;
    hold: string;
    info: string;
    overlay: string;
  };
}

/**
 * @interface AppState
 * @description Состояние приложения
 */
interface AppState {
  /** DOM элементы игры */
  elements: {
    playerOne: HTMLElement;
    playerTwo: HTMLElement;
    scoreOne: HTMLElement;
    scoreTwo: HTMLElement;
    currentOne: HTMLElement;
    currentTwo: HTMLElement;
    dice: HTMLImageElement;
    newGame: HTMLButtonElement;
    rollDice: HTMLButtonElement;
    hold: HTMLButtonElement;
    info: NodeListOf<HTMLElement> | null;
    overlay: HTMLElement;
  };
  /** Счет игроков */
  scores: [number, number];
  /** Текущий счет активного игрока */
  currentScore: number;
  /** Активный игрок (0 или 1) */
  activePlayer: 0 | 1;
  /** Флаг, указывающий, идет ли игра */
  playing: boolean;
  /** Конечный счет для победы */
  endScore: number;
}

/**
 * @interface AppUtils
 * @description Утилиты приложения
 */
interface AppUtils {
  /** Генерирует случайное число в заданном диапазоне */
  getRandomNumber: (min: number, max: number) => number;
  /** Обрабатывает строку с data-атрибутами */
  renderDataAttributes: (element: string) => string;
}

/**
 * @constant APP_CONFIG
 * @description Конфигурация приложения
 */
const APP_CONFIG: AppConfig = {
  root: '#app',
  selectors: {
    playerOne: '[data-player="0"]',
    playerTwo: '[data-player="1"]',
    scoreOne: '[data-score="0"]',
    scoreTwo: '[data-score="1"]',
    currentOne: '[data-current="0"]',
    currentTwo: '[data-current="1"]',
    dice: '[data-dice]',
    newGame: '[data-action="new-game"]',
    rollDice: '[data-action="roll-dice"]',
    hold: '[data-action="hold"]',
    info: '[data-action="toggle-info"]',
    overlay: '[data-overlay]',
  },
};

/**
 * @constant APP_STATE
 * @description Начальное состояние приложения
 */
const APP_STATE: AppState = {
  elements: {
    playerOne: document.createElement('div'),
    playerTwo: document.createElement('div'),
    scoreOne: document.createElement('div'),
    scoreTwo: document.createElement('div'),
    currentOne: document.createElement('div'),
    currentTwo: document.createElement('div'),
    dice: document.createElement('img'),
    newGame: document.createElement('button'),
    rollDice: document.createElement('button'),
    hold: document.createElement('button'),
    info: null,
    overlay: document.createElement('div'),
  },
  scores: [0, 0],
  currentScore: 0,
  activePlayer: 0,
  playing: true,
  endScore: 100,
};

/**
 * @constant APP_UTILS
 * @description Утилиты приложения
 */
const APP_UTILS: AppUtils = {
  /**
   * Генерирует случайное число в заданном диапазоне
   * @param {number} min - Минимальное значение
   * @param {number} max - Максимальное значение
   * @returns {number} Случайное число
   */
  getRandomNumber: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
  /**
   * Обрабатывает строку с data-атрибутами
   * @param {string} element - Строка с data-атрибутом
   * @returns {string} Обработанная строка
   */
  renderDataAttributes: (element) => element.slice(1, -1),
};

/**
 * Создает HTML структуру приложения.
 */
function createAppHTML(): void {
  const {
    root,
    selectors: {
      playerOne,
      playerTwo,
      scoreOne,
      scoreTwo,
      currentOne,
      currentTwo,
      dice,
      newGame,
      rollDice,
      hold,
      info,
      overlay,
    },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='root'>
      <div class='column column--player' ${renderDataAttributes(playerOne)}>
        <h3 class='font-normal text-2xl uppercase'>Player 1</h3>
        <p class='font-bold text-3xl' ${renderDataAttributes(scoreOne)}>1</p>
        <div class='current'>
          <p class='current__label'>Current</p>
          <p class='font-bold text-3xl' ${renderDataAttributes(currentOne)}>20</p>
        </div>
      </div>
      <div class='column column--buttons'>
        <img alt='Playing dice' class='dice' ${renderDataAttributes(dice)} src='dice-5.png' />
        <div class='buttons'>
          <button class='border hover:bg-slate-50 px-3 py-2' ${renderDataAttributes(newGame)}>New game</button>
          <button class='border hover:bg-slate-50 px-3 py-2' ${renderDataAttributes(rollDice)}>Roll dice</button>
          <button class='border hover:bg-slate-50 px-3 py-2' ${renderDataAttributes(hold)}>Hold</button>
          <button class='info' ${renderDataAttributes(info)}>${icons.info.toSvg({ color: '#6b48ff' })}</button>
        </div>
      </div>
      <div class='column column--player' ${renderDataAttributes(playerTwo)}>
        <h3 class='font-normal text-2xl uppercase'>Player 2</h3>
        <p class='font-bold text-3xl' ${renderDataAttributes(scoreTwo)}>2</p>
        <div class='current'>
          <p class='current__label'>Current</p>
          <p class='font-bold text-3xl' ${renderDataAttributes(currentTwo)}>40</p>
        </div>
      </div>
      <div class='overlay' ${renderDataAttributes(overlay)}>
        <h4 class='font-bold'>Game Rules</h4>
        <p>On a turn, a player rolls the die repeatedly. The goal is to accumulate as many points as possible, adding up the numbers rolled on the die. However, if a player rolls a 1, the player's turn is over and any points they have accumulated during this turn are forfeited. Rolling a 1 doesn't wipe out your entire score from previous turns, just the total earned during that particular roll.</p>
        <p>A player can also choose to hold (stop rolling the die) if they do not want to take a chance of rolling a 1 and losing all of their points from this turn. If the player chooses to hold, all of the points rolled during that turn are added to his or her score.</p>
        <p>When a player reaches a total of 100 or more points, the game ends and that player is the winner.</p>
        <button ${renderDataAttributes(info)}>${icons['corner-down-left'].toSvg({ color: '#6b48ff' })}</button>
      </div>
    </div>
  `;
}

/**
 * Инициализирует элементы DOM в состоянии приложения.
 */
function initDOMElements(): void {
  Object.keys(APP_CONFIG.selectors).forEach(key => {
    const selector = APP_CONFIG.selectors[key as keyof typeof APP_CONFIG.selectors];
    const element = document.querySelector(selector);
    if (element) {
      (APP_STATE.elements as any)[key] = element;
    }
  });
  APP_STATE.elements.info = document.querySelectorAll(APP_CONFIG.selectors.info);
}

/**
 * Инициализирует приложение.
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();
  initGame();
  APP_STATE.elements.newGame.addEventListener('click', initGame);
  APP_STATE.elements.rollDice.addEventListener('click', handleRollDiceClick);
  APP_STATE.elements.hold.addEventListener('click', handleHoldClick);
  APP_STATE.elements.info!.forEach((info) => info.addEventListener('click', () => APP_STATE.elements.overlay.classList.toggle('visible')));
}

/**
 * Инициализирует новую игру, сбрасывая все значения состояния и обновляя отображение.
 */
function initGame(): void {
  const {
    elements: {
      scoreOne: elScoreOne,
      scoreTwo: elScoreTwo,
      currentOne: elCurrentOne,
      currentTwo: elCurrentTwo,
      playerOne: elPlayerOne,
      playerTwo: elPlayerTwo,
      dice,
    },
  } = APP_STATE;

  APP_STATE.scores = [0, 0];
  APP_STATE.currentScore = 0;
  APP_STATE.activePlayer = 0;
  APP_STATE.playing = true;

  [elScoreOne, elScoreTwo, elCurrentOne, elCurrentTwo].forEach((el) => (el.textContent = '0'));

  dice.classList.add('hide');
  elPlayerOne.classList.add('active');
  elPlayerTwo.classList.remove('active');

  document.querySelectorAll('.winner').forEach((el) => el.classList.remove('winner'));
}

/**
 * Обрабатывает событие броска кубика.
 * Если игра активна, генерирует случайное число, обновляет отображение кубика
 * и либо обновляет текущий счет, либо переключает игрока.
 */
function handleRollDiceClick(): void {
  if (!APP_STATE.playing) return;

  const diceValue = APP_UTILS.getRandomNumber(1, 6);
  updateDiceDisplay(diceValue);

  diceValue !== 1 ? updateCurrentScore(diceValue) : switchPlayer();
}

/**
 * Обновляет отображение кубика на основе выпавшего значения.
 * @param {number} diceValue - Значение, выпавшее на кубике
 */
function updateDiceDisplay(diceValue: number): void {
  APP_STATE.elements.dice.classList.remove('hidden');
  APP_STATE.elements.dice.src = `dice-${diceValue}.png`;
}

/**
 * Обновляет текущий счет активного игрока.
 * @param {number} diceValue - Значение, выпавшее на кубике
 */
function updateCurrentScore(diceValue: number): void {
  APP_STATE.currentScore += diceValue;
  const currentPlayerElement = APP_STATE.elements[`current${APP_STATE.activePlayer === 0 ? 'One' : 'Two'}`];
  currentPlayerElement.textContent = APP_STATE.currentScore.toString();
}

/**
 * Переключает активного игрока, обнуляя текущий счет.
 */
function switchPlayer(): void {
  APP_STATE.elements[`current${APP_STATE.activePlayer === 0 ? 'One' : 'Two'}`].textContent = '0';
  APP_STATE.currentScore = 0;
  APP_STATE.activePlayer = APP_STATE.activePlayer === 0 ? 1 : 0;
  APP_STATE.elements.playerOne.classList.toggle('active');
  APP_STATE.elements.playerTwo.classList.toggle('active');
}

/**
 * Обрабатывает событие удержания текущего счета.
 * Если игра активна и состояние валидно, добавляет текущий счет к общему счету игрока
 * и либо завершает игру, либо переключает игрока.
 */
function handleHoldClick(): void {
  if (!APP_STATE.playing || !isValidGameState()) return;

  APP_STATE.scores[APP_STATE.activePlayer] += APP_STATE.currentScore;
  const scoreElement = APP_STATE.elements[`score${APP_STATE.activePlayer === 0 ? 'One' : 'Two'}`];
  scoreElement.textContent = APP_STATE.scores[APP_STATE.activePlayer].toString();

  APP_STATE.scores[APP_STATE.activePlayer] >= APP_STATE.endScore ? endGame() : switchPlayer();
}

/**
 * Проверяет валидность текущего состояния игры.
 * @returns {boolean} true, если состояние игры валидно, иначе false
 */
function isValidGameState(): boolean {
  return APP_STATE.currentScore !== null &&
    Array.isArray(APP_STATE.scores) &&
    (APP_STATE.activePlayer === 0 || APP_STATE.activePlayer === 1);
}

/**
 * Завершает игру, обновляя состояние и визуальное отображение.
 */
function endGame(): void {
  APP_STATE.playing = false;
  APP_STATE.elements.dice.classList.add('hidden');
  const currentActivePlayer = APP_STATE.elements[`player${APP_STATE.activePlayer === 0 ? 'One' : 'Two'}`];
  currentActivePlayer.classList.add('winner');
  currentActivePlayer.classList.remove('active');
}

// Инициализация приложения
initApp();
