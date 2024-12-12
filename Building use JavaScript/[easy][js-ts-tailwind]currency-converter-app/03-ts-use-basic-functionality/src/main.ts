/**
 * Этот код представляет собой приложение для конвертации валют.
 * Он позволяет пользователям выбирать валюты, вводить сумму и получать текущий обменный курс.
 * Приложение использует API для получения актуальных данных о курсах валют и отображает результаты в удобном формате.
 */

import './style.css';
import currencies from './mock';
import { icons } from 'feather-icons';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';

/**
 * Интерфейс для конфигурации приложения
 */
interface AppConfig {
  /** Корневой элемент приложения */
  root: string;
  /** Селекторы для различных элементов формы */
  selectors: {
    currencyForm: string;
    currencyFromSelect: string;
    currencyToSelect: string;
    currencySwitch: string;
    exchangeRate: string;
    currencyAmount: string;
  };
  /** URL API для получения флагов стран */
  flagApiUrl: string;
  /** URL API для конвертации валют */
  currencyApiUrl: string;
  /** Ключ API для доступа к сервису конвертации валют */
  apiKey: string;
  /** Валюты по умолчанию */
  defaultCurrency: {
    from: string;
    to: string;
  };
}

/**
 * Конфигурация приложения
 */
const APP_CONFIG: AppConfig = {
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
 * Интерфейс для состояния приложения
 */
interface AppState {
  /** Элементы DOM */
  elements: {
    currencyForm: HTMLFormElement | null;
    currencyFromSelect: HTMLSelectElement | null;
    currencyToSelect: HTMLSelectElement | null;
    currencySwitch: HTMLElement | null;
    exchangeRate: HTMLElement | null;
    currencyAmount: HTMLInputElement | null;
  };
}

/**
 * Состояние приложения
 */
const APP_STATE: AppState = {
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
 * Интерфейс для утилит приложения
 */
interface AppUtils {
  /** Конфигурация для уведомлений */
  toastConfig: {
    className: string;
    duration: number;
    gravity: string;
    position: string;
  };
  /** Функция для рендеринга data-атрибутов */
  renderDataAttributes: (element: string) => string;
  /** Функция для отображения уведомлений */
  showToast: (message: string) => void;
  /** Функция для обработки ошибок */
  handleError: (message: string, error?: any) => void;
}

/**
 * Утилиты приложения
 */
const APP_UTILS: AppUtils = {
  toastConfig: {
    className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
    duration: 3000,
    gravity: 'bottom',
    position: 'center',
  },
  renderDataAttributes: (element: string) => element.slice(1, -1),
  showToast: (message: string) => {
    // @ts-ignore
    Toastify({
      text: message,
      ...APP_UTILS.toastConfig,
    }).showToast();
  },
  handleError: (message: string, error: any = null) => {
    APP_UTILS.showToast(message);
    if (error) console.error(message, error);
  },
};

/**
 * Создает HTML-разметку приложения
 */
function createAppHTML(): void {
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
                ${currencies.map(({ name }) => `${name === from ? `<option value='${name}' selected>${name}</option>` : `<option value='${name}'>${name}</option>`}`).join('')}
              </select>
            </div>
          </label>
          <div class='flex cursor-pointer justify-center rounded border p-2 transition hover:bg-neutral-100 sm:mb-1.5 sm:border-none' ${renderDataAttributes(currencySwitch)}>${icons.repeat.toSvg()}</div>
          <label>
            <span class='text-sm font-medium'>To</span>
            <div class='relative'>
              <img class='absolute left-2 top-1/2 w-8 -translate-y-1/2 transform' src='https://flagcdn.com/48x36/ru.png' alt='flag'>
              <select class='w-full rounded border-2 bg-gray-50 px-3 py-2.5 pl-10 focus:border-blue-400 focus:outline-none' ${renderDataAttributes(currencyToSelect)} name='to'>
                ${currencies.map(({ name }) => `${name === to ? `<option value='${name}' selected>${name}</option>` : `<option value='${name}'>${name}</option>`}`).join('')}
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
 * Инициализирует элементы DOM
 */
function initDOMElements(): void {
  APP_STATE.elements = {
    currencyForm: document.querySelector<HTMLFormElement>(APP_CONFIG.selectors.currencyForm),
    currencyFromSelect: document.querySelector<HTMLSelectElement>(APP_CONFIG.selectors.currencyFromSelect),
    currencyToSelect: document.querySelector<HTMLSelectElement>(APP_CONFIG.selectors.currencyToSelect),
    currencySwitch: document.querySelector<HTMLElement>(APP_CONFIG.selectors.currencySwitch),
    exchangeRate: document.querySelector<HTMLElement>(APP_CONFIG.selectors.exchangeRate),
    currencyAmount: document.querySelector<HTMLInputElement>(APP_CONFIG.selectors.currencyAmount),
  };
}

/**
 * Инициализирует приложение
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();

  (async () => {
    await updateExchangeRate();
    APP_STATE.elements.currencyForm?.addEventListener('submit', handleCurrencyFormSubmit);
    [APP_STATE.elements.currencyFromSelect, APP_STATE.elements.currencyToSelect].forEach((select) =>
      select?.addEventListener('change', handleCurrencySelectChange),
    );
    APP_STATE.elements.currencySwitch?.addEventListener('click', handleCurrencySwitchClick);
  })();
}

/**
 * Обновляет отображение обменного курса
 */
async function updateExchangeRate(): Promise<void> {
  if (!APP_STATE.elements.currencyAmount) return;
  APP_STATE.elements.exchangeRate?.classList.remove('hidden');
  if (APP_STATE.elements.exchangeRate) {
    APP_STATE.elements.exchangeRate.textContent = 'Getting the exchange rate...';
  }
  const amount = APP_STATE.elements.currencyAmount.value;
  const fromCurrency = APP_STATE.elements.currencyFromSelect?.value;
  const toCurrency = APP_STATE.elements.currencyToSelect?.value;
  if (fromCurrency && toCurrency) {
    await fetchExchangeRate(Number(amount), fromCurrency, toCurrency);
  }
}

/**
 * Получает обменный курс с API
 * @param amount - Сумма для конвертации
 * @param fromCurrency - Исходная валюта
 * @param toCurrency - Целевая валюта
 */
async function fetchExchangeRate(amount: number, fromCurrency: string, toCurrency: string): Promise<void> {
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
    const formatCurrency = (value: number): string => value.toFixed(2);
    const formatDate = (dateString: string): string => new Date(dateString).toLocaleString();

    if (APP_STATE.elements.exchangeRate) {
      APP_STATE.elements.exchangeRate.innerHTML = `
        <table class='table-auto w-full'>
          <tr><td class='border p-2 bg-neutral-50 font-medium'>Date</td><td class='border p-2'>${formatDate(date)}</td></tr>
          <tr><td class='border p-2 bg-neutral-50 font-medium'>Rate</td><td class='border p-2'>1 ${fromCurrency} = ${formatCurrency(rate)} ${toCurrency}</td></tr>
          <tr><td class='border p-2 bg-neutral-50 font-medium'>Exchange</td><td class='border p-2'>${amount} ${fromCurrency} = ${formatCurrency(result)} ${toCurrency}</td></tr>
        </table>
      `;
    }
  } catch (error) {
    APP_UTILS.handleError('Error when receiving exchange rate:', error);
  }
}


/**
 * Обрабатывает отправку формы конвертации валют
 * @param {Event} event - Событие отправки формы
 * @returns {Promise<void>}
 */
async function handleCurrencyFormSubmit(event: Event): Promise<void> {
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  const formData = new FormData(form);
  const amount = formData.get('amount');
  const to = formData.get('to');
  const from = formData.get('from');
  const numberAmount = Number(amount);
  if (isNaN(numberAmount) || numberAmount <= 0 || !from || !to) {
    APP_UTILS.showToast('All fields are required');
    return;
  }
  await fetchExchangeRate(numberAmount, from.toString(), to.toString());
}

/**
 * Обрабатывает изменение выбора валюты
 * @param {Event} event - Событие изменения выбора
 */
function handleCurrencySelectChange(event: Event): void {
  const target = event.target as HTMLSelectElement;
  const countryFlag = target.previousElementSibling as HTMLImageElement;
  const value = target.value;
  const selectedCountry = currencies.find((country) => country.name === value);
  if (selectedCountry) {
    const abbr = selectedCountry.value.toLowerCase();
    countryFlag.src = `${APP_CONFIG.flagApiUrl}/${abbr}.png`;
  }
}

/**
 * Обрабатывает нажатие на кнопку переключения валют
 * @returns {Promise<void>}
 */
async function handleCurrencySwitchClick(): Promise<void> {
  const amount = Number(APP_STATE.elements.currencyAmount?.value);
  if (isNaN(amount) || amount <= 0) {
    APP_UTILS.showToast('Incorrect amount');
    return;
  }
  const { currencyFromSelect, currencyToSelect } = APP_STATE.elements;
  if (!currencyFromSelect || !currencyToSelect) return;

  const fromFlag = currencyFromSelect.previousElementSibling as HTMLImageElement;
  const toFlag = currencyToSelect.previousElementSibling as HTMLImageElement;
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

/**
 * Инициализирует приложение
 */
initApp();