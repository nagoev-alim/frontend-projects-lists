/**
 * Этот код представляет собой приложение для отображения погоды.
 * Оно позволяет пользователю искать погоду по городу и отображает
 * текущие погодные условия, а также прогноз на 5 дней.
 */

import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';

/**
 * Интерфейс для конфигурации приложения
 */
interface AppConfig {
  /** Селектор корневого элемента */
  root: string;
  /** Объект с селекторами для форм и деталей погоды */
  selectors: {
    weatherForm: string;
    weatherDetails: string;
  };
  /** URL API погоды */
  url: string;
}

/**
 * Интерфейс для состояния приложения
 */
interface AppState {
  /** Объект с элементами DOM */
  elements: {
    weatherForm: HTMLFormElement | null;
    weatherFormButton: HTMLButtonElement | null;
    weatherDetails: HTMLDivElement | null;
  };
}

/**
 * Интерфейс для утилит приложения
 */
interface AppUtils {
  /** Функция для рендеринга атрибутов данных */
  renderDataAttributes: (element: string) => string;
  /** Конфигурация для уведомлений */
  toastConfig: {
    className: string;
    duration: number;
    gravity: string;
    position: string;
  };
  /** Функция для отображения уведомления */
  showToast: (message: string) => void;
  /** Функция для обработки ошибок */
  handleError: (message: string, error?: unknown) => void;
}

/**
 * Интерфейс для данных о погоде
 */
interface WeatherData {
  current: {
    condition: { text: string; icon: string };
    is_day: number;
    temp_c: number;
  };
  forecast: {
    forecastday: Array<{
      date: string;
      day: { mintemp_c: number; maxtemp_c: number };
    }>;
  };
  location: { name: string; region: string; country: string };
}

/**
 * Конфигурация приложения
 */
const APP_CONFIG: AppConfig = {
  root: '#app',
  selectors: {
    weatherForm: '[data-weather-form]',
    weatherDetails: '[data-weather-details]',
  },
  url: 'https://api.weatherapi.com/v1/forecast.json?key=2260a9d16e4a45e1a44115831212511&q=',
};

/**
 * Состояние приложения
 */
const APP_STATE: AppState = {
  elements: {
    weatherForm: null,
    weatherFormButton: null,
    weatherDetails: null,
  },
};

/**
 * Утилиты приложения
 */
const APP_UTILS: AppUtils = {
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
      ...APP_UTILS.toastConfig,
    }).showToast();
  },
  handleError: (message: string, error: unknown = null): void => {
    APP_UTILS.showToast(message);
    if (error) console.error(message, error);
  },
};

/**
 * Создает HTML-структуру приложения
 */
function createAppHTML(): void {
  const { root, selectors: { weatherForm, weatherDetails } } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector<HTMLDivElement>(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='grid max-w-md w-full gap-4 rounded border bg-white p-3 shadow'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>Weather</h1>
      <header>
        <p class='text-center text-lg font-medium'>
          ${new Date().getDate()},
          ${new Date().toLocaleString('en-En', { month: 'short' })},
          ${new Date().getFullYear()}
        </p>
        <form class='grid gap-2' ${renderDataAttributes(weatherForm)}>
          <label class='grid gap-2 place-items-center text-center'>
            <span class='label'>Search for city</span>
            <input
              class='w-full rounded border-2 px-3 py-2 focus:border-blue-400 focus:outline-none'
              type='text'
              name='query'
              autocomplete='off'
              placeholder='Enter city name'
            />
          </label>
          <button class='border px-3 py-2 hover:bg-slate-50' type='submit'>Submit</button>
        </form>
      </header>
      <div class='grid gap-2 place-items-center' ${renderDataAttributes(weatherDetails)}></div>
    </div>    
  `;
}

/**
 * Инициализирует DOM-элементы
 */
function initDOMElements(): void {
  APP_STATE.elements = {
    weatherForm: document.querySelector<HTMLFormElement>(APP_CONFIG.selectors.weatherForm),
    weatherFormButton: document.querySelector<HTMLButtonElement>(`${APP_CONFIG.selectors.weatherForm} button[type="submit"]`),
    weatherDetails: document.querySelector<HTMLDivElement>(APP_CONFIG.selectors.weatherDetails),
  };
}

/**
 * Инициализирует приложение
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();

  (async () => {
    await fetchStoredCityWeather();
    APP_STATE.elements.weatherForm?.addEventListener('submit', handleWeatherFormSubmit);
  })();
}

/**
 * Загружает погоду для сохраненного города
 */
async function fetchStoredCityWeather(): Promise<void> {
  const storedCity = localStorage.getItem('city');
  if (storedCity) {
    await getWeather(storedCity, false);
  }
}

/**
 * Отображает UI с данными о погоде
 */
function renderUI(
  text: string,
  icon: string,
  is_day: number,
  temp_c: number,
  forecastday: WeatherData['forecast']['forecastday'],
  name: string,
  region: string,
  country: string,
): void {
  if (!APP_STATE.elements.weatherDetails) return;

  APP_STATE.elements.weatherDetails.innerHTML = `
    <h3 class='text-center text-lg font-bold'>
      <span>${name}</span> ${region}, ${country}
    </h3>
    <p>${text}</p>
    <img src='${icon}' alt='${text}'>
    <p class='text-xl font-medium'>${is_day ? 'Day' : 'Night'}</p>
    <p class='text-2xl font-bold'><span>${temp_c}</span><sup>&deg;</sup></p>
    <ul class='grid gap-2 sm:grid-cols-3 sm:gap-5'>
      ${forecastday
    .map(
      ({ date, day: { mintemp_c, maxtemp_c } }) => `
        <li class='grid place-items-center gap-1'>
          <p>${date}</p>
          <div>
            <p><span class='font-bold'>Min:</span> ${mintemp_c}<sup>&deg;</sup></p>
            <p><span class='font-bold'>Max:</span> ${maxtemp_c}<sup>&deg;</sup></p>
          </div>
        </li>`,
    )
    .join('')}
    </ul>
  `;
}

/**
 * Обрабатывает отправку формы поиска погоды
 */
async function handleWeatherFormSubmit(event: Event): Promise<void> {
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  const query = new FormData(form).get('query') as string;
  if (!query.trim()) {
    APP_UTILS.showToast('Please enter a city name');
    return;
  }
  await getWeather(query.trim(), true);
}

/**
 * Получает данные о погоде с API
 */
async function getWeather(query: string, saveToLocalStorage = false): Promise<void> {
  try {
    if (APP_STATE.elements.weatherFormButton) {
      APP_STATE.elements.weatherFormButton.textContent = 'Loading...';
    }
    const { data } = await axios.get<WeatherData>(`${APP_CONFIG.url}${query}&days=5&aqi=no&alerts=no`);
    const { current, forecast, location } = data;

    renderUI(
      current.condition.text,
      current.condition.icon,
      current.is_day,
      current.temp_c,
      forecast.forecastday,
      location.name,
      location.region,
      location.country,
    );

    if (saveToLocalStorage) {
      localStorage.setItem('city', query);
    }
  } catch (error) {
    APP_UTILS.handleError('Failed to load weather data', error);
  } finally {
    if (APP_STATE.elements.weatherFormButton) {
      APP_STATE.elements.weatherFormButton.textContent = 'Submit';
    }
    APP_STATE.elements.weatherForm?.reset();
  }
}

initApp();
