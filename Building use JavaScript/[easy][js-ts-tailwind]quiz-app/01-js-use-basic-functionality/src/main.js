/**
 * Этот код представляет собой реализацию веб-приложения для викторины.
 * Он включает в себя функциональность для загрузки вопросов с удаленного API,
 * отображения вопросов и вариантов ответов, обработки ответов пользователя,
 * подсчета очков и отображения результатов.
 */

import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import confetti from 'canvas-confetti';
import axios from 'axios';

/**
 * Объект с конфигурационными параметрами приложения
 * @type {Object}
 */
const APP_CONFIG = {
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
 * Объект для хранения состояния приложения
 * @type {Object}
 */
const APP_STATE = {
  elements: {
    loadingSpinner: null,
    quizContainer: null,
    quizContent: null,
    questionCounter: null,
    questionText: null,
    answerOptions: null,
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
 * Объект с вспомогательными функциями
 * @type {Object}
 */
const APP_UTILS = {
  /**
   * Добавляет ведущий ноль к числу, если оно меньше 10
   * @param {number} num - Число для форматирования
   * @returns {string} Отформатированное число
   */
  addLeadingZero: (num) => num.toString().padStart(2, '0'),

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

  /**
   * Конфигурация для всплывающих уведомлений
   * @type {Object}
   */
  toastConfig: {
    className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
    duration: 3000,
    gravity: 'bottom',
    position: 'center',
  },

  /**
   * Показывает всплывающее уведомление
   * @param {string} message - Текст уведомления
   */
  showToast: (message) => {
    Toastify({
      text: message,
      ...APP_UTILS.toastConfig,
    }).showToast();
  },

  /**
   * Обрабатывает ошибки
   * @param {string} message - Сообщение об ошибке
   * @param {Error} [error] - Объект ошибки (необязательный)
   */
  handleError: (message, error = null) => {
    APP_UTILS.showToast(message);
    if (error) console.error(message, error);
  },

  /**
   * Перемешивает элементы массива
   * @param {Array} array - Массив для перемешивания
   * @returns {Array} Перемешанный массив
   */
  shuffleArray: (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  },
};

/**
 * Создает HTML-разметку приложения
 */
function createAppHTML() {
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
function initDOMElements() {
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
function initApp() {
  createAppHTML();
  initDOMElements();

  (async () => {
    await fetchQuizQuestions();
    APP_STATE.elements.submitAnswer.addEventListener('click', handleSubmitAnswerClick);
    APP_STATE.elements.quizResultsButton.addEventListener(
      'click',
      handleQuizResultsButtonClick,
    );
  })();
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
 * Получает данные викторины с удаленного API
 * @async
 * @returns {Promise<Array>} Массив с вопросами викторины
 */
async function getQuizData() {
  const {
    data: { results },
  } = await axios.get(APP_CONFIG.url);
  return results;
}

/**
 * Устанавливает состояние загрузки для элементов интерфейса
 * @param {boolean} isLoading - Флаг, указывающий на состояние загрузки
 */
function setLoadingState(isLoading) {
  APP_STATE.elements.quizContainer.classList.toggle('pointer-events-none', isLoading);
  APP_STATE.elements.quizContainer.classList.toggle('hidden', isLoading);
  APP_STATE.elements.loadingSpinner.classList.toggle('hidden', !isLoading);
}

/**
 * Загружает вопросы викторины и обновляет интерфейс
 * @async
 */
async function fetchQuizQuestions() {
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
function updateQuestionInfo(totalQuestions, questionText) {
  APP_STATE.elements.questionCounter.innerHTML = `Question: ${APP_STATE.currentQuestionIndex + 1}/${totalQuestions}`;
  APP_STATE.elements.questionText.textContent = decodeURIComponent(questionText);
}

/**
 * Подготавливает массив ответов для текущего вопроса
 * @param {Object} question - Объект с данными вопроса
 * @returns {Array} Перемешанный массив ответов
 */
function prepareAnswers(question) {
  const allAnswers = [...question.incorrect_answers, question.correct_answer];
  APP_STATE.correctAnswer = decodeURIComponent(question.correct_answer);
  console.log(`👉️ Correct answer: ${APP_STATE.correctAnswer}`);
  return APP_UTILS.shuffleArray(allAnswers);
}

/**
 * Обновляет варианты ответов в интерфейсе
 * @param {Array} answers - Массив вариантов ответов
 */
function updateAnswerOptions(answers) {
  APP_STATE.elements.answerOptions.forEach((option, index) => {
    option.checked = false;
    if (index < answers.length) {
      const decodedAnswer = decodeURIComponent(answers[index]);
      option.value = decodedAnswer;
      option.nextElementSibling.nextElementSibling.textContent = decodedAnswer;
    }
  });
}

/**
 * Отображает вопросы викторины
 * @param {Array} items - Массив вопросов
 */
function renderQuestions(items) {
  const currentQuestion = items[APP_STATE.currentQuestionIndex];
  updateQuestionInfo(items.length, currentQuestion.question);
  const answers = prepareAnswers(currentQuestion);
  updateAnswerOptions(answers);
}

/**
 * Обрабатывает нажатие на кнопку отправки ответа
 */
function handleSubmitAnswerClick() {
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
 * @returns {string|null} Текст выбранного ответа или null, если ответ не выбран
 */
function getCheckedAnswer() {
  return (
    APP_STATE.elements.answerOptions.find((option) => option.checked)?.nextElementSibling
      .nextElementSibling.textContent || null
  );
}

/**
 * Отображает результаты викторины
 */
function showQuizResults() {
  showConfetti();
  APP_STATE.elements.quizContent.classList.add('hidden');
  APP_STATE.elements.submitAnswer.classList.add('hidden');
  APP_STATE.elements.quizResults.classList.remove('hidden');
  APP_STATE.elements.quizResults.classList.add('grid');
  APP_STATE.elements.quizResults.querySelector('p').innerHTML =
    `You answered correctly to <span class='font-bold'>${APP_STATE.score}/${APP_STATE.quizData.length}</span> questions!`;
}

/**
 * Обрабатывает нажатие на кнопку перезагрузки викторины
 * @returns {void}
 */
function handleQuizResultsButtonClick() {
  return location.reload();
}

/**
 * Инициализирует приложение
 */
initApp();
