/**
 * Этот код представляет собой приложение для поиска информации о местоположении по почтовому индексу.
 * Он использует API Zippopotam для получения данных о местоположении и отображает результаты на карте
 * с помощью библиотеки Leaflet. Приложение также включает в себя обработку ошибок и уведомления пользователя.
 */

import './style.css';
import countryCodes from './mock';
import icon from '/pin.svg';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';

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
    info: string;
    map: string;
  };
  /** URL API для получения данных о местоположении */
  url: string;
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
    info: HTMLDivElement | null;
    map: HTMLDivElement | null;
  };
  /** Объект карты Leaflet */
  map: L.Map | null;
  /** Иконка маркера на карте */
  marker: L.Icon;
  /** URL для тайлов карты */
  tileLayerUrl: string;
  /** Опции для тайлового слоя */
  tileLayerOptions: L.TileLayerOptions;
}

/**
 * Интерфейс для утилит приложения
 */
interface AppUtils {
  /** Функция для рендеринга data-атрибутов */
  renderDataAttributes: (element: string) => string;
  /** Конфигурация для уведомлений */
  toastConfig: Toastify.Options;
  /** Функция для отображения уведомления */
  showToast: (message: string) => void;
  /** Функция для обработки ошибок */
  handleError: (message: string, error?: any) => void;
}

/**
 * Конфигурация приложения
 */
const APP_CONFIG: AppConfig = {
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

/**
 * Состояние приложения
 */
const APP_STATE: AppState = {
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
    Toastify({
      text: message,
      ...APP_UTILS.toastConfig,
    }).showToast();
  },
  handleError: (message: string, error: any = null): void => {
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
    selectors: { form, submit, result, info, map },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
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
 * Инициализирует DOM-элементы приложения
 */
function initDOMElements(): void {
  APP_STATE.elements = {
    form: document.querySelector<HTMLFormElement>(APP_CONFIG.selectors.form),
    submit: document.querySelector<HTMLButtonElement>(APP_CONFIG.selectors.submit),
    result: document.querySelector<HTMLDivElement>(APP_CONFIG.selectors.result),
    info: document.querySelector<HTMLDivElement>(APP_CONFIG.selectors.info),
    map: document.querySelector<HTMLDivElement>(APP_CONFIG.selectors.map),
  };
}

/**
 * Инициализирует приложение
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();
  initMap();

  mapConfiguration();
  APP_STATE.elements.form?.addEventListener('submit', handleFormSubmit);
}

/**
 * Инициализирует карту
 */
function initMap(): void {
  if (APP_STATE.elements.map) {
    APP_STATE.map = L.map(APP_STATE.elements.map, {
      center: [51.505, -0.09],
      zoom: 13,
    });

    mapUpdate(51.505, -0.09);
  }
}

/**
 * Настраивает карту
 */
function mapConfiguration(): void {
  if (APP_STATE.map) {
    L.tileLayer(APP_STATE.tileLayerUrl, APP_STATE.tileLayerOptions).addTo(APP_STATE.map);
    L.marker([51.505, -0.09], { icon: APP_STATE.marker }).addTo(APP_STATE.map);
  }
}

/**
 * Обрабатывает отправку формы
 * @param event - Событие отправки формы
 */
async function handleFormSubmit(event: Event): Promise<void> {
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  const formData = new FormData(form);
  const { source, zip } = Object.fromEntries(formData) as { source: string; zip: string };
  if (!(source && zip)) {
    APP_UTILS.showToast('Please fill in all fields');
    return;
  }
  await fetchData(source, zip);
}

/**
 * Получает данные о местоположении по API
 * @param source - Код страны
 * @param zip - Почтовый индекс
 */
async function fetchData(source: string, zip: string): Promise<void> {
  try {
    const {
      data: {
        places: [{ latitude, longitude, state, 'place name': placeName }],
      },
    } = await axios.get<{ places: [{ latitude: string; longitude: string; state: string; 'place name': string }] }>(`${APP_CONFIG.url}${source}/${zip}`);
    renderData(latitude, longitude, state, placeName);
  } catch (error) {
    APP_UTILS.handleError('An error occurred while fetching data', error);
  }
}

/**
 * Создает HTML-разметку для строки информации
 * @param label - Метка
 * @param value - Значение
 * @returns HTML-разметка строки информации
 */
function createInfoRow(label: string, value: string): string {
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
function renderData(latitude: string, longitude: string, state: string, placeName: string): void {
  APP_STATE.elements.result?.classList.remove('hidden');
  if (APP_STATE.elements.info) {
    APP_STATE.elements.info.innerHTML = `
      <h5 class='font-bold text-center'>About Place</h5>
      ${createInfoRow('Latitude', latitude)}
      ${createInfoRow('Longitude', longitude)}
      ${createInfoRow('State', state)}
      ${createInfoRow('Place Name', placeName)}
      `;
  }
  setTimeout(() => {
    mapUpdate(parseFloat(latitude), parseFloat(longitude));
  }, 100);
}

/**
 * Обновляет карту с новыми координатами
 * @param latitude - Широта
 * @param longitude - Долгота
 */
function mapUpdate(latitude: number, longitude: number): void {
  const newPosition: L.LatLngExpression = [latitude, longitude];
  const zoomLevel = 8;

  if (APP_STATE.map) {
    APP_STATE.map.setView(newPosition, zoomLevel);
    APP_STATE.map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        APP_STATE.map?.removeLayer(layer);
      }
    });
    L.marker(newPosition, { icon: APP_STATE.marker }).addTo(APP_STATE.map);
    APP_STATE.map.invalidateSize();
  }
}

initApp();
