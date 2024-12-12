import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

interface Config {
  root: string;
  selectors: {
    form: string;
    results: string;
    monthly: string;
    principal: string;
    interest: string;
  };
}

interface State {
  elements: {
    form: HTMLFormElement | null;
    formButton: HTMLButtonElement | null;
    results: HTMLElement | null;
    monthly: HTMLElement | null;
    principal: HTMLElement | null;
    interest: HTMLElement | null;
  };
}

interface Utils {
  renderDataAttributes: (element: string) => string;
  toastConfig: {
    className: string;
    duration: number;
    gravity: string;
    position: string;
  };
  showToast: (message: string) => void;
}

interface LoanResult {
  monthly: number;
  total: number;
  totalInterest: number;
}

class LoadCalculator {
  private config: Config;
  private state: State;
  private utils: Utils;

  constructor() {
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

    this.state = {
      elements: {
        form: null,
        formButton: null,
        results: null,
        monthly: null,
        principal: null,
        interest: null,
      },
    };

    this.utils = {
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
    };

    this.init();
  }

  private createAppHTML(): void {
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

  private initDOMElements(): void {
    this.state.elements = {
      form: document.querySelector<HTMLFormElement>(this.config.selectors.form),
      formButton: document.querySelector<HTMLButtonElement>(`${this.config.selectors.form} button[type="submit"]`),
      results: document.querySelector<HTMLElement>(this.config.selectors.results),
      monthly: document.querySelector<HTMLElement>(this.config.selectors.monthly),
      principal: document.querySelector<HTMLElement>(this.config.selectors.principal),
      interest: document.querySelector<HTMLElement>(this.config.selectors.interest),
    };
  }

  private init(): void {
    this.createAppHTML();
    this.initDOMElements();

    this.state.elements.form?.addEventListener('submit', this.handleFormSubmit.bind(this));
  }

  private handleFormSubmit(event: Event): void {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const { amount, interest, repay } = Object.fromEntries(formData);

    if (!amount || !interest || !repay) {
      this.utils.showToast('Please fill in all fields');
      return;
    }

    if (this.state.elements.formButton) {
      this.state.elements.formButton.textContent = 'Loading...';
    }
    this.state.elements.results?.classList.add('h-[210px]', 'overflow-auto');

    setTimeout(() => {
      this.displayResults(this.calculateLoan(Number(amount), Number(interest), Number(repay)));
      this.state.elements.form?.reset();
      if (this.state.elements.formButton) {
        this.state.elements.formButton.textContent = 'Calculate';
      }
    }, 1500);
  }

  private calculateLoan(amount: number, interest: number, repay: number): LoanResult {
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

  private displayResults({ monthly, total, totalInterest }: LoanResult): void {
    if (isFinite(monthly)) {
      if (this.state.elements.monthly) this.state.elements.monthly.textContent = monthly.toFixed(2);
      if (this.state.elements.principal) this.state.elements.principal.textContent = total.toFixed(2);
      if (this.state.elements.interest) this.state.elements.interest.textContent = totalInterest.toFixed(2);
    }
  }
}

new LoadCalculator();
