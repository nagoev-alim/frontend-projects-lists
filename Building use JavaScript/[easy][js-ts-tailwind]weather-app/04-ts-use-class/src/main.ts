/**
 * Этот код представляет собой приложение для отображения погоды.
 * Он использует API WeatherAPI для получения данных о погоде по запросу пользователя.
 * Приложение позволяет искать погоду по городу и отображает текущие условия и прогноз на 5 дней.
 */

import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';

/**
 * Интерфейс для конфигурации приложения
 */
interface Config {
  /** Корневой элемент приложения */
  root: string;
  /** Селекторы для DOM-элементов */
  selectors: {
    /** Селектор формы погоды */
    weatherForm: string;
    /** Селектор блока с деталями погоды */
    weatherDetails: string;
  };
  /** URL для API запросов */
  url: string;
}

/**
 * Интерфейс для состояния приложения
 */
interface State {
  /** DOM-элементы */
  elements: {
    /** Форма погоды */
    weatherForm: HTMLFormElement | null;
    /** Кнопка отправки формы */
    weatherFormButton: HTMLButtonElement | null;
    /** Блок с деталями погоды */
    weatherDetails: HTMLDivElement | null;
  };
}

/**
 * Интерфейс для утилит приложения
 */
interface Utils {
  /** Функция для рендеринга data-атрибутов */
  renderDataAttributes: (element: string) => string;
  /** Конфигурация для toast-уведомлений */
  toastConfig: {
    className: string;
    duration: number;
    gravity: string;
    position: string;
  };
  /** Функция для отображения toast-уведомления */
  showToast: (message: string) => void;
  /** Функция для обработки ошибок */
  handleError: (message: string, error?: unknown) => void;
}

/**
 * Интерфейс для данных о погоде
 */
interface WeatherData {
  /** Текущая погода */
  current: {
    condition: { text: string; icon: string };
    is_day: number;
    temp_c: number;
  };
  /** Прогноз погоды */
  forecast: {
    forecastday: Array<{
      date: string;
      day: { mintemp_c: number; maxtemp_c: number };
    }>;
  };
  /** Информация о местоположении */
  location: { name: string; region: string; country: string };
}

/**
 * Класс Weather для управления приложением погоды
 */
class Weather {
  /** Конфигурация приложения */
  private readonly config: Config;
  /** Состояние приложения */
  private state: State;
  /** Утилиты приложения */
  private readonly utils: Utils;

  /**
   * Конструктор класса Weather
   */
  constructor() {
    this.config = {
      root: '#app',
      selectors: {
        weatherForm: '[data-weather-form]',
        weatherDetails: '[data-weather-details]',
      },
      url: 'https://api.weatherapi.com/v1/forecast.json?key=2260a9d16e4a45e1a44115831212511&q=',
    };

    this.state = {
      elements: {
        weatherForm: null,
        weatherFormButton: null,
        weatherDetails: null,
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
      handleError: (message: string, error: unknown = null): void => {
        this.utils.showToast(message);
        if (error) console.error(message, error);
      },
    };

    this.init();
  }

  /**
   * Создает HTML-структуру приложения
   */
  private createAppHTML(): void {
    const { root, selectors: { weatherForm, weatherDetails } } = this.config;
    const { renderDataAttributes } = this.utils;
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
  private initDOMElements(): void {
    this.state.elements = {
      weatherForm: document.querySelector<HTMLFormElement>(this.config.selectors.weatherForm),
      weatherFormButton: document.querySelector<HTMLButtonElement>(`${this.config.selectors.weatherForm} button[type="submit"]`),
      weatherDetails: document.querySelector<HTMLDivElement>(this.config.selectors.weatherDetails),
    };
  }

  /**
   * Инициализирует приложение
   */
  private init(): void {
    this.createAppHTML();
    this.initDOMElements();

    (async () => {
      await this.fetchStoredCityWeather();
      this.state.elements.weatherForm?.addEventListener('submit', this.handleWeatherFormSubmit.bind(this));
    })();
  }

  /**
   * Загружает погоду для сохраненного города
   */
  private async fetchStoredCityWeather(): Promise<void> {
    const storedCity = localStorage.getItem('city');
    if (storedCity) {
      await this.getWeather(storedCity, false);
    }
  }

  /**
   * Отображает данные о погоде в UI
   */
  private renderUI(
    text: string,
    icon: string,
    is_day: number,
    temp_c: number,
    forecastday: WeatherData['forecast']['forecastday'],
    name: string,
    region: string,
    country: string,
  ): void {
    if (!this.state.elements.weatherDetails) return;

    this.state.elements.weatherDetails.innerHTML = `
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
   * Обрабатывает отправку формы погоды
   */
  private async handleWeatherFormSubmit(event: Event): Promise<void> {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const query = new FormData(form).get('query') as string;
    if (!query.trim()) {
      this.utils.showToast('Please enter a city name');
      return;
    }
    await this.getWeather(query.trim(), true);
  }

  /**
   * Получает данные о погоде и обновляет UI
   */
  private async getWeather(query: string, saveToLocalStorage = false): Promise<void> {
    try {
      if (this.state.elements.weatherFormButton) {
        this.state.elements.weatherFormButton.textContent = 'Loading...';
      }
      const { data } = await axios.get<WeatherData>(`${this.config.url}${query}&days=5&aqi=no&alerts=no`);
      const { current, forecast, location } = data;

      this.renderUI(
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
      this.utils.handleError('Failed to load weather data', error);
    } finally {
      if (this.state.elements.weatherFormButton) {
        this.state.elements.weatherFormButton.textContent = 'Submit';
      }
      this.state.elements.weatherForm?.reset();
    }
  }
}

new Weather();
