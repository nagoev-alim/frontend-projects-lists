/**
 * Этот код представляет собой приложение для поиска информации о местоположении по почтовому индексу.
 * Он использует API Zippopotam для получения данных о местоположении и отображает результаты на карте
 * с помощью библиотеки Leaflet. Приложение также использует Toastify для отображения уведомлений.
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
 * Конфигурация приложения
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента
 * @property {Object} selectors - Селекторы для различных элементов DOM
 * @property {string} url - URL API для получения данных о местоположении
 */
const APP_CONFIG = {
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
 * @typedef {Object} AppState
 * @property {Object} elements - Ссылки на элементы DOM
 * @property {Object} map - Объект карты Leaflet
 * @property {Object} marker - Иконка маркера для карты
 * @property {string} tileLayerUrl - URL для тайлов карты
 * @property {Object} tileLayerOptions - Опции для тайлового слоя
 */
const APP_STATE = {
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
 * @typedef {Object} AppUtils
 * @property {Function} renderDataAttributes - Функция для рендеринга атрибутов данных
 * @property {Object} toastConfig - Конфигурация для Toastify
 * @property {Function} showToast - Функция для отображения уведомлений
 * @property {Function} handleError - Функция для обработки ошибок
 */
const APP_UTILS = {
  /**
   * Рендерит атрибуты данных
   * @param {string} element - Строка с атрибутом данных
   * @returns {string} Обработанная строка атрибута
   */
  renderDataAttributes: (element) => element.slice(1, -1),
  
  /**
   * Конфигурация для Toastify
   */
  toastConfig: {
    className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
    duration: 3000,
    gravity: 'bottom',
    position: 'center',
  },
  
  /**
   * Отображает уведомление
   * @param {string} message - Сообщение для отображения
   */
  showToast: (message) => {
    Toastify({
      text: message,
      ...APP_UTILS.toastConfig,
    }).showToast();
  },
  
  /**
   * Обрабатывает ошибки
   * @param {string} message - Сообщение об ошибке
   * @param {Error} [error] - Объект ошибки (необязательно)
   */
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
      form,
      submit,
      result,
      info,
      map,
    },
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
 * Инициализирует элементы DOM
 */
function initDOMElements() {
  APP_STATE.elements = {
    form: document.querySelector(APP_CONFIG.selectors.form),
    submit: document.querySelector(APP_CONFIG.selectors.submit),
    result: document.querySelector(APP_CONFIG.selectors.result),
    info: document.querySelector(APP_CONFIG.selectors.info),
    map: document.querySelector(APP_CONFIG.selectors.map),
  };
}

/**
 * Инициализирует приложение
 */
function initApp() {
  createAppHTML();
  initDOMElements();
  initMap();

  mapConfiguration();
  APP_STATE.elements.form.addEventListener('submit', handleFormSubmit);
}

/**
 * Инициализирует карту
 */
function initMap() {
  APP_STATE.map = L.map(APP_STATE.elements.map, {
    center: [51.505, -0.09],
    zoom: 13,
  });

  mapUpdate(51.505, -0.09);
}

/**
 * Настраивает карту
 */
function mapConfiguration() {
  L.tileLayer(APP_STATE.tileLayerUrl, APP_STATE.tileLayerOptions).addTo(APP_STATE.map);
  L.marker([51.505, -0.09], { icon: APP_STATE.marker }).addTo(APP_STATE.map);
}

/**
 * Обрабатывает отправку формы
 * @param {Event} event - Событие отправки формы
 */
async function handleFormSubmit(event) {
  event.preventDefault();
  const { source, zip } = Object.fromEntries(new FormData(event.target));
  if (!(source && zip)) {
    APP_UTILS.showToast('Please fill in all fields');
    return;
  }
  await fetchData(source, zip);
}

/**
 * Получает данные о местоположении
 * @param {string} source - Код страны
 * @param {string} zip - Почтовый индекс
 */
async function fetchData(source, zip) {
  try {
    const {
      data: {
        places: [{ latitude, longitude, state, 'place name': placeName }],
      },
    } = await axios.get(`${APP_CONFIG.url}${source}/${zip}`);
    renderData(latitude, longitude, state, placeName);
  } catch (error) {
    APP_UTILS.handleError('An error occurred while fetching data', error);
  }
}

/**
 * Создает строку с информацией
 * @param {string} label - Метка
 * @param {string} value - Значение
 * @returns {string} HTML строка
 */
function createInfoRow(label, value) {
  return `
    <p class='grid grid-cols-2'>
      <span class='border font-medium p-2'>${label}:</span>
      <span class='border p-2'>${value}</span>
    </p>
  `;
}

/**
 * Отображает данные о местоположении
 * @param {string} latitude - Широта
 * @param {string} longitude - Долгота
 * @param {string} state - Штат/область
 * @param {string} placeName - Название места
 */
function renderData(latitude, longitude, state, placeName) {
  APP_STATE.elements.result.classList.remove('hidden');
  APP_STATE.elements.info.innerHTML = `
    <h5 class='font-bold text-center'>About Place</h5>
    ${createInfoRow('Latitude', latitude)}
    ${createInfoRow('Longitude', longitude)}
    ${createInfoRow('State', state)}
    ${createInfoRow('Place Name', placeName)}
    `;
  setTimeout(() => {
    mapUpdate(latitude, longitude);
  }, 100);
}

/**
 * Обновляет карту
 * @param {string} latitude - Широта
 * @param {string} longitude - Долгота
 */
function mapUpdate(latitude, longitude) {
  const newPosition = [latitude, longitude];
  const zoomLevel = 8;

  APP_STATE.map.setView(newPosition, zoomLevel);
  APP_STATE.map.eachLayer((layer) => {
    if (layer instanceof L.Marker) {
      APP_STATE.map.removeLayer(layer);
    }
  });
  L.marker(newPosition, { icon: APP_STATE.marker }).addTo(APP_STATE.map);
  APP_STATE.map.invalidateSize();
}

initApp();
