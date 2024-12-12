/**
 * Этот код реализует функциональность конвертера валют.
 * Он позволяет пользователю выбирать валюты, вводить сумму и получать актуальный курс обмена.
 * Код использует API для получения курсов валют и отображает результаты в пользовательском интерфейсе.
 */

import './style.css';
import mockData from './mock.js';
import { icons } from 'feather-icons';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';

/**
 * Объект конфигурации приложения
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента
 * @property {Object} selectors - Селекторы элементов формы
 * @property {string} flagApiUrl - URL API для получения флагов стран
 * @property {string} currencyApiUrl - URL API для конвертации валют
 * @property {string} apiKey - Ключ API для доступа к сервису конвертации
 * @property {Object} defaultCurrency - Валюты по умолчанию
 */
const APP_CONFIG = {
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
 * Объект состояния приложения
 * @typedef {Object} AppState
 * @property {Object} elements - Ссылки на DOM элементы
 */
const APP_STATE = {
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
 * Объект с утилитами приложения
 * @typedef {Object} AppUtils
 * @property {Object} toastConfig - Конфигурация для уведомлений
 * @property {Function} renderDataAttributes - Функция для рендеринга data-атрибутов
 * @property {Function} showToast - Функция для отображения уведомлений
 * @property {Function} handleError - Функция для обработки ошибок
 */
const APP_UTILS = {
  toastConfig: {
    className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
    duration: 3000,
    gravity: 'bottom',
    position: 'center',
  },
  renderDataAttributes: (element) => element.slice(1, -1),
  showToast: (message) => {
    Toastify({
      text: message,
      ...APP_UTILS.toastConfig,
    }).showToast();
  },
  handleError: (message, error = null) => {
    APP_UTILS.showToast(message);
    if (error) console.error(message, error);
  },
};

/**
 * Создает HTML структуру приложения
 */
function createAppHTML() {
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
    defaultCurrency: { from, to }
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
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
                ${mockData.map(({ name }) => `${name === from ? `<option value='${name}' selected>${name}</option>` : `<option value='${name}'>${name}</option>`}`).join("")}
              </select>
            </div>
          </label>
          <div class='flex cursor-pointer justify-center rounded border p-2 transition hover:bg-neutral-100 sm:mb-1.5 sm:border-none' ${renderDataAttributes(currencySwitch)}>${icons.repeat.toSvg()}</div>
          <label>
            <span class='text-sm font-medium'>To</span>
            <div class='relative'>
              <img class='absolute left-2 top-1/2 w-8 -translate-y-1/2 transform' src='https://flagcdn.com/48x36/ru.png' alt='flag'>
              <select class='w-full rounded border-2 bg-gray-50 px-3 py-2.5 pl-10 focus:border-blue-400 focus:outline-none' ${renderDataAttributes(currencyToSelect)} name='to'>
                ${mockData.map(({ name }) => `${name === to ? `<option value='${name}' selected>${name}</option>` : `<option value='${name}'>${name}</option>`}`).join("")}
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
 * Инициализирует DOM элементы в объекте состояния приложения
 */
function initDOMElements() {
  APP_STATE.elements = {
    currencyForm: document.querySelector(APP_CONFIG.selectors.currencyForm),
    currencyFromSelect: document.querySelector(APP_CONFIG.selectors.currencyFromSelect),
    currencyToSelect: document.querySelector(APP_CONFIG.selectors.currencyToSelect),
    currencySwitch: document.querySelector(APP_CONFIG.selectors.currencySwitch),
    exchangeRate: document.querySelector(APP_CONFIG.selectors.exchangeRate),
    currencyAmount: document.querySelector(APP_CONFIG.selectors.currencyAmount),
  };
}

/**
 * Инициализирует приложение
 */
function initApp() {
  createAppHTML();
  initDOMElements();

  (async () => {
    await updateExchangeRate();
    APP_STATE.elements.currencyForm.addEventListener('submit', handleCurrencyFormSubmit);
    [APP_STATE.elements.currencyFromSelect, APP_STATE.elements.currencyToSelect].forEach((select) =>
      select.addEventListener('change', handleCurrencySelectChange),
    );
    APP_STATE.elements.currencySwitch.addEventListener('click', handleCurrencySwitchClick);
  })();
}

/**
 * Обновляет курс обмена
 */
async function updateExchangeRate() {
  if (!APP_STATE.elements.currencyAmount) return;
  APP_STATE.elements.exchangeRate.classList.remove('hidden');
  APP_STATE.elements.exchangeRate.textContent = 'Getting the exchange rate...';
  const { value: amount } = APP_STATE.elements.currencyAmount;
  const { value: fromCurrency } = APP_STATE.elements.currencyFromSelect;
  const { value: toCurrency } = APP_STATE.elements.currencyToSelect;
  await fetchExchangeRate(amount, fromCurrency, toCurrency);
}

/**
 * Получает курс обмена от API
 * @param {number} amount - Сумма для конвертации
 * @param {string} fromCurrency - Исходная валюта
 * @param {string} toCurrency - Целевая валюта
 */
async function fetchExchangeRate(amount, fromCurrency, toCurrency) {
  try {
    const { data } = await axios.get(APP_CONFIG.currencyApiUrl, {
      params: { to: toCurrency, from: fromCurrency, amount },
      headers: { apikey: APP_CONFIG.apiKey },
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

    APP_STATE.elements.exchangeRate.innerHTML = `
      <table class='table-auto w-full'>
        <tr><td class='border p-2 bg-neutral-50 font-medium'>Date</td><td class='border p-2'>${formatDate(date)}</td></tr>
        <tr><td class='border p-2 bg-neutral-50 font-medium'>Rate</td><td class='border p-2'>1 ${fromCurrency} = ${formatCurrency(rate)} ${toCurrency}</td></tr>
        <tr><td class='border p-2 bg-neutral-50 font-medium'>Exchange</td><td class='border p-2'>${amount} ${fromCurrency} = ${formatCurrency(result)} ${toCurrency}</td></tr>
      </table>
    `;
  } catch (error) {
    APP_UTILS.handleError('Error when receiving exchange rate:', error);
  }
}

/**
 * Обработчик отправки формы конвертации
 * @param {Event} event - Событие отправки формы
 */
async function handleCurrencyFormSubmit(event) {
  event.preventDefault();
  const { amount, to, from } = Object.fromEntries(new FormData(event.target));
  const numberAmount = Number(amount);
  if (isNaN(numberAmount) || numberAmount <= 0 || !from || !to) {
    APP_UTILS.showToast('All fields are required');
    return false;
  }
  await fetchExchangeRate(numberAmount, from, to);
}

/**
 * Обработчик изменения выбора валюты
 * @param {Event} event - Событие изменения select
 */
function handleCurrencySelectChange({
  target: { previousElementSibling: countryFlag, value },
}) {
  const selectedCountry = mockData.find((country) => country.name === value);
  if (selectedCountry) {
    const abbr = selectedCountry.value.toLowerCase();
    countryFlag.src = `${APP_CONFIG.flagApiUrl}/${abbr}.png`;
  }
}

/**
 * Обработчик нажатия на кнопку смены валют
 */
async function handleCurrencySwitchClick() {
  const amount = Number(APP_STATE.elements.currencyAmount.value);
  if (isNaN(amount) || amount <= 0) {
    APP_UTILS.showToast('Incorrect amount');
    return false;
  }
  const { currencyFromSelect, currencyToSelect } = APP_STATE.elements;
  const fromFlag = currencyFromSelect.previousElementSibling;
  const toFlag = currencyToSelect.previousElementSibling;
  [currencyFromSelect.value, currencyToSelect.value] = [
    currencyToSelect.value,
    currencyFromSelect.value,
  ];
  [fromFlag.src, toFlag.src] = [toFlag.src, fromFlag.src];
  await fetchExchangeRate(
    amount,
    currencyFromSelect.value,
    currencyToSelect.value,
  );
}

initApp();