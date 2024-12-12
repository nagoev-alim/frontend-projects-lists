/**
 * Этот файл содержит реализацию игры "Камень, ножницы, бумага".
 * Он создает интерфейс игры, обрабатывает выбор пользователя,
 * генерирует выбор компьютера и определяет победителя.
 * Игра продолжается до тех пор, пока один из игроков не наберет
 * максимальное количество очков.
 */

import './style.css';
import confetti from 'canvas-confetti';
import { icons } from 'feather-icons';

/**
 * Интерфейс для конфигурации игры
 */
interface GameConfig {
  /** Селектор корневого элемента игры */
  root: string;
  /** Объект с селекторами элементов игры */
  selectors: {
    [key: string]: string;
  };
  /** Объект с сообщениями игры */
  gameMessages: {
    [key: string]: string;
  };
  /** Объект с иконками для выборов */
  icons: {
    [key: string]: string;
  };
}

/**
 * Интерфейс для состояния игры
 */
interface GameState {
  /** Максимальное количество попыток */
  maxAttempts: number;
  /** Текущие очки игроков */
  scores: {
    user: number;
    computer: number;
  };
  /** Ссылки на элементы DOM */
  elements: {
    score: NodeListOf<Element> | null;
    message: HTMLElement | null;
    replay: HTMLElement | null;
    description: HTMLElement | null;
    options: HTMLElement | null;
  };
}

/**
 * Интерфейс для вспомогательных функций
 */
interface GameUtils {
  /** Функция для рендеринга data-атрибутов */
  renderDataAttributes: (element: string) => string;
  /** Функция для получения случайного числа */
  getRandomNumber: (min: number, max: number) => number;
}

/**
 * Класс, реализующий игру "Камень, ножницы, бумага"
 */
class RockPaperScissorsGame {
  /** Конфигурация игры */
  private config: GameConfig;
  /** Состояние игры */
  private state: GameState;
  /** Вспомогательные функции */
  private utils: GameUtils;

  /**
   * Конструктор класса
   */
  constructor() {
    this.config = {
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

    this.state = {
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

    this.utils = {
      renderDataAttributes: (element: string): string => element.slice(1, -1),
      getRandomNumber: (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min,
    };

    this.init();
  }

  /**
   * Создает HTML-разметку для игры
   */
  private createAppHTML(): void {
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
   * Инициализирует DOM-элементы
   */
  private initDOMElements(): void {
    this.state.elements = {
      score: document.querySelectorAll(this.config.selectors.score),
      message: document.querySelector(this.config.selectors.message),
      replay: document.querySelector(this.config.selectors.replay),
      description: document.querySelector(this.config.selectors.description),
      options: document.querySelector(this.config.selectors.options),
    };
  }

  /**
   * Инициализирует игру
   */
  private init(): void {
    this.createAppHTML();
    this.initDOMElements();
    this.state.elements.options?.addEventListener('click', (event: MouseEvent) => {
      const choice = (event.target as HTMLElement).closest(this.config.selectors.choice);
      if (choice) {
        this.handleChoiceClick({ target: choice as HTMLElement });
      }
    });
    this.state.elements.replay?.addEventListener('click', () => location.reload());
  }

  /**
   * Показывает конфетти при победе
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
   * Обрабатывает клик по выбору игрока
   * @param target - Элемент, по которому кликнули
   */
  private handleChoiceClick({ target: choice }: { target: HTMLElement }): void {
    const choices: string[] = ['rock', 'paper', 'scissors'];
    const userChoice: string = choice.dataset.choice || '';
    const computerChoice: string = choices[Math.floor(Math.random() * choices.length)];
    const result: string = this.getResult(userChoice, computerChoice);
    this.showResult(userChoice, computerChoice, result);
  }

  /**
   * Определяет результат раунда
   * @param user - Выбор пользователя
   * @param computer - Выбор компьютера
   * @returns Результат раунда
   */
  private getResult(user: string, computer: string): string {
    if (user === computer) return 'draw';
    const winConditions: { [key: string]: string } = {
      rock: 'scissors',
      paper: 'rock',
      scissors: 'paper',
    };
    return winConditions[user] === computer ? 'win' : 'lose';
  }

  /**
   * Показывает результат раунда
   * @param userChoice - Выбор пользователя
   * @param computerChoice - Выбор компьютера
   * @param result - Результат раунда
   */
  private showResult(userChoice: string, computerChoice: string, result: string): void {
    const { score: scoreElements } = this.state.elements;
    const [userScoreElement, computerScoreElement] = scoreElements as NodeListOf<HTMLElement>;
    const scoreUpdate: { user: number; computer: number } = {
      win: { user: 1, computer: 0 },
      lose: { user: 0, computer: 1 },
      draw: { user: 1, computer: 1 },
    }[result] || { user: 0, computer: 0 };

    this.state.scores.user += scoreUpdate.user;
    this.state.scores.computer += scoreUpdate.computer;

    userScoreElement.textContent = this.state.scores.user.toString();
    computerScoreElement.textContent = this.state.scores.computer.toString();

    this.showMessage(userChoice, computerChoice, result);
    this.checkGameEnd();
  }

  /**
   * Проверяет, закончилась ли игра
   */
  private checkGameEnd(): void {
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
   * Завершает игру
   * @param result - Результат игры
   * @param color - Цвет текста результата
   */
  private finishGame(result: string, color: string): void {
    if (this.state.elements.message) {
      this.state.elements.message.classList.add('text-2xl', color);
      this.state.elements.message.textContent = this.config.gameMessages[result];
    }
    this.state.elements.options?.classList.add('hidden');
    this.state.elements.description?.classList.add('hidden');
    this.state.elements.replay?.classList.remove('hidden');
  }

  /**
   * Показывает сообщение о результате раунда
   * @param userChoice - Выбор пользователя
   * @param computerChoice - Выбор компьютера
   * @param result - Результат раунда
   */
  private showMessage(userChoice: string, computerChoice: string, result: string): void {
    const choices: { [key: string]: string } = { rock: 'Rock', paper: 'Paper', scissors: 'Scissors' };
    const resultText: { [key: string]: string } = { win: 'beats', lose: 'loses to', draw: 'equals' };
    if (this.state.elements.message) {
      this.state.elements.message.innerHTML = `
        ${choices[userChoice]} <span class='text-sm'>(user)</span>
        ${resultText[result]}
        ${choices[computerChoice]} <span class='text-sm'>(comp)</span>.
      `;
    }
  }
}

new RockPaperScissorsGame();