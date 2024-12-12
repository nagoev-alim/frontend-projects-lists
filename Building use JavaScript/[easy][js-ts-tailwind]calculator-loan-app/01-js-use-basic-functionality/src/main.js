/**
 * Этот файл содержит реализацию калькулятора кредита.
 * Он позволяет пользователю ввести сумму кредита, процентную ставку и срок погашения,
 * после чего рассчитывает и отображает ежемесячный платеж, общую сумму выплат и общую сумму процентов.
 */

import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

/**
 * Конфигурация приложения
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента
 * @property {Object} selectors - Объект с селекторами элементов
 */

/**
 * @type {AppConfig}
 */
const APP_CONFIG = {
  root: '#app',
  selectors: {
    form: '[data-loan-form]',
    results: '[data-loan-results]',
    monthly: '[data-loan-monthly]',
    principal: '[data-loan-principal]',
    interest: '[data-loan-interest]',
  },
};

/**
 * Состояние приложения
 * @typedef {Object} AppState
 * @property {Object} elements - Объект с DOM элементами
 */

/**
 * @type {AppState}
 */
const APP_STATE = {
  elements: {
    form: null,
    formButton: null,
    results: null,
    monthly: null,
    principal: null,
    interest: null,
  },
};

/**
 * Утилиты приложения
 * @type {Object}
 */
const APP_UTILS = {
  /**
   * Конфигурация для уведомлений
   * @type {Object}
   */
  toastConfig: {
    className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
    duration: 3000,
    gravity: 'bottom',
    position: 'center',
  },

  /**
   * Показывает уведомление
   * @param {string} message - Текст уведомления
   */
  showToast: (message) => {
    Toastify({
      text: message,
      ...APP_UTILS.toastConfig,
    }).showToast();
  },
};

/**
 * Создает HTML разметку приложения
 */
function createAppHTML() {
  const {
    root,
    selectors: {
      form,
      results,
      monthly,
      principal,
      interest,
    },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='grid max-w-md w-full gap-4 rounded border bg-white p-3 shadow'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>Loan Calculator</h1>
      <form class='grid gap-3' data-loan-form>
        <input class='rounded border-2 bg-slate-50 px-3 py-2 focus:border-blue-400 focus:outline-none' type='number' name='amount' placeholder='Loan amount'>
        <input class='rounded border-2 bg-slate-50 px-3 py-2 focus:border-blue-400 focus:outline-none' type='number' name='interest' placeholder='Interest'>
        <input class='rounded border-2 bg-slate-50 px-3 py-2 focus:border-blue-400 focus:outline-none' type='number' name='repay' placeholder='Years to repay'>
        <button class='border px-3 py-2 hover:bg-slate-50' type='submit'>Calculate</button>
      </form>
      <ul class='grid h-0 items-start gap-2 overflow-hidden place-items-center transition-all' data-loan-results>
        <li class='grid gap-2 text-center'>
          <p class='font-medium'>Monthly Payments:</p>
          <p class='text-2xl font-bold'><sup>$</sup><span data-loan-monthly>0</span></p>
        </li>
        <li class='grid gap-2 text-center'>
          <p class='font-medium'>Total Principal Paid:</p>
          <p class='text-2xl font-bold'><sup>$</sup><span data-loan-principal>0</span></p>
        </li>
        <li class='grid gap-2 text-center'>
          <p class='font-medium'>Total Interest Paid:</p>
          <p class='text-2xl font-bold'><sup>$</sup><span data-loan-interest>0</span></p>
        </li>
      </ul>
    </div>
  `;
}

/**
 * Инициализирует DOM элементы
 */
function initDOMElements() {
  APP_STATE.elements = {
    form: document.querySelector(APP_CONFIG.selectors.form),
    formButton: document.querySelector(`${APP_CONFIG.selectors.form} button[type="submit"]`),
    results: document.querySelector(APP_CONFIG.selectors.results),
    monthly: document.querySelector(APP_CONFIG.selectors.monthly),
    principal: document.querySelector(APP_CONFIG.selectors.principal),
    interest: document.querySelector(APP_CONFIG.selectors.interest),
  };
}

/**
 * Инициализирует приложение
 */
function initApp() {
  createAppHTML();
  initDOMElements();

  APP_STATE.elements.form.addEventListener('submit', handleFormSubmit);
}

/**
 * Обрабатывает отправку формы
 * @param {Event} event - Событие отправки формы
 */
function handleFormSubmit(event) {
  event.preventDefault();
  const { amount, interest, repay } = Object.fromEntries(new FormData(event.target));

  if (!amount || !interest || !repay) {
    APP_UTILS.showToast('Please fill in all fields');
    return;
  }

  APP_STATE.elements.formButton.textContent = 'Loading...';
  APP_STATE.elements.results.classList.add('h-[210px]', 'overflow-auto');

  setTimeout(() => {
    displayResults(calculateLoan(Number(amount), Number(interest), Number(repay)));
    APP_STATE.elements.form.reset();
    APP_STATE.elements.formButton.textContent = 'Calculate';
  }, 1500);
}

/**
 * Рассчитывает параметры кредита
 * @param {number} amount - Сумма кредита
 * @param {number} interest - Процентная ставка
 * @param {number} repay - Срок погашения в годах
 * @returns {Object} Результаты расчета
 */
function calculateLoan(amount, interest, repay) {
  const principal = amount;
  const monthlyInterest = interest / 100 / 12;
  const totalPayments = repay * 12;

  const x = Math.pow(1 + monthlyInterest, totalPayments);
  const monthlyPayment = (principal * x * monthlyInterest) / (x - 1);

  return {
    monthly: monthlyPayment,
    total: monthlyPayment * totalPayments,
    totalInterest: (monthlyPayment * totalPayments) - principal,
  };
}

/**
 * Отображает результаты расчета
 * @param {Object} results - Результаты расчета
 * @param {number} results.monthly - Ежемесячный платеж
 * @param {number} results.total - Общая сумма выплат
 * @param {number} results.totalInterest - Общая сумма процентов
 */
function displayResults({ monthly, total, totalInterest }) {
  if (isFinite(monthly)) {
    APP_STATE.elements.monthly.textContent = monthly.toFixed(2);
    APP_STATE.elements.principal.textContent = total.toFixed(2);
    APP_STATE.elements.interest.textContent = totalInterest.toFixed(2);
  }
}

initApp();
