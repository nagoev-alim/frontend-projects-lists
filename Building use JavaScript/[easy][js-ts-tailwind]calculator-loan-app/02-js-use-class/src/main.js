/**
 * Этот файл содержит реализацию калькулятора кредита.
 * Он создает интерфейс для ввода данных о кредите, выполняет расчеты и отображает результаты.
 * Используется класс LoadCalculator для инкапсуляции всей функциональности.
 */

import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

/**
 * Класс, представляющий калькулятор кредита
 */
class LoadCalculator {
  /**
   * Создает экземпляр калькулятора кредита
   */
  constructor() {
    /**
     * Конфигурация приложения
     * @type {Object}
     */
    this.config = {
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
     * @type {Object}
     */
    this.state = {
      elements: {
        form: null,
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
    this.utils = {
      /**
       * Обрабатывает строку с data-атрибутом
       * @param {string} element - Строка с data-атрибутом
       * @returns {string} Обработанная строка
       */
      renderDataAttributes: (element) => element.slice(1, -1),

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
          ...this.utils.toastConfig,
        }).showToast();
      },
    };

    this.init();
  }

  /**
   * Создает HTML разметку приложения
   */
  createAppHTML() {
    const {
      root,
      selectors: {
        form,
        results,
        monthly,
        principal,
        interest,
      },
    } = this.config;
    const { renderDataAttributes } = this.utils;
    const rootElement = document.querySelector(root);

    if (!rootElement) return;

    rootElement.innerHTML = `
    <div class='grid max-w-md w-full gap-4 rounded border bg-white p-3 shadow'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>Loan Calculator</h1>
      <form class='grid gap-3' ${renderDataAttributes(form)}>
        <input class='rounded border-2 bg-slate-50 px-3 py-2 focus:border-blue-400 focus:outline-none' type='number' name='amount' placeholder='Loan amount'>
        <input class='rounded border-2 bg-slate-50 px-3 py-2 focus:border-blue-400 focus:outline-none' type='number' name='interest' placeholder='Interest'>
        <input class='rounded border-2 bg-slate-50 px-3 py-2 focus:border-blue-400 focus:outline-none' type='number' name='repay' placeholder='Years to repay'>
        <button class='border px-3 py-2 hover:bg-slate-50' type='submit'>Calculate</button>
      </form>
      <ul class='grid h-0 items-start gap-2 overflow-hidden place-items-center transition-all' ${renderDataAttributes(results)}>
        <li class='grid gap-2 text-center'>
          <p class='font-medium'>Monthly Payments:</p>
          <p class='text-2xl font-bold'><sup>$</sup><span ${renderDataAttributes(monthly)}>0</span></p>
        </li>
        <li class='grid gap-2 text-center'>
          <p class='font-medium'>Total Principal Paid:</p>
          <p class='text-2xl font-bold'><sup>$</sup><span ${renderDataAttributes(principal)}>0</span></p>
        </li>
        <li class='grid gap-2 text-center'>
          <p class='font-medium'>Total Interest Paid:</p>
          <p class='text-2xl font-bold'><sup>$</sup><span ${renderDataAttributes(interest)}>0</span></p>
        </li>
      </ul>
    </div>
  `;
  }

  /**
   * Инициализирует DOM элементы
   */
  initDOMElements() {
    this.state.elements = {
      form: document.querySelector(this.config.selectors.form),
      formButton: document.querySelector(`${this.config.selectors.form} button[type="submit"]`),
      results: document.querySelector(this.config.selectors.results),
      monthly: document.querySelector(this.config.selectors.monthly),
      principal: document.querySelector(this.config.selectors.principal),
      interest: document.querySelector(this.config.selectors.interest),
    };
  }

  /**
   * Инициализирует приложение
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();

    this.state.elements.form.addEventListener('submit', this.handleFormSubmit.bind(this));
  }

  /**
   * Обрабатывает отправку формы
   * @param {Event} event - Событие отправки формы
   */
  handleFormSubmit(event) {
    event.preventDefault();
    const { amount, interest, repay } = Object.fromEntries(new FormData(event.target));

    if (!amount || !interest || !repay) {
      this.utils.showToast('Please fill in all fields');
      return;
    }

    this.state.elements.formButton.textContent = 'Loading...';
    this.state.elements.results.classList.add('h-[210px]', 'overflow-auto');

    setTimeout(() => {
      this.displayResults(this.calculateLoan(Number(amount), Number(interest), Number(repay)));
      this.state.elements.form.reset();
      this.state.elements.formButton.textContent = 'Calculate';
    }, 1500);
  }

  /**
   * Рассчитывает параметры кредита
   * @param {number} amount - Сумма кредита
   * @param {number} interest - Процентная ставка
   * @param {number} repay - Срок погашения в годах
   * @returns {Object} Результаты расчета
   */
  calculateLoan(amount, interest, repay) {
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
  displayResults({ monthly, total, totalInterest }) {
    if (isFinite(monthly)) {
      this.state.elements.monthly.textContent = monthly.toFixed(2);
      this.state.elements.principal.textContent = total.toFixed(2);
      this.state.elements.interest.textContent = totalInterest.toFixed(2);
    }
  }
}

new LoadCalculator();
