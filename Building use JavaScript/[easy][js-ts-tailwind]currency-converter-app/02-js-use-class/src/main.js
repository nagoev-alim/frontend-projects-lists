/**
 * Этот код представляет собой реализацию конвертера валют.
 * Он позволяет пользователям выбирать валюты, вводить сумму и получать актуальный курс обмена.
 * Код использует API для получения курсов валют и отображает результаты в удобном формате.
 */

import './style.css';
import mockData from './mock';
import { icons } from 'feather-icons';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';

/**
 * Класс CurrencyConverter представляет конвертер валют
 */
class CurrencyConverter {
  /**
   * Создает экземпляр CurrencyConverter
   */
  constructor() {
    /**
     * @type {Object} Конфигурация конвертера
     */
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

    /**
     * @type {Object} Состояние конвертера
     */
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

    /**
     * @type {Object} Утилиты конвертера
     */
    this.utils = {
      toastConfig: {
        className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
        duration: 3000,
        gravity: 'bottom',
        position: 'center',
      },
      /**
       * Рендерит data-атрибуты
       * @param {string} element - Элемент для рендеринга
       * @returns {string} Отрендеренный элемент
       */
      renderDataAttributes: (element) => element.slice(1, -1),
      /**
       * Показывает уведомление
       * @param {string} message - Сообщение для отображения
       */
      showToast: (message) => {
        Toastify({
          text: message,
          ...this.utils.toastConfig,
        }).showToast();
      },
      /**
       * Обрабатывает ошибки
       * @param {string} message - Сообщение об ошибке
       * @param {Error} [error] - Объект ошибки
       */
      handleError: (message, error = null) => {
        this.utils.showToast(message);
        if (error) console.error(message, error);
      },
    };

    this.init();
  }

  /**
   * Создает HTML структуру приложения
   */
  createAppHTML() {
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
   * Инициализирует DOM элементы
   */
  initDOMElements() {
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
   * Инициализирует конвертер
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();

    (async () => {
      await this.updateExchangeRate();
      this.state.elements.currencyForm.addEventListener('submit', this.handleCurrencyFormSubmit.bind(this));
      [this.state.elements.currencyFromSelect, this.state.elements.currencyToSelect].forEach((select) =>
        select.addEventListener('change', this.handleCurrencySelectChange.bind(this)),
      );
      this.state.elements.currencySwitch.addEventListener('click', this.handleCurrencySwitchClick.bind(this));
    })();
  }

  /**
   * Обновляет курс обмена
   */
  async updateExchangeRate() {
    if (!this.state.elements.currencyAmount) return;
    this.state.elements.exchangeRate.classList.remove('hidden');
    this.state.elements.exchangeRate.textContent = 'Getting the exchange rate...';
    const { value: amount } = this.state.elements.currencyAmount;
    const { value: fromCurrency } = this.state.elements.currencyFromSelect;
    const { value: toCurrency } = this.state.elements.currencyToSelect;
    await this.fetchExchangeRate(amount, fromCurrency, toCurrency);
  }

  /**
   * Получает курс обмена с API
   * @param {number} amount - Сумма для конвертации
   * @param {string} fromCurrency - Исходная валюта
   * @param {string} toCurrency - Целевая валюта
   */
  async fetchExchangeRate(amount, fromCurrency, toCurrency) {
    try {
      const { data } = await axios.get(this.config.currencyApiUrl, {
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
      const formatCurrency = (value) => value.toFixed(2);
      const formatDate = (dateString) => new Date(dateString).toLocaleString();

      this.state.elements.exchangeRate.innerHTML = `
      <table class='table-auto w-full'>
        <tr><td class='border p-2 bg-neutral-50 font-medium'>Date</td><td class='border p-2'>${formatDate(date)}</td></tr>
        <tr><td class='border p-2 bg-neutral-50 font-medium'>Rate</td><td class='border p-2'>1 ${fromCurrency} = ${formatCurrency(rate)} ${toCurrency}</td></tr>
        <tr><td class='border p-2 bg-neutral-50 font-medium'>Exchange</td><td class='border p-2'>${amount} ${fromCurrency} = ${formatCurrency(result)} ${toCurrency}</td></tr>
      </table>
    `;
    } catch (error) {
      this.utils.handleError('Error when receiving exchange rate:', error);
    }
  }

  /**
   * Обрабатывает отправку формы конвертера
   * @param {Event} event - Событие отправки формы
   */
  async handleCurrencyFormSubmit(event) {
    event.preventDefault();
    const { amount, to, from } = Object.fromEntries(new FormData(event.target));
    const numberAmount = Number(amount);
    if (isNaN(numberAmount) || numberAmount <= 0 || !from || !to) {
      this.utils.showToast('All fields are required');
      return false;
    }
    await this.fetchExchangeRate(numberAmount, from, to);
  }

  /**
   * Обрабатывает изменение выбора валюты
   * @param {Event} event - Событие изменения
   */
  handleCurrencySelectChange({
    target: { previousElementSibling: countryFlag, value },
  }) {
    const selectedCountry = mockData.find((country) => country.name === value);
    if (selectedCountry) {
      const abbr = selectedCountry.value.toLowerCase();
      countryFlag.src = `${this.config.flagApiUrl}/${abbr}.png`;
    }
  }

  /**
   * Обрабатывает клик по кнопке переключения валют
   */
  async handleCurrencySwitchClick() {
    const amount = Number(this.state.elements.currencyAmount.value);
    if (isNaN(amount) || amount <= 0) {
      this.utils.showToast('Incorrect amount');
      return false;
    }
    const { currencyFromSelect, currencyToSelect } = this.state.elements;
    const fromFlag = currencyFromSelect.previousElementSibling;
    const toFlag = currencyToSelect.previousElementSibling;
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

new CurrencyConverter();