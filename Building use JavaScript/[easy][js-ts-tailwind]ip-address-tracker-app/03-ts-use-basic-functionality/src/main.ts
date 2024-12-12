/**
 * Этот код реализует приложение для отслеживания IP-адресов.
 * Он включает в себя функциональность для отображения информации о местоположении IP,
 * визуализации этого местоположения на карте, и позволяет пользователю искать информацию
 * по конкретному IP-адресу. Приложение использует API Leaflet для отображения карты
 * и API geo.ipify.org для получения информации об IP-адресах.
 */

import './style.css';
import IconPin from '/pin.svg';
import 'leaflet/dist/leaflet.css';
import L, { Icon, Map as LeafletMap } from 'leaflet';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';

/**
 * Интерфейс конфигурации приложения
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента
 * @property {Object} selectors - Объект с селекторами элементов
 * @property {Array} defaultData - Массив с данными по умолчанию
 * @property {string} apiUrl - URL API для получения данных об IP
 * @property {string} apiKey - Ключ API
 */
interface AppConfig {
  root: string;
  selectors: {
    [key: string]: string;
  };
  defaultData: {
    name: string;
    value: string;
    dataType: string;
  }[];
  apiUrl: string;
  apiKey: string;
}

/**
 * Объект конфигурации приложения
 * @type {AppConfig}
 */
const APP_CONFIG: AppConfig = {
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
 * Интерфейс состояния приложения
 * @typedef {Object} AppState
 * @property {Object} elements - Объект с DOM элементами
 * @property {LeafletMap|null} map - Объект карты Leaflet
 * @property {Icon|null} marker - Иконка маркера на карте
 */
interface AppState {
  elements: {
    form: HTMLFormElement | null;
    ip: HTMLElement | null;
    location: HTMLElement | null;
    timezone: HTMLElement | null;
    isp: HTMLElement | null;
    map: HTMLElement | null;
  };
  map: LeafletMap | null;
  marker: Icon | null;
}

/**
 * Объект состояния приложения
 * @type {AppState}
 */
const APP_STATE: AppState = {
  elements: {
    form: null,
    ip: null,
    location: null,
    timezone: null,
    isp: null,
    map: null,
  },
  map: null,
  marker: null,
};

/**
 * Интерфейс утилит приложения
 * @typedef {Object} AppUtils
 * @property {Function} renderDataAttributes - Функция для рендеринга атрибутов данных
 * @property {Object} toastConfig - Конфигурация для уведомлений
 * @property {Function} showToast - Функция для отображения уведомлений
 * @property {Function} handleError - Функция для обработки ошибок
 */
interface AppUtils {
  renderDataAttributes: (element: string) => string;
  toastConfig: {
    className: string;
    duration: number;
    gravity: string;
    position: string;
  };
  showToast: (message: string) => void;
  handleError: (message: string, error?: any) => void;
}

/**
 * Объект утилит приложения
 * @type {AppUtils}
 */
const APP_UTILS: AppUtils = {
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
 * Создает HTML структуру приложения
 */
function createAppHTML(): void {
  const { root, selectors: { form, map } } = APP_CONFIG;
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
 * Инициализирует DOM элементы
 */
function initDOMElements(): void {
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
function initApp(): void {
  createAppHTML();
  initDOMElements();
  (async () => {
    initializeMap();
    await fetchData(getStoredIpAddress());
    initializeMapLayers();
    APP_STATE.elements.form?.addEventListener('submit', handleFormSubmit);
  })();
}

/**
 * Получает сохраненный IP-адрес из локального хранилища
 * @returns {string} IP-адрес
 */
function getStoredIpAddress(): string {
  const defaultIp = '101.11.201.22';
  const storedIp = localStorage.getItem('ip-address');
  return storedIp ? JSON.parse(storedIp) : defaultIp;
}

/**
 * Получает данные об IP-адресе
 * @param {string} ipAddress - IP-адрес для поиска
 */
async function fetchData(ipAddress: string): Promise<void> {
  try {
    const {
      data: {
        ip,
        isp,
        location: { country, region, timezone, lat, lng },
      },
    } = await axios.get(`${APP_CONFIG.apiUrl}?apiKey=${APP_CONFIG.apiKey}&ipAddress=${ipAddress}`);

    if (APP_STATE.elements.ip) APP_STATE.elements.ip.textContent = ip;
    if (APP_STATE.elements.location) APP_STATE.elements.location.textContent = `${country} ${region}`;
    if (APP_STATE.elements.timezone) APP_STATE.elements.timezone.textContent = timezone;
    if (APP_STATE.elements.isp) APP_STATE.elements.isp.textContent = isp;

    if (APP_STATE.map) {
      APP_STATE.map.setView([lat, lng]);
      if (APP_STATE.marker) {
        L.marker([lat, lng], { icon: APP_STATE.marker }).addTo(APP_STATE.map);
      }
    }

    if (window.matchMedia('(max-width: 992px)').matches) {
      addOffset();
    }
  } catch (error) {
    APP_UTILS.handleError('Failed to fetch data', error);
  }
}

/**
 * Добавляет смещение для карты на мобильных устройствах
 */
function addOffset(): void {
  if (APP_STATE.map) {
    const offsetY = APP_STATE.map.getSize().y * 0.15;
    APP_STATE.map.panBy([0, -offsetY], { animate: false });
  }
}

/**
 * Инициализирует слои карты
 */
function initializeMapLayers(): void {
  if (APP_STATE.map) {
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(APP_STATE.map);
    if (APP_STATE.marker) {
      L.marker([51.505, -0.09], { icon: APP_STATE.marker }).addTo(APP_STATE.map);
    }
  }
}


/**
 * Обрабатывает отправку формы поиска IP-адреса
 * @param {Event} event - Событие отправки формы
 * @returns {Promise<void>}
 */
async function handleFormSubmit(event: Event): Promise<void> {
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  const query = (form.query as HTMLInputElement).value.trim();
  if (!isValidateIP(query)) {
    APP_UTILS.showToast('Invalid IP address');
    return;
  }
  localStorageSetData(query);
  await fetchData(query);
}

/**
 * Проверяет, является ли строка действительным IP-адресом
 * @param {string} idAddress - Строка для проверки
 * @returns {boolean} - true, если строка является действительным IP-адресом, иначе false
 */
function isValidateIP(idAddress: string): boolean {
  return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
    idAddress,
  );
}

/**
 * Сохраняет IP-адрес в локальное хранилище
 * @param {string} idAddress - IP-адрес для сохранения
 */
function localStorageSetData(idAddress: string): void {
  localStorage.setItem('ip-address', JSON.stringify(idAddress));
}

/**
 * Инициализирует карту Leaflet и устанавливает маркер
 */
function initializeMap(): void {
  if (APP_STATE.elements.map) {
    APP_STATE.map = L.map(APP_STATE.elements.map, {
      center: [51.505, -0.09],
      zoom: 13,
    });

    APP_STATE.marker = L.icon({
      iconUrl: IconPin,
      iconSize: [30, 40],
    });
  }

  initializeMapLayers();
}

// Инициализация приложения
initApp();
