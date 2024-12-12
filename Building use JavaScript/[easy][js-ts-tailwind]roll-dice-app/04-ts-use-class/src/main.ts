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

class PigGame {
  private readonly config: AppConfig;
  private readonly state: AppState;
  private readonly utils: AppUtils;

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
  private createAppHTML():void {
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
  private initDOMElements():void {
    Object.keys(this.config.selectors).forEach(key => {
      const selector = this.config.selectors[key as keyof typeof this.config.selectors];
      const element = document.querySelector(selector);
      if (element) {
        (this.state.elements as any)[key] = element;
      }
    });
    this.state.elements.info = document.querySelectorAll(this.config.selectors.info);
  }

  /**
   * Инициализирует приложение.
   * Создает HTML, инициализирует DOM элементы и добавляет обработчики событий.
   */
  private init():void {
    this.createAppHTML();
    this.initDOMElements();

    this.initGame();
    this.state.elements.newGame.addEventListener('click', this.initGame.bind(this));
    this.state.elements.rollDice.addEventListener('click', this.handleRollDiceClick.bind(this));
    this.state.elements.hold.addEventListener('click', this.handleHoldClick.bind(this));
    this.state.elements.info!.forEach((info) => info.addEventListener('click', () => this.state.elements.overlay.classList.toggle('visible')));
  }


  /**
   * Инициализирует новую игру, сбрасывая все значения состояния и обновляя отображение.
   */
  private initGame(): void {
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
   * Обрабатывает событие броска кубика.
   * Если игра активна, генерирует случайное число, обновляет отображение кубика
   * и либо обновляет текущий счет, либо переключает игрока.
   */
  private handleRollDiceClick(): void {
    if (!this.state.playing) return;

    const diceValue = this.utils.getRandomNumber(1, 6);
    this.updateDiceDisplay(diceValue);

    diceValue !== 1 ? this.updateCurrentScore(diceValue) : this.switchPlayer();
  }

  /**
   * Обновляет отображение кубика на основе выпавшего значения.
   * @param {number} diceValue - Значение, выпавшее на кубике
   */
  private updateDiceDisplay(diceValue: number): void {
    this.state.elements.dice.classList.remove('hidden');
    this.state.elements.dice.src = `dice-${diceValue}.png`;
  }

  /**
   * Обновляет текущий счет активного игрока.
   * @param {number} diceValue - Значение, выпавшее на кубике
   */
  private updateCurrentScore(diceValue: number): void {
    this.state.currentScore += diceValue;
    const currentPlayerElement = this.state.elements[`current${this.state.activePlayer === 0 ? 'One' : 'Two'}`];
    currentPlayerElement.textContent = this.state.currentScore.toString();
  }

  /**
   * Переключает активного игрока, обнуляя текущий счет.
   */
  private switchPlayer(): void {
    this.state.elements[`current${this.state.activePlayer === 0 ? 'One' : 'Two'}`].textContent = '0';
    this.state.currentScore = 0;
    this.state.activePlayer = this.state.activePlayer === 0 ? 1 : 0;
    this.state.elements.playerOne.classList.toggle('active');
    this.state.elements.playerTwo.classList.toggle('active');
  }

  /**
   * Обрабатывает событие удержания текущего счета.
   * Если игра активна и состояние валидно, добавляет текущий счет к общему счету игрока
   * и либо завершает игру, либо переключает игрока.
   */
  private handleHoldClick(): void {
    if (!this.state.playing || !this.isValidGameState()) return;

    this.state.scores[this.state.activePlayer] += this.state.currentScore;
    const scoreElement = this.state.elements[`score${this.state.activePlayer === 0 ? 'One' : 'Two'}`];
    scoreElement.textContent = this.state.scores[this.state.activePlayer].toString();

    this.state.scores[this.state.activePlayer] >= this.state.endScore ? this.endGame() : this.switchPlayer();
  }

  /**
   * Проверяет валидность текущего состояния игры.
   * @returns {boolean} true, если состояние игры валидно, иначе false
   */
  private isValidGameState(): boolean {
    return this.state.currentScore !== null &&
      Array.isArray(this.state.scores) &&
      (this.state.activePlayer === 0 || this.state.activePlayer === 1);
  }

  /**
   * Завершает игру, обновляя состояние и визуальное отображение.
   */
  private endGame(): void {
    this.state.playing = false;
    this.state.elements.dice.classList.add('hidden');
    const currentActivePlayer = this.state.elements[`player${this.state.activePlayer === 0 ? 'One' : 'Two'}`];
    currentActivePlayer.classList.add('winner');
    currentActivePlayer.classList.remove('active');
  }
}

new PigGame();
