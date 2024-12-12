/**
 * Этот код представляет собой приложение для генерации цитат. 
 * Оно позволяет пользователям выбирать источник цитат из списка API, 
 * запрашивать цитату и отображать ее на странице. 
 * Также включает функциональность копирования цитаты в буфер обмена.
 */

import './style.css';
import apiEndpoints from './mock';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import feather from 'feather-icons';
import axios, { AxiosResponse } from 'axios';

/**
 * Интерфейс для конфигурации приложения
 */
interface AppConfig {
  /** Корневой элемент приложения */
  root: string;
  /** Селекторы для различных элементов DOM */
  selectors: {
    form: string;
    submit: string;
    result: string;
  };
}

/**
 * Интерфейс для состояния приложения
 */
interface AppState {
  /** Элементы DOM */
  elements: {
    form: HTMLFormElement | null;
    submit: HTMLButtonElement | null;
    result: HTMLDivElement | null;
  };
}

/**
 * Интерфейс для утилит приложения
 */
interface AppUtils {
  /** Добавляет ведущий ноль к числу */
  addLeadingZero: (num: number) => string;
  /** Рендерит атрибуты данных */
  renderDataAttributes: (element: string) => string;
  /** Конфигурация для toast-уведомлений */
  toastConfig: {
    className: string;
    duration: number;
    gravity: string;
    position: string;
  };
  /** Показывает toast-уведомление */
  showToast: (message: string) => void;
  /** Обрабатывает ошибки */
  handleError: (message: string, error?: any) => void;
}

/**
 * Конфигурация приложения
 */
const APP_CONFIG: AppConfig = {
  root: '#app',
  selectors: {
    form: '[data-quote-form]',
    submit: '[data-quote-submit]',
    result: '[data-quote-result]',
  },
};

/**
 * Состояние приложения
 */
const APP_STATE: AppState = {
  elements: {
    form: null,
    submit: null,
    result: null,
  },
};

/**
 * Утилиты приложения
 */
const APP_UTILS: AppUtils = {
  addLeadingZero: (num: number) => num.toString().padStart(2, '0'),
  renderDataAttributes: (element: string) => element.slice(1, -1),
  toastConfig: {
    className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
    duration: 3000,
    gravity: 'bottom',
    position: 'center',
  },
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
 * Создает HTML-структуру приложения
 */
function createAppHTML(): void {
  const {
    root,
    selectors: { form, submit, result },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector<HTMLElement>(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='grid w-full max-w-md gap-4 rounded border bg-white p-3 shadow'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>Quote Generators</h1>
      <form class='grid gap-3' ${renderDataAttributes(form)}>
        <select class='w-full cursor-pointer border-2 bg-slate-50 px-3 py-2 focus:border-blue-400 focus:outline-none' name='source'>
          <option value=''>Select Source</option>
          ${apiEndpoints.map(({ name, value }) => `<option value='${value}'>${name}</option>`).join('')}
        </select>
        <button class='border px-3 py-2' type='submit' ${renderDataAttributes(submit)}>Submit</button>
      </form>
      <div class='hidden grid rounded border bg-gray-50 p-2' ${renderDataAttributes(result)}></div>
    </div>
  `;
}

/**
 * Инициализирует элементы DOM
 */
function initDOMElements(): void {
  APP_STATE.elements = {
    form: document.querySelector<HTMLFormElement>(APP_CONFIG.selectors.form),
    submit: document.querySelector<HTMLButtonElement>(APP_CONFIG.selectors.submit),
    result: document.querySelector<HTMLDivElement>(APP_CONFIG.selectors.result),
  };
}

/**
 * Инициализирует приложение
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();

  APP_STATE.elements.form?.addEventListener('submit', handleFormSubmit);
  APP_STATE.elements.result?.addEventListener('click', handleResultClick);
}

/**
 * Получает цитату из выбранного источника
 * @param source URL источника цитат
 */
async function getQuote(source: string): Promise<void> {
  try {
    if (APP_STATE.elements.submit) {
      APP_STATE.elements.submit.textContent = 'Loading...';
    }
    const { data } = await fetchQuoteData(source);
    processQuoteData(data);
  } catch (error) {
    APP_UTILS.handleError('Failed to fetch quote', error);
    if (APP_STATE.elements.result) {
      APP_STATE.elements.result.innerHTML = '';
      APP_STATE.elements.result.classList.add('hidden');
    }
  } finally {
    if (APP_STATE.elements.submit) {
      APP_STATE.elements.submit.textContent = 'Submit';
    }
    APP_STATE.elements.form?.reset();
  }
}

/**
 * Выполняет запрос к API для получения цитаты
 * @param source URL источника цитат
 * @returns Promise с ответом от API
 */
async function fetchQuoteData(source: string): Promise<AxiosResponse> {
  if (source === 'https://api.api-ninjas.com/v1/quotes') {
    return axios.get(source, {
      headers: { 'X-Api-Key': 'akxWnVBvUmGAjheE9llulw==TVZ6WIhfWDdCsx9o' },
    });
  }
  return axios.get(source);
}

/**
 * Обрабатывает полученные данные о цитате
 * @param data Данные о цитате
 */
function processQuoteData(data: any): void {
  if (Array.isArray(data)) {
    handleArrayData(data);
  } else if ('value' in data) {
    renderUI(data.value, false);
  } else if ('author' in data && 'content' in data) {
    renderUI(data.content, data.author ?? false);
  } else if ('author' in data && 'quote' in data) {
    renderUI(data.quote, data.author ?? false);
  } else if ('quoteText' in data && 'quoteAuthor' in data) {
    renderUI(data.quoteText, data.quoteAuthor ?? false);
  } else if ('punchline' in data && 'setup' in data) {
    renderUI(data.setup, data.punchline ?? false);
  } else if ('quote' in data && typeof data.quote === 'object') {
    handleQuoteObject(data.quote);
  } else if ('insult' in data) {
    renderUI(data.insult, false);
  } else if ('affirmation' in data) {
    renderUI(data.affirmation, false);
  }
}

/**
 * Обрабатывает массив данных о цитатах
 * @param data Массив данных о цитатах
 */
function handleArrayData(data: any[]): void {
  if (data.length === 1) {
    renderUI(data[0], false);
  } else {
    const { text, author, yoast_head_json } = data[Math.floor(Math.random() * data.length)];
    if (yoast_head_json) {
      renderUI(yoast_head_json.og_description, yoast_head_json.og_title ?? false);
    } else {
      renderUI(text, author ?? false);
    }
  }
}

/**
 * Обрабатывает объект с цитатой
 * @param quote Объект с цитатой
 */
function handleQuoteObject(quote: { author?: string; body?: string }): void {
  if ('author' in quote && 'body' in quote) {
    renderUI(quote.body!, quote.author ?? false);
  }
}

/**
 * Обрабатывает отправку формы
 * @param event Событие отправки формы
 */
async function handleFormSubmit(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  const formData = new FormData(event.target as HTMLFormElement);
  const source = formData.get('source') as string;
  if (!source) {
    APP_UTILS.showToast('Please select source');
    return;
  }
  await getQuote(source);
}

/**
 * Обрабатывает клик по результату (для копирования цитаты)
 * @param event Событие клика
 */
async function handleResultClick(event: MouseEvent): Promise<void> {
  const target = event.target as HTMLElement;
  if (!target.matches('button')) return;

  try {
    const quoteText = APP_STATE.elements.result?.querySelector('p')?.textContent;
    if (quoteText) {
      await navigator.clipboard.writeText(quoteText);
      APP_UTILS.showToast('✅ Quote copied to clipboard');
    }
  } catch (error) {
    APP_UTILS.handleError('❌ Failed to copy quote', error);
  }
}

/**
 * Отображает UI с цитатой
 * @param text Текст цитаты
 * @param hasAuthor Автор цитаты или false, если автор отсутствует
 */
function renderUI(text: string, hasAuthor: string | boolean): void {
  if (APP_STATE.elements.result) {
    APP_STATE.elements.result.classList.remove('hidden');
    APP_STATE.elements.result.innerHTML = `
     <button class='ml-auto'>
        <span class='pointer-events-none'>
          ${feather.icons.clipboard.toSvg()}
        </span>
     </button>
     <p>"${text}"</p>
     ${hasAuthor ? `<p>${hasAuthor}</p>` : ''}`;
  }
}

initApp();
