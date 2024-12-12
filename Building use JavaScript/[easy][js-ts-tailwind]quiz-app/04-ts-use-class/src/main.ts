/**
 * Этот код реализует интерактивную викторину (квиз) с использованием TypeScript.
 * Викторина загружает вопросы из внешнего API, отображает их пользователю,
 * обрабатывает ответы и показывает итоговый результат. Код также включает
 * визуальные эффекты, такие как конфетти при завершении квиза.
 */

import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import confetti from 'canvas-confetti';
import axios from 'axios';

/**
 * Интерфейс для конфигурации квиза
 */
interface QuizConfig {
  /** Корневой элемент для рендеринга квиза */
  root: string;
  /** Селекторы для различных элементов DOM */
  selectors: {
    [key: string]: string;
  };
  /** URL для получения вопросов квиза */
  url: string;
}

/**
 * Интерфейс для состояния квиза
 */
interface QuizState {
  /** Элементы DOM, используемые в квизе */
  elements: {
    loadingSpinner: HTMLElement | null;
    quizContainer: HTMLElement | null;
    quizContent: HTMLElement | null;
    questionCounter: HTMLElement | null;
    questionText: HTMLElement | null;
    answerOptions: HTMLElement[] | null;
    submitAnswer: HTMLElement | null;
    quizResults: HTMLElement | null;
    quizResultsButton: HTMLElement | null;
  };
  /** Данные вопросов квиза */
  quizData: QuizQuestion[];
  /** Индекс текущего вопроса */
  currentQuestionIndex: number;
  /** Текущий счет пользователя */
  score: number;
  /** Правильный ответ на текущий вопрос */
  correctAnswer: string | null;
}

/**
 * Интерфейс для вспомогательных функций квиза
 */
interface QuizUtils {
  /** Функция для получения случайного числа в заданном диапазоне */
  getRandomNumber: (min: number, max: number) => number;
  /** Функция для рендеринга data-атрибутов */
  renderDataAttributes: (element: string) => string;
  /** Конфигурация для всплывающих уведомлений */
  toastConfig: {
    className: string;
    duration: number;
    gravity: string;
    position: string;
  };
  /** Функция для отображения всплывающего уведомления */
  showToast: (message: string) => void;
  /** Функция для обработки ошибок */
  handleError: (message: string, error?: any) => void;
  /** Функция для перемешивания массива */
  shuffleArray: <T>(array: T[]) => T[];
}

/**
 * Интерфейс для вопроса квиза
 */
interface QuizQuestion {
  /** Текст вопроса */
  question: string;
  /** Правильный ответ */
  correct_answer: string;
  /** Массив неправильных ответов */
  incorrect_answers: string[];
}

/**
 * Класс, реализующий функциональность квиза
 */
class Quiz {
  /** Конфигурация квиза */
  private readonly config: QuizConfig;
  /** Состояние квиза */
  private state: QuizState;
  /** Вспомогательные функции */
  private readonly utils: QuizUtils;

  /**
   * Конструктор класса Quiz
   */
  constructor() {
    this.config = {
      root: '#app',
      selectors: {
        loadingSpinner: '[data-loading-spinner]',
        quizContainer: '[data-quiz-container]',
        quizContent: '[data-quiz-content]',
        questionCounter: '[data-question-counter]',
        questionText: '[data-question-text]',
        answerOption: '[data-answer-option]',
        submitAnswer: '[data-submit-answer]',
        quizResults: '[data-quiz-results]',
      },
      url: 'https://opentdb.com/api.php?amount=10&category=18&difficulty=easy&type=multiple&encode=url3986',
    };

    this.state = {
      elements: {
        loadingSpinner: null,
        quizContainer: null,
        quizContent: null,
        questionCounter: null,
        questionText: null,
        answerOptions: [],
        submitAnswer: null,
        quizResults: null,
        quizResultsButton: null,
      },
      quizData: [],
      currentQuestionIndex: 0,
      score: 0,
      correctAnswer: null,
    };

    this.utils = {
      getRandomNumber: (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min,
      renderDataAttributes: (element: string): string => element.slice(1, -1),
      toastConfig: {
        className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
        duration: 3000,
        gravity: 'bottom',
        position: 'center',
      },
      showToast: (message: string): void => {
        // @ts-ignore
        Toastify({
          text: message,
          ...this.utils.toastConfig,
        }).showToast();
      },
      handleError: (message: string, error: any = null): void => {
        this.utils.showToast(message);
        if (error) console.error(message, error);
      },
      shuffleArray: <T>(array: T[]): T[] => {
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
      },
    };

    this.init();
  }

  /**
   * Создает HTML-разметку для приложения
   */
  private createAppHTML(): void {
    const {
      root,
      selectors: {
        loadingSpinner,
        quizContainer,
        quizContent,
        questionCounter,
        questionText,
        answerOption,
        submitAnswer,
        quizResults,
      },
    } = this.config;
    const { renderDataAttributes } = this.utils;
    const rootElement = document.querySelector(root);

    if (!rootElement) return;

    rootElement.innerHTML = `
      <div class='grid w-full max-w-md gap-4 rounded border bg-white p-3 shadow'>
        <div ${renderDataAttributes(loadingSpinner)} role='status'>
          <div class='flex justify-center'>
            <svg aria-hidden='true' class='mr-2 h-8 w-8 animate-spin fill-gray-600 text-gray-200 dark:fill-gray-300 dark:text-gray-600' fill='none' viewBox='0 0 100 101' xmlns='http://www.w3.org/2000/svg'>
              <path d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z' fill='currentColor'/>
              <path d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z' fill='currentFill'/>
            </svg>
            <span class='sr-only'>Loading...</span>
          </div>
        </div>
        <div class='quiz hidden grid gap-3' ${renderDataAttributes(quizContainer)}>
          <div class='grid gap-2 place-items-center text-center' ${renderDataAttributes(quizContent)}>
            <h1 class='text-2xl font-bold'>Quiz</h1>
            <p class='font-medium' ${renderDataAttributes(questionCounter)}>Question 1/10</p>
            <p ${renderDataAttributes(questionText)}>Question</p>
            <ul class='grid w-full gap-3 text-left'>
              ${Array.from({ length: 4 })
      .map(
        () => `
                    <li>
                      <label class='flex cursor-pointer items-center gap-3'>
                        <input class='visually-hidden' type='radio' name='answer' ${renderDataAttributes(answerOption)}>
                        <span class='radio'></span>
                        <span class='label'>Answer</span>
                      </label>
                    </li>
                  `,
      )
      .join('')}
            </ul>
          </div>
          <button class='border px-3 py-2 hover:bg-slate-50' ${renderDataAttributes(submitAnswer)}>Submit</button>
      
          <div class='hidden gap-3 place-items-center' ${renderDataAttributes(quizResults)}>
            <h1 class='text-2xl font-bold'>Finish</h1>
            <p>You answered <span class='font-bold'>0/10</span> questions correctly</p>
            <button class='w-full border px-3 py-2 hover:bg-slate-50'>Reload</button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Инициализирует DOM-элементы
   */
  private initDOMElements(): void {
    this.state.elements = {
      loadingSpinner: document.querySelector(this.config.selectors.loadingSpinner),
      quizContainer: document.querySelector(this.config.selectors.quizContainer),
      quizContent: document.querySelector(this.config.selectors.quizContent),
      questionCounter: document.querySelector(this.config.selectors.questionCounter),
      questionText: document.querySelector(this.config.selectors.questionText),
      answerOptions: Array.from(document.querySelectorAll(this.config.selectors.answerOption)),
      submitAnswer: document.querySelector(this.config.selectors.submitAnswer),
      quizResults: document.querySelector(this.config.selectors.quizResults),
      quizResultsButton: document.querySelector(`${this.config.selectors.quizResults} button`),
    };
  }

  /**
   * Инициализирует квиз
   */
  private async init(): Promise<void> {
    this.createAppHTML();
    this.initDOMElements();

    await this.fetchQuizQuestions();
    (this.state.elements.submitAnswer as HTMLElement).addEventListener('click', this.handleSubmitAnswerClick.bind(this));
    (this.state.elements.quizResultsButton as HTMLElement).addEventListener('click', this.handleQuizResultsButtonClick.bind(this));
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
   * Получает данные квиза с сервера
   */
  private async getQuizData(): Promise<QuizQuestion[]> {
    const {
      data: { results },
    } = await axios.get<{ results: QuizQuestion[] }>(this.config.url);
    return results;
  }

  /**
   * Устанавливает состояние загрузки
   * @param isLoading - флаг загрузки
   */
  private setLoadingState(isLoading: boolean): void {
    (this.state.elements.quizContainer as HTMLElement).classList.toggle('pointer-events-none', isLoading);
    (this.state.elements.quizContainer as HTMLElement).classList.toggle('hidden', isLoading);
    (this.state.elements.loadingSpinner as HTMLElement).classList.toggle('hidden', !isLoading);
  }

  /**
   * Загружает вопросы квиза
   */
  private async fetchQuizQuestions(): Promise<void> {
    try {
      this.setLoadingState(true);
      this.state.quizData = await this.getQuizData();
      this.renderQuestions(this.state.quizData);
    } catch (error) {
      this.utils.handleError('Failed to load quiz questions', error);
    } finally {
      this.setLoadingState(false);
    }
  }

  /**
   * Обновляет информацию о текущем вопросе
   * @param totalQuestions - общее количество вопросов
   * @param questionText - текст вопроса
   */
  private updateQuestionInfo(totalQuestions: number, questionText: string): void {
    (this.state.elements.questionCounter as HTMLElement).innerHTML = `Question: ${this.state.currentQuestionIndex + 1}/${totalQuestions}`;
    (this.state.elements.questionText as HTMLElement).textContent = decodeURIComponent(questionText);
  }

  /**
   * Подготавливает массив ответов для текущего вопроса.
   * @param {QuizQuestion} question - Объект с данными текущего вопроса.
   * @returns {string[]} Массив перемешанных ответов.
   */
  private prepareAnswers(question: QuizQuestion): string[] {
    const allAnswers = [...question.incorrect_answers, question.correct_answer];
    this.state.correctAnswer = decodeURIComponent(question.correct_answer);
    console.log(`👉️ Correct answer: ${this.state.correctAnswer}`);
    return this.utils.shuffleArray(allAnswers);
  }

  /**
   * Обновляет варианты ответов в DOM.
   * @param {string[]} answers - Массив вариантов ответов.
   */
  private updateAnswerOptions(answers: string[]): void {
    (this.state.elements.answerOptions as HTMLInputElement[]).forEach((option, index) => {
      option.checked = false;
      if (index < answers.length) {
        const decodedAnswer = decodeURIComponent(answers[index]);
        option.value = decodedAnswer;
        (option.nextElementSibling?.nextElementSibling as HTMLElement).textContent = decodedAnswer;
      }
    });
  }

  /**
   * Отображает текущий вопрос и варианты ответов.
   * @param {QuizQuestion[]} items - Массив вопросов квиза.
   */
  private renderQuestions(items: QuizQuestion[]): void {
    const currentQuestion = items[this.state.currentQuestionIndex];
    this.updateQuestionInfo(items.length, currentQuestion.question);
    const answers = this.prepareAnswers(currentQuestion);
    this.updateAnswerOptions(answers);
  }

  /**
   * Обрабатывает нажатие на кнопку отправки ответа.
   */
  private handleSubmitAnswerClick(): void {
    let checkedAnswer = this.getCheckedAnswer();
    if (!checkedAnswer) {
      this.utils.showToast('Please select an answer');
      return;
    }
    if (checkedAnswer === this.state.correctAnswer) {
      this.state.score++;
    }
    this.state.currentQuestionIndex++;
    if (this.state.currentQuestionIndex < this.state.quizData.length) {
      this.renderQuestions(this.state.quizData);
    } else {
      this.showQuizResults();
    }
  }

  /**
   * Получает выбранный пользователем ответ.
   * @returns {string | null} Текст выбранного ответа или null, если ответ не выбран.
   */
  private getCheckedAnswer(): string | null {
    return (
      (this.state.elements.answerOptions as HTMLInputElement[]).find((option) => option.checked)
        ?.nextElementSibling?.nextElementSibling?.textContent || null
    );
  }

  /**
   * Отображает результаты квиза.
   */
  private showQuizResults(): void {
    this.showConfetti();
    (this.state.elements.quizContent as HTMLElement).classList.add('hidden');
    (this.state.elements.submitAnswer as HTMLElement).classList.add('hidden');
    (this.state.elements.quizResults as HTMLElement).classList.remove('hidden');
    (this.state.elements.quizResults as HTMLElement).classList.add('grid');
    const resultParagraph = (this.state.elements.quizResults as HTMLElement).querySelector('p');
    if (resultParagraph) {
      resultParagraph.innerHTML =
        `You answered correctly to <span class='font-bold'>${this.state.score}/${this.state.quizData.length}</span> questions!`;
    }
  }

  /**
   * Обрабатывает нажатие на кнопку перезагрузки квиза.
   */
  private handleQuizResultsButtonClick(): void {
    location.reload();
  }
}

new Quiz();
