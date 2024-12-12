import './style.css';
import { icons } from 'feather-icons';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import { v4 as uuidv4 } from 'uuid';

/**
 * Интерфейс для транзакции
 */
interface Transaction {
  id: string;
  text: string;
  amount: number;
}

/**
 * Интерфейс для конфигурации
 */
interface Config {
  root: string;
  selectors: {
    balanceAmount: string;
    plusAmount: string;
    minusAmount: string;
    transactionHistory: string;
    transactionForm: string;
    transactionItemId: string;
  };
}

/**
 * Интерфейс для состояния приложения
 */
interface State {
  elements: {
    balanceAmount: HTMLElement | null;
    plusAmount: HTMLElement | null;
    minusAmount: HTMLElement | null;
    transactionHistory: HTMLElement | null;
    transactionForm: HTMLFormElement | null;
    transactionItemId: HTMLElement | null;
  };
  transactions: Transaction[];
}

/**
 * Класс для приложения "Expense Tracker"
 */
class ExpenseTracker {
  private config: Config;
  private state: State;
  private utils: {
    renderDataAttributes: (element: string) => string;
    showToast: (message: string) => void;
  };

  /**
   * Конструктор класса
   */
  constructor() {
    this.config = {
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

    this.state = {
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

    this.utils = {
      renderDataAttributes: (element: string): string => element.slice(1, -1),
      showToast: (message: string): void => {
        Toastify({
          text: message,
          className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
          duration: 3000,
          gravity: 'bottom',
          position: 'center',
        }).showToast();
      },
    };

    this.init();
  }

  /**
   * Создание HTML для приложения
   */
  private createAppHTML(): void {
    const {
      root,
      selectors: {
        balanceAmount,
        transactionHistory,
        transactionForm,
      },
    } = this.config;
    const { renderDataAttributes } = this.utils;
    const rootElement = document.querySelector(root);

    if (!rootElement) return;

    const createListItem = (type: 'plus' | 'minus'): string => `
      <li>
        <p class='border flex font-bold items-center justify-center p-3'>${type === 'plus' ? 'Income' : 'Expense'}</p>
        <p data-${type}-amount class='border flex font-bold items-center justify-center p-3 text-lg text-${type === 'plus' ? 'green' : 'red'}-400'>
          ${type === 'plus' ? '+$0.00' : '-$0.00'}
        </p>
      </li>
    `;

    const createInputField = (id: string, label: string, type: string): string => `
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
   * Инициализация DOM-элементов
   */
  private initDOMElements(): void {
    this.state.elements = {
      balanceAmount: document.querySelector(this.config.selectors.balanceAmount),
      plusAmount: document.querySelector(this.config.selectors.plusAmount),
      minusAmount: document.querySelector(this.config.selectors.minusAmount),
      transactionHistory: document.querySelector(this.config.selectors.transactionHistory),
      transactionForm: document.querySelector(this.config.selectors.transactionForm),
      transactionItemId: document.querySelector(this.config.selectors.transactionItemId),
    };
  }

  /**
   * Инициализация приложения
   */
  private init(): void {
    this.createAppHTML();
    this.initDOMElements();

    this.state.transactions = this.localStorageGet();
    this.localStorageDisplay();
    this.state.elements.transactionForm?.addEventListener('submit', this.handleTransactionFormSubmit.bind(this));
    this.state.elements.transactionHistory?.addEventListener('click', this.handleTransactionDeleteClick.bind(this));
  }

  /**
   * Получение транзакций из локального хранилища
   */
  private localStorageGet(): Transaction[] {
    return JSON.parse(localStorage.getItem('transactions') || '[]');
  }

  /**
   * Отображение транзакций в DOM
   */
  private localStorageDisplay(): void {
    const transactions = this.localStorageGet();
    transactions.forEach(this.renderHTML.bind(this));
    this.updateBalance();
  }

  /**
   * Сохранение транзакций в локальное хранилище
   */
  private localStorageSet(): void {
    localStorage.setItem('transactions', JSON.stringify(this.state.transactions));
  }

  /**
   * Отображение одной транзакции в DOM
   */
  private renderHTML({ id, text, amount }: Transaction): void {
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

    this.state.elements.transactionHistory?.appendChild(li);
  }

  /**
   * Обновление баланса
   */
  private updateBalance(): void {
    const amounts = this.state.transactions.map(({ amount }) => amount);
    const calculateTotal = (predicate: (item: number) => boolean = () => true): string =>
      amounts
        .filter(predicate)
        .reduce((acc, item) => acc + item, 0)
        .toFixed(2);
    const total = calculateTotal();
    const income = calculateTotal((item) => item > 0);
    const expense = (calculateTotal((item) => item < 0) * -1).toFixed(2);

    if (this.state.elements.balanceAmount) {
      this.state.elements.balanceAmount.textContent = `$${total}`;
    }
    if (this.state.elements.plusAmount) {
      this.state.elements.plusAmount.textContent = `$${income}`;
    }
    if (this.state.elements.minusAmount) {
      this.state.elements.minusAmount.textContent = `$${expense}`;
    }
  }

  /**
   * Обработка события отправки формы добавления транзакции
   */
  private handleTransactionFormSubmit(event: Event): void {
    event.preventDefault();
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;

    const formData = new FormData(form);
    const text = formData.get('text');
    const amount = formData.get('amount');

    if (typeof text !== 'string' || typeof amount !== 'string') return;

    if (!text.trim() || isNaN(parseFloat(amount))) {
      this.utils.showToast('Text and amount are required');
      return;
    }
    const transaction: Transaction = {
      id: uuidv4(),
      text: text.trim(),
      amount: parseFloat(amount),
    };

    this.state.transactions.push(transaction);
    this.updateBalance();
    this.localStorageSet();
    this.renderHTML(transaction);
    form.reset();
  }

  /**
   * Обработка события удаления транзакции
   */
  private handleTransactionDeleteClick({ target }: MouseEvent): void {
    if (!target instanceof HTMLElement) {
      return;
    }
    const button = target;
    if (
      !button.matches(this.config.selectors.transactionItemId) ||
      !window.confirm('Are you sure?')
    )
      return;
    const id = button.dataset.id;
    if (id) {
      this.state.transactions = this.state.transactions.filter((transaction) => transaction.id !== id);
      this.localStorageSet();
      if (this.state.elements.transactionHistory) {
        this.state.elements.transactionHistory.innerHTML = '';
      }
      this.state.transactions.forEach(this.renderHTML.bind(this));
      this.updateBalance();
    }
  }
}

new ExpenseTracker();