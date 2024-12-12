/**
 * Этот модуль реализует интерактивную викторину с использованием API для получения вопросов.
 * Он включает в себя функциональность для отображения вопросов, обработки ответов пользователя,
 * подсчета очков и отображения результатов. Модуль также использует внешние библиотеки для
 * отображения уведомлений и эффекта конфетти при завершении викторины.
 */

import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import confetti from 'canvas-confetti';
import axios from 'axios';

/**
 * Интерфейс для конфигурации приложения
 */
interface AppConfig {
  root: string;
  selectors: {
    [key: string]: string;
  };
  url: string;
}

/**
 * Интерфейс для состояния приложения
 */
interface AppState {
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
  quizData: QuizQuestion[];
  currentQuestionIndex: number;
  score: number;
  correctAnswer: string | null;
}

/**
 * Интерфейс для вопроса викторины
 */
interface QuizQuestion {
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

/**
 * Интерфейс для утилит приложения
 */
interface AppUtils {
  addLeadingZero: (num: number) => string;
  getRandomNumber: (min: number, max: number) => number;
  renderDataAttributes: (element: string) => string;
  toastConfig: {
    className: string;
    duration: number;
    gravity: string;
    position: string;
  };
  showToast: (message: string) => void;
  handleError: (message: string, error?: any) => void;
  shuffleArray: <T>(array: T[]) => T[];
}

/**
 * Конфигурация приложения
 */
const APP_CONFIG: AppConfig = {
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

/**
 * Состояние приложения
 */
const APP_STATE: AppState = {
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

/**
 * Утилиты приложения
 */
const APP_UTILS: AppUtils = {
  /**
   * Добавляет ведущий ноль к числу, если оно меньше 10
   * @param {number} num - Число для форматирования
   * @returns {string} Отформатированное число
   */
  addLeadingZero: (num: number): string => num.toString().padStart(2, '0'),

  /**
   * Генерирует случайное число в заданном диапазоне
   * @param {number} min - Минимальное значение
   * @param {number} max - Максимальное значение
   * @returns {number} Случайное число
   */
  getRandomNumber: (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min,

  /**
   * Форматирует строку для использования в качестве data-атрибута
   * @param {string} element - Строка для форматирования
   * @returns {string} Отформатированная строка
   */
  renderDataAttributes: (element: string): string => element.slice(1, -1),

  /**
   * Конфигурация для уведомлений
   */
  toastConfig: {
    className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
    duration: 3000,
    gravity: 'bottom',
    position: 'center',
  },

  /**
   * Отображает уведомление
   * @param {string} message - Сообщение для отображения
   */
  showToast: (message: string): void => {
    // @ts-ignore
    Toastify({
      text: message,
      ...APP_UTILS.toastConfig,
    }).showToast();
  },

  /**
   * Обрабатывает ошибки и отображает уведомление
   * @param {string} message - Сообщение об ошибке
   * @param {any} [error] - Объект ошибки (необязательно)
   */
  handleError: (message: string, error: any = null): void => {
    APP_UTILS.showToast(message);
    if (error) console.error(message, error);
  },

  /**
   * Перемешивает массив
   * @param {T[]} array - Массив для перемешивания
   * @returns {T[]} Перемешанный массив
   */
  shuffleArray: <T>(array: T[]): T[] => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  },
};

/**
 * Создает HTML-структуру приложения
 */
function createAppHTML(): void {
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
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
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
function initDOMElements(): void {
  APP_STATE.elements = {
    loadingSpinner: document.querySelector(APP_CONFIG.selectors.loadingSpinner),
    quizContainer: document.querySelector(APP_CONFIG.selectors.quizContainer),
    quizContent: document.querySelector(APP_CONFIG.selectors.quizContent),
    questionCounter: document.querySelector(APP_CONFIG.selectors.questionCounter),
    questionText: document.querySelector(APP_CONFIG.selectors.questionText),
    answerOptions: Array.from(document.querySelectorAll(APP_CONFIG.selectors.answerOption)),
    submitAnswer: document.querySelector(APP_CONFIG.selectors.submitAnswer),
    quizResults: document.querySelector(APP_CONFIG.selectors.quizResults),
    quizResultsButton: document.querySelector(`${APP_CONFIG.selectors.quizResults} button`),
  };
}

/**
 * Инициализирует приложение
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();

  (async () => {
    await fetchQuizQuestions();
    APP_STATE.elements.submitAnswer?.addEventListener('click', handleSubmitAnswerClick);
    APP_STATE.elements.quizResultsButton?.addEventListener('click', handleQuizResultsButtonClick);
  })();
}

/**
 * Отображает эффект конфетти
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
 * Получает данные викторины с сервера
 * @returns {Promise<QuizQuestion[]>} Массив вопросов викторины
 */
async function getQuizData(): Promise<QuizQuestion[]> {
  const {
    data: { results },
  } = await axios.get<{ results: QuizQuestion[] }>(APP_CONFIG.url);
  return results;
}

/**
 * Устанавливает состояние загрузки
 * @param {boolean} isLoading - Флаг загрузки
 */
function setLoadingState(isLoading: boolean): void {
  const quizContainer = APP_STATE.elements.quizContainer as HTMLElement;
  const loadingSpinner = APP_STATE.elements.loadingSpinner as HTMLElement;

  quizContainer.classList.toggle('pointer-events-none', isLoading);
  quizContainer.classList.toggle('hidden', isLoading);
  loadingSpinner.classList.toggle('hidden', !isLoading);
}

/**
 * Загружает вопросы викторины
 */
async function fetchQuizQuestions(): Promise<void> {
  try {
    setLoadingState(true);
    APP_STATE.quizData = await getQuizData();
    renderQuestions(APP_STATE.quizData);
  } catch (error) {
    APP_UTILS.handleError('Failed to load quiz questions', error);
  } finally {
    setLoadingState(false);
  }
}

/**
 * Обновляет информацию о текущем вопросе
 * @param {number} totalQuestions - Общее количество вопросов
 * @param {string} questionText - Текст вопроса
 */
function updateQuestionInfo(totalQuestions: number, questionText: string): void {
  const questionCounter = APP_STATE.elements.questionCounter as HTMLElement;
  const questionTextElement = APP_STATE.elements.questionText as HTMLElement;

  questionCounter.innerHTML = `Вопрос: ${APP_STATE.currentQuestionIndex + 1}/${totalQuestions}`;
  questionTextElement.textContent = decodeURIComponent(questionText);
}

/**
 * Подготавливает ответы для текущего вопроса
 * @param {QuizQuestion} question - Текущий вопрос
 * @returns {string[]} Массив перемешанных ответов
 */
function prepareAnswers(question: QuizQuestion): string[] {
  const allAnswers = [...question.incorrect_answers, question.correct_answer];
  APP_STATE.correctAnswer = decodeURIComponent(question.correct_answer);
  console.log(`👉️ Правильный ответ: ${APP_STATE.correctAnswer}`);
  return APP_UTILS.shuffleArray(allAnswers);
}

/**
 * Обновляет варианты ответов для текущего вопроса
 * @param {string[]} answers - Массив вариантов ответов
 */
function updateAnswerOptions(answers: string[]): void {
  (APP_STATE.elements.answerOptions as HTMLInputElement[]).forEach((option, index) => {
    option.checked = false;
    if (index < answers.length) {
      const decodedAnswer = decodeURIComponent(answers[index]);
      option.value = decodedAnswer;
      (option.nextElementSibling?.nextElementSibling as HTMLElement).textContent = decodedAnswer;
    }
  });
}

/**
 * Отображает вопросы викторины
 * @param {QuizQuestion[]} items - Массив вопросов викторины
 */
function renderQuestions(items: QuizQuestion[]): void {
  const currentQuestion = items[APP_STATE.currentQuestionIndex];
  updateQuestionInfo(items.length, currentQuestion.question);
  const answers = prepareAnswers(currentQuestion);
  updateAnswerOptions(answers);
}

/**
 * Обрабатывает нажатие на кнопку отправки ответа
 */
function handleSubmitAnswerClick(): void {
  let checkedAnswer = getCheckedAnswer();
  if (!checkedAnswer) {
    APP_UTILS.showToast('Please select an answer');
    return;
  }
  if (checkedAnswer === APP_STATE.correctAnswer) {
    APP_STATE.score++;
  }
  APP_STATE.currentQuestionIndex++;
  if (APP_STATE.currentQuestionIndex < APP_STATE.quizData.length) {
    renderQuestions(APP_STATE.quizData);
  } else {
    showQuizResults();
  }
}

/**
 * Получает выбранный пользователем ответ
 * @returns {string | null} Выбранный ответ или null, если ничего не выбрано
 */
function getCheckedAnswer(): string | null {
  return (
    (APP_STATE.elements.answerOptions as HTMLInputElement[]).find((option) => option.checked)
      ?.nextElementSibling?.nextElementSibling?.textContent || null
  );
}

/**
 * Отображает результаты викторины
 */
function showQuizResults(): void {
  showConfetti();
  (APP_STATE.elements.quizContent as HTMLElement).classList.add('hidden');
  (APP_STATE.elements.submitAnswer as HTMLElement).classList.add('hidden');
  const quizResults = APP_STATE.elements.quizResults as HTMLElement;
  quizResults.classList.remove('hidden');
  quizResults.classList.add('grid');
  const resultParagraph = quizResults.querySelector('p');
  if (resultParagraph) {
    resultParagraph.innerHTML =
      `You answered correctly to <span class='font-bold'>${APP_STATE.score}/${APP_STATE.quizData.length}</span> questions!`;
  }
}

/**
 * Обрабатывает нажатие на кнопку перезапуска викторины
 */
function handleQuizResultsButtonClick(): void {
  location.reload();
}

/**
 * Инициализирует приложение
 */
initApp();
