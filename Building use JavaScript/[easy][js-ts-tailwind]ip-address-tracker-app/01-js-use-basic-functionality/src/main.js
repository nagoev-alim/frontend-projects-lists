/**
 * Этот код представляет собой приложение для отслеживания IP-адресов.
 * Он использует API для получения информации о местоположении IP-адреса,
 * отображает эту информацию на странице и показывает местоположение на карте.
 * Приложение также сохраняет последний введенный IP-адрес в локальное хранилище.
 */

import './style.css';
import IconPin from '/pin.svg';
import 'leaflet/dist/leaflet.css';
import L, { Icon } from 'leaflet';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';

/**
 * Конфигурация приложения
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента
 * @property {Object} selectors - Селекторы DOM-элементов
 * @property {Array} defaultData - Данные по умолчанию
 * @property {string} apiUrl - URL API для получения геоданных
 * @property {string} apiKey - Ключ API
 */
const APP_CONFIG = {
  root: '#app',
  selectors: {
    form: '[data-ip-form]',
    ip: '[data-ip-ip]',
    location: '[data-ip-location]',
    timezone: '[data-ip-timezone]',
    isp: '[data-ip-isp]',
    map: '[data-ip-map]',
  },
  defaultData: [
    { name: 'IP Address', value: '101.11.201.22', dataType: 'ip' },
    { name: 'Location', value: 'TW Taiwan', dataType: 'location' },
    { name: 'Timezone', value: 'UTC +08:00', dataType: 'timezone' },
    { name: 'ISP', value: 'Taiwan Mobile Co., Ltd.', dataType: 'isp' },
  ],
  apiUrl: 'https://geo.ipify.org/api/v2/country,city',
  apiKey: 'at_D5MQsxItBHTAuuGXJEefzDtDNm2QH',
};

/**
 * Состояние приложения
 * @typedef {Object} AppState
 * @property {Object} elements - DOM-элементы
 * @property {L.Map} map - Объект карты Leaflet
 * @property {Icon} marker - Иконка маркера на карте
 */
const APP_STATE = {
  elements: {
    form: null,
    ip: null,
    location: null,
    timezone: null,
    isp: null,
    map: null,
  },
  map: L.Map,
  marker: Icon,
};

/**
 * Утилиты приложения
 * @typedef {Object} AppUtils
 * @property {Function} renderDataAttributes - Функция для рендеринга data-атрибутов
 * @property {Object} toastConfig - Конфигурация для всплывающих уведомлений
 * @property {Function} showToast - Функция для отображения всплывающего уведомления
 * @property {Function} handleError - Функция для обработки ошибок
 */
const APP_UTILS = {
  renderDataAttributes: (element) => element.slice(1, -1),
  toastConfig: {
    className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
    duration: 3000,
    gravity: 'bottom',
    position: 'center',
  },
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
 * Создает HTML-разметку приложения
 */
function createAppHTML() {
  const { root, selectors: { form, map }, } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='grid max-w-md w-full gap-4 rounded border bg-white p-3 shadow'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>IP Address Tracker</h1>
      <form ${renderDataAttributes(form)}>
        <input 
          class='w-full rounded border bg-slate-50 px-3 py-2 focus:border-blue-400 focus:outline-none' 
          type='text' 
          name='query' 
          placeholder='Search for any IP address or domain'
        >
      </form>
      <ul class='grid gap-3 place-items-center text-center sm:grid-cols-2'>
        ${APP_CONFIG.defaultData.map(
    ({ name, value, dataType }) => `
          <li class='grid gap-1'>
            <p class='font-bold'>${name}</p>
            ${
      dataType === 'timezone'
        ? `<p>UTC <span data-ip-${dataType}>${value}</span></p>`
        : `<p data-ip-${dataType}>${value}</p>`
    }
          </li>
        `,
  ).join('')}
      </ul>
      <div class='map min-h-[300px]' ${renderDataAttributes(map)}></div>
    </div>
  `;
}

/**
 * Инициализирует DOM-элементы
 */
function initDOMElements() {
  APP_STATE.elements = {
    form: document.querySelector(APP_CONFIG.selectors.form),
    ip: document.querySelector(APP_CONFIG.selectors.ip),
    location: document.querySelector(APP_CONFIG.selectors.location),
    timezone: document.querySelector(APP_CONFIG.selectors.timezone),
    isp: document.querySelector(APP_CONFIG.selectors.isp),
    map: document.querySelector(APP_CONFIG.selectors.map),
  };
}

/**
 * Инициализирует приложение
 */
function initApp() {
  createAppHTML();
  initDOMElements();
  (async () => {
    initializeMap();
    await fetchData(getStoredIpAddress());
    initializeMapLayers();
    APP_STATE.elements.form.addEventListener('submit', handleFormSubmit);
  })();
}

/**
 * Получает сохраненный IP-адрес из локального хранилища
 * @returns {string} IP-адрес
 */
function getStoredIpAddress() {
  const defaultIp = '101.11.201.22';
  const storedIp = localStorage.getItem('ip-address');
  return storedIp ? JSON.parse(storedIp) : defaultIp;
}

/**
 * Получает данные о местоположении по IP-адресу
 * @param {string} ipAddress - IP-адрес для поиска
 */
async function fetchData(ipAddress) {
  try {
    const {
      data: {
        ip,
        isp,
        location: { country, region, timezone, lat, lng },
      },
    } = await axios.get(`${APP_CONFIG.apiUrl}?apiKey=${APP_CONFIG.apiKey}&ipAddress=${ipAddress}`);

    APP_STATE.elements.ip.textContent = ip;
    APP_STATE.elements.location.textContent = `${country} ${region}`;
    APP_STATE.elements.timezone.textContent = timezone;
    APP_STATE.elements.isp.textContent = isp;

    APP_STATE.map.setView([lat, lng]);
    L.marker([lat, lng], { icon: APP_STATE.marker }).addTo(APP_STATE.map);

    if (window.matchMedia('(max-width: 992px)').matches) {
      addOffset();
    }
  } catch (error) {
    APP_UTILS.handleError('Failed to fetch data', error);
    return;
  }
}

/**
 * Добавляет смещение к карте для мобильных устройств
 */
function addOffset() {
  const offsetY = APP_STATE.map.getSize().y * 0.15;
  APP_STATE.map.panBy([0, -offsetY], { animate: false });
}

/**
 * Инициализирует слои карты
 */
function initializeMapLayers() {
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
  }).addTo(APP_STATE.map);
  L.marker([51.505, -0.09], { icon: APP_STATE.marker }).addTo(APP_STATE.map);
}

/**
 * Обрабатывает отправку формы
 * @param {Event} event - Событие отправки формы
 */
async function handleFormSubmit(event) {
  event.preventDefault();
  const query = event.target.query.value.trim();
  if (!isValidateIP(query)) {
    APP_UTILS.showToast('Invalid IP address');
    return;
  }
  localStorageSetData(query);
  await fetchData(query);
}

/**
 * Проверяет, является ли строка корректным IP-адресом
 * @param {string} idAddress - Проверяемый IP-адрес
 * @returns {boolean} Результат проверки
 */
function isValidateIP(idAddress) {
  return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
    idAddress,
  );
}

/**
 * Сохраняет IP-адрес в локальное хранилище
 * @param {string} idAddress - IP-адрес для сохранения
 */
function localStorageSetData(idAddress) {
  localStorage.setItem('ip-address', JSON.stringify(idAddress));
}

/**
 * Инициализирует карту
 */
function initializeMap() {
  APP_STATE.map = L.map(APP_STATE.elements.map, {
    center: [51.505, -0.09],
    zoom: 13,
  });

  APP_STATE.marker = L.icon({
    iconUrl: IconPin,
    iconSize: [30, 40],
  });

  initializeMapLayers();
}

initApp();
