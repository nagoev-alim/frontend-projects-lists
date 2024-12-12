/**
 * @fileoverview Игра в кости для двух игроков.
 *
 * Этот модуль реализует игру "Свинья" (Pig) для двух игроков.
 * Игроки по очереди бросают кость, накапливая очки.
 * Цель игры - первым набрать 100 очков.
 * Если выпадает 1, ход переходит к другому игроку без начисления очков.
 * Игрок может решить "оставить" накопленные очки, добавив их к общему счету.
 */

import './style.css';
import { icons } from 'feather-icons';

class PigGame {
  /**
   * Создает экземпляр игры "Свинья".
   * Инициализирует конфигурацию, состояние и утилиты игры.
   */
  constructor() {
    /**
     * Конфигурация игры.
     * @type {Object}
     */
    this.config = {
      /** Корневой элемент приложения. */
      root: '#app',
      /** Селекторы для различных элементов игры. */
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
     * Состояние игры.
     * @type {Object}
     */
    this.state = {
      /** Ссылки на DOM элементы. */
      elements: {},
      /** Очки игроков. */
      scores: [0, 0],
      /** Текущий счет активного игрока. */
      currentScore: 0,
      /** Индекс активного игрока (0 или 1). */
      activePlayer: 0,
      /** Флаг, указывающий, идет ли игра. */
      playing: true,
      /** Количество очков для победы. */
      endScore: 100,
    };

    /**
     * Утилитарные функции.
     * @type {Object}
     */
    this.utils = {
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

    this.init();
  }

  /**
   * Создает HTML структуру приложения.
   */
  createAppHTML() {
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
    } = this.config;
    const { renderDataAttributes } = this.utils;
    const rootElement = document.querySelector(root);

    if (!rootElement) return;

    rootElement.innerHTML = `
    <div class='root'>
      <div class='column column--player' ${renderDataAttributes(playerOne)}>
        <h3 class='font-normal text-2xl uppercase'>Player 1</h3>
        <p class='font-bold text-3xl' ${renderDataAttributes(scoreOne)}>0</p>
        <div class='current'>
          <p class='current__label'>Current</p>
          <p class='font-bold text-3xl' ${renderDataAttributes(currentOne)}>0</p>
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
        <p class='font-bold text-3xl' ${renderDataAttributes(scoreTwo)}>0</p>
        <div class='current'>
          <p class='current__label'>Current</p>
          <p class='font-bold text-3xl' ${renderDataAttributes(currentTwo)}>0</p>
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
  initDOMElements() {
    Object.keys(this.config.selectors).forEach(key => {
      this.state.elements[key] = document.querySelector(this.config.selectors[key]);
    });
    this.state.elements.info = document.querySelectorAll(this.config.selectors.info);
  }

  /**
   * Инициализирует приложение.
   * Создает HTML, инициализирует DOM элементы и добавляет обработчики событий.
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();
    this.initGame();
    this.state.elements.newGame.addEventListener('click', this.initGame.bind(this));
    this.state.elements.rollDice.addEventListener('click', this.handleRollDiceClick.bind(this));
    this.state.elements.hold.addEventListener('click', this.handleHoldClick.bind(this));
    this.state.elements.info.forEach((info) => info.addEventListener('click', () => this.state.elements.overlay.classList.toggle('visible')));
  }

  /**
   * Инициализирует новую игру.
   * Сбрасывает счет, текущие очки и состояние игры.
   */
  initGame() {
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
    } = this.state;

    this.state.scores = [0, 0];
    this.state.currentScore = 0;
    this.state.activePlayer = 0;
    this.state.playing = true;

    [elScoreOne, elScoreTwo, elCurrentOne, elCurrentTwo].forEach((el) => (el.textContent = '0'));

    dice.classList.add('hide');
    elPlayerOne.classList.add('active');
    elPlayerTwo.classList.remove('active');

    document.querySelectorAll('.winner').forEach((el) => el.classList.remove('winner'));
  }

  /**
   * Обрабатывает клик по кнопке "Бросить кость".
   * Генерирует случайное число, обновляет отображение кости и счет игрока.
   */
  handleRollDiceClick() {
    if (!this.state.playing) return;

    const dice = this.utils.getRandomNumber(1, 6);
    this.updateDiceDisplay(dice);

    dice !== 1 ? this.updateCurrentScore(dice) : this.switchPlayer();
  }

  /**
   * Обновляет отображение кости.
   * @param {number} dice - Значение броска кости.
   */
  updateDiceDisplay(dice) {
    this.state.elements.dice.classList.remove('hidden');
    this.state.elements.dice.src = `dice-${dice}.png`;
  }

  /**
   * Обновляет текущий счет игрока.
   * @param {number} dice - Значение броска кости.
   */
  updateCurrentScore(dice) {
    this.state.currentScore += dice;
    this.state.elements[`current${this.state.activePlayer === 0 ? 'One' : 'Two'}`].textContent =
      this.state.currentScore;
  }

  /**
   * Переключает активного игрока.
   * Сбрасывает текущий счет и обновляет UI.
   */
  switchPlayer() {
    if (this.state.currentScore === null) return;

    this.state.elements[`current${this.state.activePlayer === 0 ? 'One' : 'Two'}`].textContent = 0;
    this.state.currentScore = 0;
    this.state.activePlayer = 1 - this.state.activePlayer;
    this.state.elements.playerOne.classList.toggle('active');
    this.state.elements.playerTwo.classList.toggle('active');
  }

  /**
   * Обрабатывает клик по кнопке "Оставить".
   * Добавляет текущий счет к общему счету игрока и проверяет условие победы.
   */
  handleHoldClick() {
    if (!this.state.playing || !this.isValidGameState()) return;
    this.state.scores[this.state.activePlayer] += this.state.currentScore;
    this.state.elements[`score${this.state.activePlayer === 0 ? 'One' : 'Two'}`].textContent = this.state.scores[this.state.activePlayer];
    this.state.scores[this.state.activePlayer] >= this.state.endScore ? this.endGame() : this.switchPlayer();
  }

  /**
   * Проверяет валидность состояния игры.
   * @returns {boolean} True, если состояние игры валидно.
   */
  isValidGameState() {
    return this.state.currentScore !== null && this.state.scores !== null && this.state.activePlayer !== null;
  }

  /**
   * Завершает игру.
   * Обновляет UI для отображения победителя.
   */
  endGame() {
    this.state.playing = false;
    this.state.elements.dice.classList.add('hidden');
    const currentActivePlayer = this.state.elements[`player${this.state.activePlayer === 0 ? 'One' : 'Two'}`];
    currentActivePlayer.classList.add('winner');
    currentActivePlayer.classList.remove('active');
  }
}

new PigGame();
