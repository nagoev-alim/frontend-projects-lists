/**
 * Этот код реализует конвертер валют с использованием API обмена валют.
 * Он позволяет пользователю выбрать исходную и целевую валюты, ввести сумму
 * и получить текущий курс обмена и конвертированную сумму.
 */

import './style.css';
import mockData from './mock';
import { icons } from 'feather-icons';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';

/**
 * Интерфейс для конфигурации приложения
 */
interface Config {
  root: string;
  selectors: {
    [key: string]: string;
  };
  flagApiUrl: string;
  currencyApiUrl: string;
  apiKey: string;
  defaultCurrency: {
    from: string;
    to: string;
  };
}

/**
 * Интерфейс для состояния приложения
 */
interface State {
  elements: {
    [key: string]: HTMLElement | null;
  };
}

/**
 * Интерфейс для вспомогательных утилит
 */
interface Utils {
  toastConfig: {
    className: string;
    duration: number;
    gravity: string;
    position: string;
  };
  renderDataAttributes: (element: string) => string;
  showToast: (message: string) => void;
  handleError: (message: string, error?: Error) => void;
}

/**
 * Интерфейс для ответа API обмена валют
 */
interface ApiResponse {
  result: number;
  date: string;
  success: boolean;
  info: {
    rate: number;
  };
}

/**
 * Класс, реализующий функциональность конвертера валют
 */
class CurrencyConverter {
  private readonly config: Config;
  private state: State;
  private readonly utils: Utils;

  /**
   * Конструктор класса CurrencyConverter
   */
  constructor() {
    this.config = {
      root: '#app',
      selectors: {
        currencyForm: '[data-converter-form]',
        currencyFromSelect: '[data-currency-from]',
        currencyToSelect: '[data-currency-to]',
        currencySwitch: '[data-currency-switch]',
        exchangeRate: '[data-exchange-rate]',
        currencyAmount: '[data-currency-amount]',
      },
      flagApiUrl: 'https://flagcdn.com/48x36',
      currencyApiUrl: 'https://api.apilayer.com/exchangerates_data/convert',
      apiKey: '72QTpHHYt5e4JNuG2VCwerzkjph8ZNuB',
      defaultCurrency: {
        from: 'USD',
        to: 'RUB',
      },
    };

    this.state = {
      elements: {
        currencyForm: null,
        currencyFromSelect: null,
        currencyToSelect: null,
        currencySwitch: null,
        exchangeRate: null,
        currencyAmount: null,
      },
    };

    this.utils = {
      toastConfig: {
        className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
        duration: 3000,
        gravity: 'bottom',
        position: 'center',
      },
      renderDataAttributes: (element: string): string => element.slice(1, -1),
      showToast: (message: string): void => {
        // @ts-ignore
        Toastify({
          text: message,
          ...this.utils.toastConfig,
        }).showToast();
      },
      handleError: (message: string, error: Error | null = null): void => {
        this.utils.showToast(message);
        if (error) console.error(message, error);
      },
    };

    this.init();
  }

  /**
   * Создает HTML-разметку приложения
   */
  private createAppHTML(): void {
    const {
      root,
      selectors: {
        currencyForm,
        currencyFromSelect,
        currencyToSelect,
        currencySwitch,
        exchangeRate,
        currencyAmount,
      },
      defaultCurrency: { from, to },
    } = this.config;
    const { renderDataAttributes } = this.utils;
    const rootElement = document.querySelector(root);

    if (!rootElement) return;

    rootElement.innerHTML = `
    <div class='grid gap-4 max-w-md w-full rounded border p-3 shadow'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>Currency Converter</h1>
      <form class='grid gap-3' ${renderDataAttributes(currencyForm)}>
        <label class='grid gap-1'>
          <span class='text-sm font-medium'>Enter Amount</span>
          <input class='rounded border-2 bg-gray-50 px-3 py-2.5 focus:border-blue-400 focus:outline-none' type='number' value='1' step='1' min='1' name='amount' ${renderDataAttributes(currencyAmount)}>
        </label>
        <div class='grid gap-3 sm:grid-cols-[auto_40px_auto] sm:items-end'>
          <label>
            <span class='text-sm font-medium'>From</span>
            <div class='relative'>
              <img class='absolute left-2 top-1/2 w-8 -translate-y-1/2 transform' src='https://flagcdn.com/48x36/us.png' alt='flag'>
              <select class='w-full rounded border-2 bg-gray-50 px-3 py-2.5 pl-10 focus:border-blue-400 focus:outline-none' ${renderDataAttributes(currencyFromSelect)} name='from'>
                ${mockData.map(({ name }) => `${name === from ? `<option value='${name}' selected>${name}</option>` : `<option value='${name}'>${name}</option>`}`).join('')}
              </select>
            </div>
          </label>
          <div class='flex cursor-pointer justify-center rounded border p-2 transition hover:bg-neutral-100 sm:mb-1.5 sm:border-none' ${renderDataAttributes(currencySwitch)}>${icons.repeat.toSvg()}</div>
          <label>
            <span class='text-sm font-medium'>To</span>
            <div class='relative'>
              <img class='absolute left-2 top-1/2 w-8 -translate-y-1/2 transform' src='https://flagcdn.com/48x36/ru.png' alt='flag'>
              <select class='w-full rounded border-2 bg-gray-50 px-3 py-2.5 pl-10 focus:border-blue-400 focus:outline-none' ${renderDataAttributes(currencyToSelect)} name='to'>
                ${mockData.map(({ name }) => `${name === to ? `<option value='${name}' selected>${name}</option>` : `<option value='${name}'>${name}</option>`}`).join('')}
              </select>
            </div>
          </label>
        </div>
        <div class='hidden' ${renderDataAttributes(exchangeRate)}>Getting exchange rate...</div>
        <button class='border px-3 py-2.5 hover:bg-neutral-100' type='submit'>Get Exchange Rate</button>
      </form>
    </div>`;
  }

  /**
   * Инициализирует DOM-элементы
   */
  private initDOMElements(): void {
    this.state.elements = {
      currencyForm: document.querySelector(this.config.selectors.currencyForm),
      currencyFromSelect: document.querySelector(this.config.selectors.currencyFromSelect),
      currencyToSelect: document.querySelector(this.config.selectors.currencyToSelect),
      currencySwitch: document.querySelector(this.config.selectors.currencySwitch),
      exchangeRate: document.querySelector(this.config.selectors.exchangeRate),
      currencyAmount: document.querySelector(this.config.selectors.currencyAmount),
    };
  }

  /**
   * Инициализирует приложение
   */
  private init(): void {
    this.createAppHTML();
    this.initDOMElements();

    (async () => {
      await this.updateExchangeRate();
      if (this.state.elements.currencyForm) {
        this.state.elements.currencyForm.addEventListener('submit', this.handleCurrencyFormSubmit.bind(this));
      }
      [this.state.elements.currencyFromSelect, this.state.elements.currencyToSelect].forEach((select) => {
        if (select instanceof HTMLElement) {
          select.addEventListener('change', this.handleCurrencySelectChange.bind(this));
        }
      });
      if (this.state.elements.currencySwitch) {
        this.state.elements.currencySwitch.addEventListener('click', this.handleCurrencySwitchClick.bind(this));
      }
    })();
  }

  /**
   * Обновляет курс обмена
   */
  private async updateExchangeRate(): Promise<void> {
    if (!this.state.elements.currencyAmount || !(this.state.elements.currencyAmount instanceof HTMLInputElement)) return;
    if (this.state.elements.exchangeRate) {
      this.state.elements.exchangeRate.classList.remove('hidden');
      this.state.elements.exchangeRate.textContent = 'Getting the exchange rate...';
    }
    const amount = this.state.elements.currencyAmount.value;
    const fromCurrency = (this.state.elements.currencyFromSelect as HTMLSelectElement)?.value;
    const toCurrency = (this.state.elements.currencyToSelect as HTMLSelectElement)?.value;
    await this.fetchExchangeRate(Number(amount), fromCurrency, toCurrency);
  }

  /**
   * Получает курс обмена валют с помощью API
   * @param {number} amount - Сумма для конвертации
   * @param {string} fromCurrency - Исходная валюта
   * @param {string} toCurrency - Целевая валюта
   * @returns {Promise<void>}
   */
  private async fetchExchangeRate(amount: number, fromCurrency: string, toCurrency: string): Promise<void> {
    try {
      const { data } = await axios.get<ApiResponse>(this.config.currencyApiUrl, {
        params: { to: toCurrency, from: fromCurrency, amount },
        headers: { apikey: this.config.apiKey },
      });
      const {
        result,
        date,
        success,
        info: { rate },
      } = data;

      if (!success) {
        throw new Error('API request failed');
      }
      const formatCurrency = (value: number): string => value.toFixed(2);
      const formatDate = (dateString: string): string => new Date(dateString).toLocaleString();

      if (this.state.elements.exchangeRate) {
        this.state.elements.exchangeRate.innerHTML = `
        <table class='table-auto w-full'>
          <tr><td class='border p-2 bg-neutral-50 font-medium'>Date</td><td class='border p-2'>${formatDate(date)}</td></tr>
          <tr><td class='border p-2 bg-neutral-50 font-medium'>Rate</td><td class='border p-2'>1 ${fromCurrency} = ${formatCurrency(rate)} ${toCurrency}</td></tr>
          <tr><td class='border p-2 bg-neutral-50 font-medium'>Exchange</td><td class='border p-2'>${amount} ${fromCurrency} = ${formatCurrency(result)} ${toCurrency}</td></tr>
        </table>
      `;
      }
    } catch (error) {
      this.utils.handleError('Error when receiving exchange rate:', error as Error);
    }
  }

  /**
   * Обрабатывает отправку формы конвертации валют
   * @param {Event} event - Событие отправки формы
   * @returns {Promise<void>}
   */
  private async handleCurrencyFormSubmit(event: Event): Promise<void> {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const amount = formData.get('amount');
    const to = formData.get('to');
    const from = formData.get('from');
    const numberAmount = Number(amount);
    if (isNaN(numberAmount) || numberAmount <= 0 || !from || !to) {
      this.utils.showToast('All fields are required');
      return;
    }
    await this.fetchExchangeRate(numberAmount, from.toString(), to.toString());
  }

  /**
   * Обрабатывает изменение выбора валюты и обновляет соответствующий флаг
   * @param {Event} event - Событие изменения select
   */
  private handleCurrencySelectChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const countryFlag = target.previousElementSibling as HTMLImageElement;
    const value = target.value;

    const selectedCountry = mockData.find((country) => country.name === value);
    if (selectedCountry) {
      const abbr = selectedCountry.value.toLowerCase();
      countryFlag.src = `${this.config.flagApiUrl}/${abbr}.png`;
    }
  }

  /**
   * Обрабатывает клик по кнопке переключения валют
   * Меняет местами выбранные валюты и их флаги, затем обновляет курс обмена
   * @returns {Promise<void>}
   */
  private async handleCurrencySwitchClick(): Promise<void> {
    const amountElement = this.state.elements.currencyAmount as HTMLInputElement;
    const amount = Number(amountElement.value);
    if (isNaN(amount) || amount <= 0) {
      this.utils.showToast('Incorrect amount');
      return;
    }
    const currencyFromSelect = this.state.elements.currencyFromSelect as HTMLSelectElement;
    const currencyToSelect = this.state.elements.currencyToSelect as HTMLSelectElement;
    const fromFlag = currencyFromSelect.previousElementSibling as HTMLImageElement;
    const toFlag = currencyToSelect.previousElementSibling as HTMLImageElement;

    [currencyFromSelect.value, currencyToSelect.value] = [
      currencyToSelect.value,
      currencyFromSelect.value,
    ];
    [fromFlag.src, toFlag.src] = [toFlag.src, fromFlag.src];

    await this.fetchExchangeRate(
      amount,
      currencyFromSelect.value,
      currencyToSelect.value,
    );
  }
}

/**
 * Создает экземпляр класса CurrencyConverter
 */
new CurrencyConverter();