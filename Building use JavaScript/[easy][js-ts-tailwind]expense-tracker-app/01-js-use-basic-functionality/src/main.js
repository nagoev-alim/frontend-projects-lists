/**
 * Этот файл содержит реализацию приложения для отслеживания расходов.
 * Он использует JavaScript ES6, HTML, CSS и некоторые библиотеки, такие как feather-icons и toastify-js.
 */

import './style.css';
import { icons } from 'feather-icons';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import { v4 as uuidv4 } from 'uuid';

/**
 * Конфигурация приложения.
 * @type {{root: string, selectors: {balanceAmount: string, plusAmount: string, minusAmount: string, transactionHistory: string, transactionForm: string, transactionItemId: string}}}
 */
const APP_CONFIG = {
  root: '#app',
  selectors: {
    balanceAmount: '[data-balance-amount]',
    plusAmount: '[data-plus-amount]',
    minusAmount: '[data-minus-amount]',
    transactionHistory: '[data-transaction-history]',
    transactionForm: '[data-transaction-form]',
    transactionItemId: '[data-id]',
  },
};

/**
 * Состояние приложения.
 * @type {{elements: {balanceAmount: null, plusAmount: null, minusAmount: null, transactionHistory: null, transactionForm: null, transactionItemId: null}, transactions: Array}}
 */
const APP_STATE = {
  elements: {
    balanceAmount: null,
    plusAmount: null,
    minusAmount: null,
    transactionHistory: null,
    transactionForm: null,
    transactionItemId: null,
  },
  transactions: [],
};

/**
 * Вспомогательные функции приложения.
 * @type {{renderDataAttributes: (function(string): string), showToast: (function(string): void)}}
 */
const APP_UTILS = {
  renderDataAttributes: (element) => element.slice(1, -1),
  showToast: (message) => {
    Toastify({
      text: message,
      className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
      duration: 3000,
      gravity: 'bottom',
      position: 'center',
    }).showToast();
  },
};

/**
 * Функция создания HTML-кода приложения.
 */
function createAppHTML() {
  const {
    root,
    selectors: {
      balanceAmount,
      transactionHistory,
      transactionForm,
    },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector(root);

  if (!rootElement) return;

  const createListItem = (type) => `
    <li>
      <p class='border flex font-bold items-center justify-center p-3'>${type === 'plus' ? 'Income' : 'Expense'}</p>
      <p data-${type}-amount class='border flex font-bold items-center justify-center p-3 text-lg text-${type === 'plus' ? 'green' : 'red'}-400'>
        ${type === 'plus' ? '+$0.00' : '-$0.00'}
      </p>
    </li>
  `;

  const createInputField = (id, label, type) => `
    <label class='grid gap-1'>
      <span class='font-medium text-sm'>${label}</span>
      <input class='border-2 focus:border-blue-400 focus:outline-none px-3 py-2.5 rounded' 
             autocomplete='off' type='${type}' id='${id}' name='${id}' 
             placeholder='Enter ${id}' />
    </label>
  `;

  rootElement.innerHTML = `
    <div class='border gap-4 grid max-w-md p-3 rounded shadow w-full'>
      <h1 class='font-bold md:text-4xl text-2xl text-center'>Expense Tracker</h1>
      <div class='gap-3 grid'>
        <header class='bg-slate-50 border font-bold gap-2 grid place-items-center p-2 rounded'>
          <h2 class='text-2xl'>Your Balance</h2>
          <p class='text-3xl' ${renderDataAttributes(balanceAmount)}>$0.00</p>
        </header>
        <ul class='grid grid-cols-2'>
          ${['plus', 'minus'].map(createListItem).join('')}
        </ul>
        <h5 class='bg-slate-50 border font-bold p-2 rounded'>History</h5>
        <ul class='gap-2 grid max-h-[200px] overflow-auto' ${renderDataAttributes(transactionHistory)}></ul>
        <h5 class='bg-slate-50 border font-bold p-2 rounded'>Add new transaction</h5>
        <form class='gap-3 grid'  ${renderDataAttributes(transactionForm)}>
          ${createInputField('text', 'Text', 'text')}
          ${createInputField('amount', 'Amount (negative - expense, positive - income)', 'number')}
          <button class='bg-slate-100 border hover:bg-slate-200 px-3 py-2.5'>Add transaction</button>
        </form>
      </div>
    </div>
  `;
}

/**
 * Функция инициализации DOM-элементов приложения.
 */
function initDOMElements() {
  APP_STATE.elements = {
    balanceAmount: document.querySelector(APP_CONFIG.selectors.balanceAmount),
    plusAmount: document.querySelector(APP_CONFIG.selectors.plusAmount),
    minusAmount: document.querySelector(APP_CONFIG.selectors.minusAmount),
    transactionHistory: document.querySelector(APP_CONFIG.selectors.transactionHistory),
    transactionForm: document.querySelector(APP_CONFIG.selectors.transactionForm),
  };
}

/**
 * Функция инициализации приложения.
 */
function initApp() {
  createAppHTML();
  initDOMElements();

  APP_STATE.transactions = localStorageGet();
  localStorageDisplay();
  APP_STATE.elements.transactionForm.addEventListener('submit', handleTransactionFormSubmit);
  APP_STATE.elements.transactionHistory.addEventListener('click', handleTransactionDeleteClick);
}

/**
 * Функция получения данных из локального хранилища.
 * @returns {Array}
 */
function localStorageGet() {
  return JSON.parse(localStorage.getItem('transactions') || '[]');
}

/**
 * Функция отображения транзакций в локальном хранилище.
 */
function localStorageDisplay() {
  const transactions = localStorageGet();
  transactions.forEach(renderHTML);
  updateBalance();
}

/**
 * Функция сохранения транзакций в локальное хранилище.
 */
function localStorageSet() {
  localStorage.setItem('transactions', JSON.stringify(APP_STATE.transactions));
}

/**
 * Функция отображения транзакции на странице.
 * @param {{id: string, text: string, amount: number}} transaction
 */
function renderHTML({ id, text, amount }) {
  const li = document.createElement('li');
  const isNegative = amount < 0;

  li.className = `border-2 flex p-2 gap-2 rounded ${isNegative ? 'bg-red-50 border-red-500' : 'bg-green-50 border-green-500'}`;

  const amountText = `${isNegative ? '-' : '+'}${Math.abs(amount)}`;
  const amountClass = `ml-auto font-bold text-${isNegative ? 'red' : 'green'}-400`;

  li.innerHTML = `
    <p>${text}</p>
    <span class='${amountClass}'>${amountText}</span>
    <button data-id='${id}'>
      <span class='pointer-events-none'>${icons.x.toSvg()}</span>
    </button>
  `;

  APP_STATE.elements.transactionHistory.appendChild(li);
}

/**
 * Функция обновления баланса приложения.
 */
function updateBalance() {
  const amounts = APP_STATE.transactions.map(({ amount }) => amount);
  const calculateTotal = (predicate = () => true) =>
    amounts
      .filter(predicate)
      .reduce((acc, item) => acc + item, 0)
      .toFixed(2);
  const total = calculateTotal();
  const income = calculateTotal((item) => item > 0);
  const expense = (calculateTotal((item) => item < 0) * -1).toFixed(2);

  APP_STATE.elements.balanceAmount.textContent = `$${total}`;
  APP_STATE.elements.plusAmount.textContent = `$${income}`;
  APP_STATE.elements.minusAmount.textContent = `$${expense}`;
}

/**
 * Функция обработки события отправки формы транзакции.
 * @param {Event} event
 */
function handleTransactionFormSubmit(event) {
  event.preventDefault();
  const { text, amount } = Object.fromEntries(new FormData(event.target));
  if (!text.trim() || isNaN(parseFloat(amount))) {
    APP_UTILS.showToast('Text and amount are required');
    return;
  }
  const transaction = {
    id: uuidv4(),
    text: text.trim(),
    amount: parseFloat(amount),
  };

  APP_STATE.transactions.push(transaction);
  updateBalance();
  localStorageSet();
  renderHTML(transaction);
  event.target.reset();
}

/**
 * Функция обработки события удаления транзакции.
 * @param {Event} event
 */
function handleTransactionDeleteClick({ target }) {
  if (
    !target.matches(APP_CONFIG.selectors.transactionItemId) ||
    !window.confirm('Are you sure?')
  )
    return;
  const id = target.dataset.id;
  APP_STATE.transactions = APP_STATE.transactions.filter((transaction) => transaction.id !== id);
  localStorageSet();
  APP_STATE.elements.transactionHistory.innerHTML = '';
  APP_STATE.transactions.forEach(renderHTML);
  updateBalance();
}

// Запуск приложения
initApp();