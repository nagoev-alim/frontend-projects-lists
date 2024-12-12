/**
 * Этот код представляет собой приложение для отслеживания IP-адресов.
 * Оно позволяет пользователю ввести IP-адрес, получить информацию о его геолокации
 * и отобразить эту информацию на карте. Приложение использует API для получения
 * данных о местоположении IP-адреса и библиотеку Leaflet для отображения карты.
 */

import './style.css';
import IconPin from '/pin.svg';
import 'leaflet/dist/leaflet.css';
import L, { Icon } from 'leaflet';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';

/**
 * Класс, представляющий приложение для отслеживания IP-адресов
 */
class IPAddress {
  /**
   * Создает экземпляр приложения IPAddress
   */
  constructor() {
    /**
     * Конфигурация приложения
     * @type {Object}
     */
    this.config = {
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
     * @type {Object}
     */
    this.state = {
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
     * Утилиты приложения
     * @type {Object}
     */
    this.utils = {
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
          ...this.utils.toastConfig,
        }).showToast();
      },
      handleError: (message, error = null) => {
        this.utils.showToast(message);
        if (error) console.error(message, error);
      },
    };

    this.init();
  }

  /**
   * Создает HTML-разметку приложения
   */
  createAppHTML() {
    const { root, selectors: { form, map }, } = this.config;
    const { renderDataAttributes } = this.utils;
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
          ${this.config.defaultData.map(
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
  initDOMElements() {
    this.state.elements = {
      form: document.querySelector(this.config.selectors.form),
      ip: document.querySelector(this.config.selectors.ip),
      location: document.querySelector(this.config.selectors.location),
      timezone: document.querySelector(this.config.selectors.timezone),
      isp: document.querySelector(this.config.selectors.isp),
      map: document.querySelector(this.config.selectors.map),
    };
  }

  /**
   * Инициализирует приложение
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();

    (async () => {
      this.initializeMap();
      await this.fetchData(this.getStoredIpAddress());
      this.initializeMapLayers();
      this.state.elements.form.addEventListener('submit', this.handleFormSubmit.bind(this));
    })();
  }

  /**
   * Получает сохраненный IP-адрес из локального хранилища
   * @returns {string} IP-адрес
   */
  getStoredIpAddress() {
    const defaultIp = '101.11.201.22';
    const storedIp = localStorage.getItem('ip-address');
    return storedIp ? JSON.parse(storedIp) : defaultIp;
  }

  /**
   * Получает данные о местоположении IP-адреса
   * @param {string} ipAddress - IP-адрес для поиска
   */
  async fetchData(ipAddress) {
    try {
      const {
        data: {
          ip,
          isp,
          location: { country, region, timezone, lat, lng },
        },
      } = await axios.get(`${this.config.apiUrl}?apiKey=${this.config.apiKey}&ipAddress=${ipAddress}`);

      this.state.elements.ip.textContent = ip;
      this.state.elements.location.textContent = `${country} ${region}`;
      this.state.elements.timezone.textContent = timezone;
      this.state.elements.isp.textContent = isp;

      this.state.map.setView([lat, lng]);
      L.marker([lat, lng], { icon: this.state.marker }).addTo(this.state.map);

      if (window.matchMedia('(max-width: 992px)').matches) {
        this.addOffset();
      }
    } catch (error) {
      this.utils.handleError('Failed to fetch data', error);
    }
  }

  /**
   * Добавляет смещение для карты на мобильных устройствах
   */
  addOffset() {
    const offsetY = this.state.map.getSize().y * 0.15;
    this.state.map.panBy([0, -offsetY], { animate: false });
  }

  /**
   * Инициализирует слои карты
   */
  initializeMapLayers() {
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(this.state.map);
    L.marker([51.505, -0.09], { icon: this.state.marker }).addTo(this.state.map);
  }

  /**
   * Обрабатывает отправку формы
   * @param {Event} event - Событие отправки формы
   */
  async handleFormSubmit(event) {
    event.preventDefault();
    const query = event.target.query.value.trim();
    if (!this.isValidateIP(query)) {
      this.utils.showToast('Invalid IP address');
      return;
    }
    this.localStorageSetData(query);
    await this.fetchData(query);
  }

  /**
   * Проверяет, является ли строка допустимым IP-адресом
   * @param {string} ipAddress - Строка для проверки
   * @returns {boolean} Результат проверки
   */
  isValidateIP(ipAddress) {
    return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
      ipAddress,
    );
  }

  /**
   * Сохраняет IP-адрес в локальное хранилище
   * @param {string} ipAddress - IP-адрес для сохранения
   */
  localStorageSetData(ipAddress) {
    localStorage.setItem('ip-address', JSON.stringify(ipAddress));
  }

  /**
   * Инициализирует карту
   */
  initializeMap() {
    this.state.map = L.map(this.state.elements.map, {
      center: [51.505, -0.09],
      zoom: 13,
    });

    this.state.marker = L.icon({
      iconUrl: IconPin,
      iconSize: [30, 40],
    });

    this.initializeMapLayers();
  }
}

new IPAddress();
