import './style.css';

/**
 * @file Игра "Память" с двумя вариантами: простой и с таймером
 * @description Этот файл содержит логику для двух вариантов игры "Память":
 * 1) Простая версия без ограничения по времени
 * 2) Версия с таймером и подсчетом ходов
 * Игра использует DOM манипуляции для создания и управления игровым полем.
 */

/**
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента приложения
 * @property {Object} selectors - Объект с селекторами элементов игры
 */

/**
 * @type {AppConfig}
 */
const APP_CONFIG = {
  root: '#app',
  selectors: {
    GAME_ONE: {
      cards: '.container-0 li',
    },
    GAME_TWO: {
      cards: '.container-1 li',
      time: '[data-time]',
      flips: '[data-flips]',
      game: '[data-refresh-game]',
    },
  },
};

/**
 * @typedef {Object} AppState
 * @property {Object} elements - DOM элементы игры
 * @property {Object} gameOneOptions - Настройки для первой игры
 * @property {Object} gameTwoOptions - Настройки для второй игры
 */

/**
 * @type {AppState}
 */
const APP_STATE = {
  elements: {
    GAME_ONE: {
      cards: null,
    },
    GAME_TWO: {
      cards: null,
      time: null,
      flips: null,
      game: null,
    },
  },
  gameOneOptions: {
    disableDeck: false,
    matched: 0,
    cardOne: null,
    cardTwo: null,
  },
  gameTwoOptions: {
    maxTime: 20,
    timeLeft: 20,
    flips: 0,
    matchedCard: 0,
    disableDeck: false,
    isPlaying: false,
    timer: null,
    cardOne: null,
    cardTwo: null,
  },
};

const APP_UTILS = {
  /**
   * Обрабатывает строку для использования в качестве data-атрибута
   * @param {string} element - Строка для обработки
   * @returns {string} Обработанная строка
   */
  renderDataAttributes: (element) => element.slice(1, -1),
};

/**
 * Создает HTML структуру приложения
 */
function createAppHTML() {
  const {
    root,
    selectors: { GAME_TWO },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector(root);
  const GAME_ONE_CONTAINER = document.createElement('div');
  const GAME_TWO_CONTAINER = document.createElement('div');

  [GAME_ONE_CONTAINER, GAME_TWO_CONTAINER].forEach((container, index) => {
    container.className = `bg-white border gap-4 grid max-w-lg mx-auto p-3 rounded shadow w-full container-${index}`;
  });

  GAME_ONE_CONTAINER.innerHTML = `
    <h1 class='font-bold md:text-4xl text-2xl text-center'>Memory Card Game</h1>
    <ul class='grid-cols-4 grid'>
      ${Array.from({ length: 16 })
    .map(
      (_, idx) => `
      <li>
        <div class='front view'>
          <img alt='icon' src='picture.png'>
        </div>
        <div class='back view'>
          <img alt='card-img' src='img-${(idx % 8) + 1}.png'>
        </div>
      </li>
      `,
    )
    .join('')}
    </ul>`;

  GAME_TWO_CONTAINER.innerHTML = `
    <h1 class='font-bold md:text-4xl text-2xl text-center'>Memory Card Game</h1>
    <ul>
      ${Array.from({ length: 12 })
    .map(
      (_, idx) => `
      <li>
        <div class='front view'>
          <img alt='icon' src='picture.png'>
        </div>
        <div class='back view'>
          <img alt='card-img' src='img-${(idx % 6) + 1}.png'>
        </div>
      </li>
      `,
    )
    .join('')}
    </ul>
    <div class='grid sm:grid-cols-3 sm:items-center'>
      <p class='font-medium time'>Time: <span class='font-bold' ${renderDataAttributes(GAME_TWO.time)}>0s</span></p>
      <p class='flips font-medium'>Flips: <span class='font-bold' ${renderDataAttributes(GAME_TWO.flips)}>3</span></p>
      <button class='border hover:bg-slate-50 px-3 py-2' ${renderDataAttributes(GAME_TWO.game)}>Refresh</button>
    </div>`;

  if (!rootElement) return;

  [GAME_ONE_CONTAINER, GAME_TWO_CONTAINER].forEach((container) =>
    rootElement.append(container),
  );
}

/**
 * Инициализирует DOM элементы и сохраняет их в APP_STATE
 */
function initDOMElements() {
  APP_STATE.elements = {
    GAME_ONE: {
      cards: document.querySelectorAll(APP_CONFIG.selectors.GAME_ONE.cards),
    },
    GAME_TWO: {
      cards: document.querySelectorAll(APP_CONFIG.selectors.GAME_TWO.cards),
      time: document.querySelector(APP_CONFIG.selectors.GAME_TWO.time),
      flips: document.querySelector(APP_CONFIG.selectors.GAME_TWO.flips),
      game: document.querySelector(APP_CONFIG.selectors.GAME_TWO.game),
    },
  };
}

/**
 * Инициализирует приложение
 */
function initApp() {
  createAppHTML();
  initDOMElements();
  initGameOne();
  initGameTwo();
}

/**
 * Инициализирует первую игру
 */
function initGameOne() {
  /**
   * Перемешивает карты и сбрасывает состояние игры
   */
  function shuffleCards() {
    APP_STATE.gameOneOptions = {
      ...APP_STATE.gameOneOptions,
      matched: 0,
      disableDeck: false,
      cardOne: null,
      cardTwo: null,
    };

    const array = Array.from({ length: 16 }, (_, i) => (i % 8) + 1)
      .sort(() => Math.random() - 0.5);

    APP_STATE.elements.GAME_ONE.cards.forEach((card, i) => {
      card.classList.remove('flip');
      card.querySelector('.back img').src = `img-${array[i]}.png`;
      card.addEventListener('click', handleCardClick);
    });
  }

  /**
   * Проверяет, совпадают ли две карты
   * @param {string} src - URL изображения первой карты
   * @param {string} src2 - URL изображения второй карты
   */
  function isCardMatch(src, src2) {
    const { cardOne, cardTwo } = APP_STATE.gameOneOptions;

    if (src === src2) {
      APP_STATE.gameOneOptions.matched++;
      if (APP_STATE.gameOneOptions.matched === 8) {
        setTimeout(shuffleCards, 1000);
      }
      [cardOne, cardTwo].forEach(card => card.removeEventListener('click', handleCardClick));
      APP_STATE.gameOneOptions = {
        ...APP_STATE.gameOneOptions,
        disableDeck: false,
        cardOne: null,
        cardTwo: null,
      };
    } else {
      const toggleCardState = (action) => {
        [cardOne, cardTwo].forEach(card => {
          if (action === 'shake') {
            card.classList.add('shake');
          } else {
            card.classList.remove('shake', 'flip');
          }
        });
      };

      setTimeout(() => toggleCardState('shake'), 400);
      setTimeout(() => {
        toggleCardState('unflip');
        APP_STATE.gameOneOptions = {
          ...APP_STATE.gameOneOptions,
          disableDeck: false,
          cardOne: null,
          cardTwo: null,
        };
      }, 1200);
    }
  }

  /**
   * Обрабатывает клик по карте
   * @param {Event} event - Событие клика
   */
  function handleCardClick({ target }) {
    const { cardOne, disableDeck } = APP_STATE.gameOneOptions;

    if (cardOne === target || disableDeck) return;

    target.classList.add('flip');
    if (!cardOne) {
      APP_STATE.gameOneOptions.cardOne = target;
      return;
    }

    APP_STATE.gameOneOptions = {
      ...APP_STATE.gameOneOptions,
      disableDeck: true,
      cardTwo: target,
    };

    const [src1, src2] = [cardOne, target].map(card => card.querySelector('.back img').src);
    isCardMatch(src1, src2);
  }

  shuffleCards();
  APP_STATE.elements.GAME_ONE.cards.forEach((card) =>
    card.addEventListener('click', handleCardClick),
  );
}

/**
 * Инициализирует вторую игру
 */
function initGameTwo() {
  /**
   * Перемешивает карты и сбрасывает состояние игры
   */
  function shuffleCards() {
    APP_STATE.gameTwoOptions = {
      ...APP_STATE.gameTwoOptions,
      timeLeft: APP_STATE.gameTwoOptions.maxTime,
      flips: 0,
      matchedCard: 0,
      cardOne: null,
      cardTwo: null,
      disableDeck: false,
      isPlaying: false,
    };

    clearInterval(APP_STATE.gameTwoOptions.timer);
    APP_STATE.elements.GAME_TWO.time.textContent = APP_STATE.gameTwoOptions.timeLeft.toString();
    APP_STATE.elements.GAME_TWO.flips.textContent = '0';

    const array = Array.from({ length: 16 }, (_, i) => (i % 8) + 1)
      .sort(() => Math.random() - 0.5);

    APP_STATE.elements.GAME_TWO.cards.forEach((card, i) => {
      card.classList.remove('flip');
      card.querySelector('.back img').src = `img-${array[i]}.png`;
      card.addEventListener('click', handleCardClick);
    });
  }

  /**
   * Обновляет таймер игры
   */
  function initialTimer() {
    if (APP_STATE.gameTwoOptions.timeLeft <= 0) {
      clearInterval(APP_STATE.gameTwoOptions.timer);
      return;
    }
    APP_STATE.gameTwoOptions.timeLeft--;
    APP_STATE.elements.GAME_TWO.time.textContent = APP_STATE.gameTwoOptions.timeLeft.toString();
  }

  /**
   * Проверяет, совпадают ли две карты
   * @param {string} src - URL изображения первой карты
   * @param {string} src2 - URL изображения второй карты
   */
  function isCardMatch(src, src2) {
    if (src === src2) {
      APP_STATE.gameTwoOptions.matchedCard++;
      if (APP_STATE.gameTwoOptions.matchedCard === 6 && APP_STATE.gameTwoOptions.timeLeft > 0) {
        clearInterval(APP_STATE.gameTwoOptions.timer);
        return;
      }
      APP_STATE.gameTwoOptions.cardOne.removeEventListener('click', handleCardClick);
      APP_STATE.gameTwoOptions.cardTwo.removeEventListener('click', handleCardClick);
      APP_STATE.gameTwoOptions = {
        ...APP_STATE.gameTwoOptions,
        cardOne: null,
        cardTwo: null,
        disableDeck: false,
      };
    } else {
      const shakeCards = () => {
        [APP_STATE.gameTwoOptions.cardOne, APP_STATE.gameTwoOptions.cardTwo].forEach((card) =>
          card.classList.add('shake'),
        );
      };

      const unflipCards = () => {
        [APP_STATE.gameTwoOptions.cardOne, APP_STATE.gameTwoOptions.cardTwo].forEach((card) =>
          card.classList.remove('shake', 'flip'),
        );
        APP_STATE.gameTwoOptions = {
          ...APP_STATE.gameTwoOptions,
          disableDeck: false,
          cardOne: null,
          cardTwo: null,
        };
      };

      setTimeout(shakeCards, 400);
      setTimeout(unflipCards, 1200);
    }
  }

  /**
   * Обрабатывает клик по карте во второй игре
   * @param {Event} event - Событие клика
   */
  function handleCardClick(event) {
    const { target } = event;

    const { cardOne, disableDeck, timeLeft, isPlaying } = APP_STATE.gameTwoOptions;

    // Начинаем игру и таймер при первом клике
    if (!isPlaying) {
      APP_STATE.gameTwoOptions.isPlaying = true;
      APP_STATE.gameTwoOptions.timer = setInterval(initialTimer, 1000);
    }

    // Проверяем условия, при которых клик не должен обрабатываться
    if (target === cardOne || disableDeck || timeLeft <= 0) return;

    // Увеличиваем счетчик ходов и обновляем отображение
    APP_STATE.gameTwoOptions.flips++;
    APP_STATE.elements.GAME_TWO.flips.textContent = String(APP_STATE.gameTwoOptions.flips);
    target.classList.add('flip');

    // Если это первая карта в паре
    if (!cardOne) {
      APP_STATE.gameTwoOptions.cardOne = target;
      return;
    }

    // Если это вторая карта в паре
    APP_STATE.gameTwoOptions.cardTwo = target;
    APP_STATE.gameTwoOptions.disableDeck = true;
    isCardMatch(cardOne.querySelector('.back img').src, target.querySelector('.back img').src);
  }

// Инициализация игры
  shuffleCards();
  APP_STATE.elements.GAME_TWO.game.addEventListener('click', shuffleCards);
  APP_STATE.elements.GAME_TWO.cards.forEach((card) => card.addEventListener('click', handleCardClick));
}

initApp();
