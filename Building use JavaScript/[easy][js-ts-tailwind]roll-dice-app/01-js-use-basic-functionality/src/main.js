/**
 * @fileoverview Игра в кости для двух игроков.
 * Игроки по очереди бросают кость, накапливая очки.
 * Цель - первым набрать 100 очков.
 * Если выпадает 1, ход переходит к другому игроку без начисления очков.
 */

import './style.css';
import { icons } from 'feather-icons';

/**
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента приложения.
 * @property {Object} selectors - Объект с селекторами элементов DOM.
 */

/**
 * Конфигурация приложения.
 * @type {AppConfig}
 */
const APP_CONFIG = {
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
 * @typedef {Object} AppState
 * @property {Object} elements - Объект с элементами DOM.
 * @property {number[]} scores - Массив с общими очками игроков.
 * @property {number} currentScore - Текущий счет активного игрока.
 * @property {number} activePlayer - Индекс активного игрока (0 или 1).
 * @property {boolean} playing - Флаг, указывающий, идет ли игра.
 * @property {number} endScore - Количество очков для победы.
 */

/**
 * Состояние приложения.
 * @type {AppState}
 */
const APP_STATE = {
  elements: {
    playerOne: null,
    playerTwo: null,
    scoreOne: null,
    scoreTwo: null,
    currentOne: null,
    currentTwo: null,
    dice: null,
    newGame: null,
    rollDice: null,
    hold: null,
    info: null,
    overlay: null,
  },
  scores: [0, 0],
  currentScore: 0,
  activePlayer: 0,
  playing: true,
  endScore: 100,
};

/**
 * Утилиты приложения.
 * @type {Object}
 */
const APP_UTILS = {
  /**
   * Генерирует случайное число в заданном диапазоне.
   * @param {number} min - Минимальное значение.
   * @param {number} max - Максимальное значение.
   * @returns {number} Случайное число.
   */
  getRandomNumber: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
  
  /**
   * Преобразует строку селектора в атрибут данных.
   * @param {string} element - Строка селектора.
   * @returns {string} Атрибут данных.
   */
  renderDataAttributes: (element) => element.slice(1, -1),
};

/**
 * Создает HTML структуру приложения.
 */
function createAppHTML() {
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
function initDOMElements() {
  Object.keys(APP_CONFIG.selectors).forEach(key => {
    APP_STATE.elements[key] = document.querySelector(APP_CONFIG.selectors[key]);
  });
  APP_STATE.elements.info = document.querySelectorAll(APP_CONFIG.selectors.info);
}

/**
 * Инициализирует приложение.
 */
function initApp() {
  createAppHTML();
  initDOMElements();
  initGame();
  APP_STATE.elements.newGame.addEventListener('click', initGame);
  APP_STATE.elements.rollDice.addEventListener('click', handleRollDiceClick);
  APP_STATE.elements.hold.addEventListener('click', handleHoldClick);
  APP_STATE.elements.info.forEach((info) => info.addEventListener('click', () => APP_STATE.elements.overlay.classList.toggle('visible')));
}

/**
 * Инициализирует новую игру.
 */
function initGame() {
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
 * Обрабатывает клик по кнопке "Бросить кость".
 */
function handleRollDiceClick() {
  if (!APP_STATE.playing) return;

  const dice = APP_UTILS.getRandomNumber(1, 6);
  updateDiceDisplay(dice);

  dice !== 1 ? updateCurrentScore(dice) : switchPlayer();
}

/**
 * Обновляет отображение кости.
 * @param {number} dice - Значение броска кости.
 */
function updateDiceDisplay(dice) {
  APP_STATE.elements.dice.classList.remove('hidden');
  APP_STATE.elements.dice.src = `dice-${dice}.png`;
}

/**
 * Обновляет текущий счет игрока.
 * @param {number} dice - Значение броска кости.
 */
function updateCurrentScore(dice) {
  APP_STATE.currentScore += dice;
  APP_STATE.elements[`current${APP_STATE.activePlayer === 0 ? 'One' : 'Two'}`].textContent =
    APP_STATE.currentScore;
}

/**
 * Переключает активного игрока.
 */
function switchPlayer() {
  if (APP_STATE.currentScore === null) return;

  APP_STATE.elements[`current${APP_STATE.activePlayer === 0 ? 'One' : 'Two'}`].textContent = 0;
  APP_STATE.currentScore = 0;
  APP_STATE.activePlayer = 1 - APP_STATE.activePlayer;
  APP_STATE.elements.playerOne.classList.toggle('active');
  APP_STATE.elements.playerTwo.classList.toggle('active');
}

/**
 * Обрабатывает клик по кнопке "Оставить".
 */
function handleHoldClick() {
  if (!APP_STATE.playing || !isValidGameState()) return;
  APP_STATE.scores[APP_STATE.activePlayer] += APP_STATE.currentScore;
  APP_STATE.elements[`score${APP_STATE.activePlayer === 0 ? 'One' : 'Two'}`].textContent = APP_STATE.scores[APP_STATE.activePlayer];
  APP_STATE.scores[APP_STATE.activePlayer] >= APP_STATE.endScore ? endGame() : switchPlayer();
}

/**
 * Проверяет валидность состояния игры.
 * @returns {boolean} True, если состояние игры валидно.
 */
function isValidGameState() {
  return APP_STATE.currentScore !== null && APP_STATE.scores !== null && APP_STATE.activePlayer !== null;
}

/**
 * Завершает игру.
 */
function endGame() {
  APP_STATE.playing = false;
  APP_STATE.elements.dice.classList.add('hidden');
  const currentActivePlayer = APP_STATE.elements[`player${APP_STATE.activePlayer === 0 ? 'One' : 'Two'}`];
  currentActivePlayer.classList.add('winner');
  currentActivePlayer.classList.remove('active');
}

initApp();
