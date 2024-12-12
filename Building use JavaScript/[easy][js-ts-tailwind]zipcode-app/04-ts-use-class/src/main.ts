/**
 * Этот код представляет собой приложение для поиска информации о местоположении по почтовому индексу.
 * Он использует API Zippopotam для получения данных о местоположении и отображает результаты на карте
 * с помощью библиотеки Leaflet. Приложение также включает в себя функциональность для отображения
 * уведомлений с использованием библиотеки Toastify.
 */

import './style.css';
import countryCodes from './mock';
import icon from '/pin.svg';
import Toastify from 'toastify-js';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'toastify-js/src/toastify.css';
import axios from 'axios';

/**
 * Интерфейс для конфигурации приложения
 */
interface Config {
  /** Корневой элемент для рендеринга приложения */
  root: string;
  /** Селекторы для различных элементов DOM */
  selectors: {
    form: string;
    submit: string;
    result: string;
    info: string;
    map: string;
  };
  /** URL API для получения данных о местоположении */
  url: string;
}

/**
 * Интерфейс для состояния приложения
 */
interface State {
  /** Ссылки на элементы DOM */
  elements: {
    form: HTMLFormElement | null;
    submit: HTMLButtonElement | null;
    result: HTMLDivElement | null;
    info: HTMLDivElement | null;
    map: HTMLDivElement | null;
  };
  /** Объект карты Leaflet */
  map: L.Map | null;
  /** Иконка маркера для карты */
  marker: L.Icon;
  /** URL для тайлов карты */
  tileLayerUrl: string;
  /** Опции для слоя тайлов */
  tileLayerOptions: L.TileLayerOptions;
}

/**
 * Интерфейс для вспомогательных функций
 */
interface Utils {
  /** Функция для рендеринга атрибутов данных */
  renderDataAttributes: (element: string) => string;
  /** Конфигурация для уведомлений Toastify */
  toastConfig: Toastify.Options;
  /** Функция для отображения уведомления */
  showToast: (message: string) => void;
  /** Функция для обработки ошибок */
  handleError: (message: string, error?: any) => void;
}

/**
 * Класс ZipCode представляет основную функциональность приложения
 */
class ZipCode {
  /** Конфигурация приложения */
  private readonly config: Config;
  /** Состояние приложения */
  private state: State;
  /** Вспомогательные функции */
  private readonly utils: Utils;

  /**
   * Конструктор класса ZipCode
   */
  constructor() {
    this.config = {
      root: '#app',
      selectors: {
        form: '[data-zipcode-form]',
        submit: '[data-zipcode-submit]',
        result: '[data-zipcode-result]',
        info: '[data-zipcode-info]',
        map: '[data-zipcode-map]',
      },
      url: 'https://api.zippopotam.us/',
    };

    this.state = {
      elements: {
        form: null,
        submit: null,
        result: null,
        info: null,
        map: null,
      },
      map: null,
      marker: L.icon({
        iconUrl: icon,
        iconSize: [30, 40],
      }),
      tileLayerUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      tileLayerOptions: { maxZoom: 19 },
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
        Toastify({
          text: message,
          ...this.utils.toastConfig,
        }).showToast();
      },
      handleError: (message: string, error: any = null): void => {
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
      selectors: { form, submit, result, info, map },
    } = this.config;
    const { renderDataAttributes } = this.utils;
    const rootElement = document.querySelector(root);

    if (!rootElement) return;

    rootElement.innerHTML = `
      <div class='grid max-w-md w-full gap-4 rounded border bg-white p-3 shadow'>
        <h1 class='text-center text-2xl font-bold md:text-4xl'>ZipCode App</h1>
        <form class='grid gap-3' ${renderDataAttributes(form)}>
          <select class='w-full border-2 px-3 py-2 focus:border-blue-400 focus:outline-none' name='source'>
            <option value>Select Country</option>
            ${countryCodes.map(({ name, value }) => `<option value='${value}'>${name}</option>`).join('')}
          </select>
          <input class='w-full border-2 px-3 py-2 focus:border-blue-400 focus:outline-none' type='text' name='zip' placeholder='Zip Code'>
          <button class='border-2 px-3 py-2 hover:bg-slate-50' type='submit' ${renderDataAttributes(submit)}>Submit</button>
        </form>
        <div class='hidden' ${renderDataAttributes(result)}>
          <div class='mb-3 grid gap-3' ${renderDataAttributes(info)}></div>
          <div class='min-h-[300px]' ${renderDataAttributes(map)}></div>
        </div>
      </div>
    `;
  }

  /**
   * Инициализирует элементы DOM
   */
  private initDOMElements(): void {
    this.state.elements = {
      form: document.querySelector<HTMLFormElement>(this.config.selectors.form),
      submit: document.querySelector<HTMLButtonElement>(this.config.selectors.submit),
      result: document.querySelector<HTMLDivElement>(this.config.selectors.result),
      info: document.querySelector<HTMLDivElement>(this.config.selectors.info),
      map: document.querySelector<HTMLDivElement>(this.config.selectors.map),
    };
  }

  /**
   * Инициализирует приложение
   */
  private init(): void {
    this.createAppHTML();
    this.initDOMElements();
    this.initMap();
    this.mapConfiguration();
    this.state.elements.form?.addEventListener('submit', this.handleFormSubmit.bind(this));
  }

  /**
   * Инициализирует карту
   */
  private initMap(): void {
    if (this.state.elements.map) {
      this.state.map = L.map(this.state.elements.map, {
        center: [51.505, -0.09],
        zoom: 13,
      });

      this.mapUpdate(51.505, -0.09);
    }
  }

  /**
   * Настраивает карту
   */
  private mapConfiguration(): void {
    if (this.state.map) {
      L.tileLayer(this.state.tileLayerUrl, this.state.tileLayerOptions).addTo(this.state.map);
      L.marker([51.505, -0.09], { icon: this.state.marker }).addTo(this.state.map);
    }
  }

  /**
   * Обрабатывает отправку формы
   * @param event - Событие отправки формы
   */
  private async handleFormSubmit(event: Event): Promise<void> {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const { source, zip } = Object.fromEntries(formData) as { source: string; zip: string };
    if (!(source && zip)) {
      this.utils.showToast('Please fill in all fields');
      return;
    }
    await this.fetchData(source, zip);
  }

  /**
   * Получает данные о местоположении по API
   * @param source - Код страны
   * @param zip - Почтовый индекс
   */
  private async fetchData(source: string, zip: string): Promise<void> {
    try {
      const {
        data: {
          places: [{ latitude, longitude, state, 'place name': placeName }],
        },
      } = await axios.get<{ places: [{ latitude: string; longitude: string; state: string; 'place name': string }] }>(`${this.config.url}${source}/${zip}`);
      this.renderData(latitude, longitude, state, placeName);
    } catch (error) {
      this.utils.handleError('An error occurred while fetching data', error);
    }
  }

  /**
   * Создает строку с информацией
   * @param label - Метка
   * @param value - Значение
   * @returns HTML-строка с информацией
   */
  private createInfoRow(label: string, value: string): string {
    return `
      <p class='grid grid-cols-2'>
        <span class='border font-medium p-2'>${label}:</span>
        <span class='border p-2'>${value}</span>
      </p>
    `;
  }

  /**
   * Отображает данные о местоположении
   * @param latitude - Широта
   * @param longitude - Долгота
   * @param state - Штат/область
   * @param placeName - Название места
   */
  private renderData(latitude: string, longitude: string, state: string, placeName: string): void {
    this.state.elements.result?.classList.remove('hidden');
    if (this.state.elements.info) {
      this.state.elements.info.innerHTML = `
        <h5 class='font-bold text-center'>About Place</h5>
        ${this.createInfoRow('Latitude', latitude)}
        ${this.createInfoRow('Longitude', longitude)}
        ${this.createInfoRow('State', state)}
        ${this.createInfoRow('Place Name', placeName)}
      `;
    }
    setTimeout(() => {
      this.mapUpdate(parseFloat(latitude), parseFloat(longitude));
    }, 100);
  }

  /**
   * Обновляет карту с новыми координатами
   * @param latitude - Широта
   * @param longitude - Долгота
   */
  private mapUpdate(latitude: number, longitude: number): void {
    const newPosition: L.LatLngExpression = [latitude, longitude];
    const zoomLevel = 8;

    if (this.state.map) {
      this.state.map.setView(newPosition, zoomLevel);
      this.state.map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          this.state.map?.removeLayer(layer);
        }
      });
      L.marker(newPosition, { icon: this.state.marker }).addTo(this.state.map);
      this.state.map.invalidateSize();
    }
  }
}

new ZipCode();
