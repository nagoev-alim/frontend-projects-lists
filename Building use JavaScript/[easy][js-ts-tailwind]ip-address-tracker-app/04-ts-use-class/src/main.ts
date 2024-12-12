/**
 * Этот код представляет собой класс IPAddress, который реализует функциональность
 * трекера IP-адресов. Он позволяет пользователям вводить IP-адрес, получать
 * информацию о его географическом расположении, временной зоне и провайдере,
 * а также отображает эту информацию на карте.
 */

import './style.css';
import IconPin from '/pin.svg';
import 'leaflet/dist/leaflet.css';
import L, { Icon, Map as LeafletMap } from 'leaflet';
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
    [key: string]: string;
  };
  /** Данные по умолчанию для отображения */
  defaultData: Array<{
    name: string;
    value: string;
    dataType: string;
  }>;
  /** URL API для получения данных об IP */
  apiUrl: string;
  /** Ключ API */
  apiKey: string;
}

/**
 * Интерфейс для состояния приложения
 */
interface State {
  /** DOM-элементы */
  elements: {
    [key: string]: HTMLElement | null;
  };
  /** Объект карты Leaflet */
  map: LeafletMap | null;
  /** Маркер на карте */
  marker: Icon<Icon.IconOptions> | null;
}

/**
 * Интерфейс для вспомогательных функций
 */
interface Utils {
  /** Функция для рендеринга data-атрибутов */
  renderDataAttributes: (element: string) => string;
  /** Конфигурация для Toast-уведомлений */
  toastConfig: {
    className: string;
    duration: number;
    gravity: string;
    position: string;
  };
  /** Функция для отображения Toast-уведомления */
  showToast: (message: string) => void;
  /** Функция для обработки ошибок */
  handleError: (message: string, error?: any) => void;
}

class IPAddress {
  /** Конфигурация приложения */
  private config: Config;
  /** Состояние приложения */
  private state: State;
  /** Вспомогательные функции */
  private utils: Utils;

  constructor() {
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
    const { root, selectors: { form, map }, defaultData } = this.config;
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
          ${defaultData.map(({ name, value, dataType }) => `
            <li class='grid gap-1'>
              <p class='font-bold'>${name}</p>
              ${dataType === 'timezone'
                ? `<p>UTC <span data-ip-${dataType}>${value}</span></p>`
                : `<p data-ip-${dataType}>${value}</p>`
              }
            </li>
          `).join('')}
        </ul>
        <div class='map min-h-[300px]' ${renderDataAttributes(map)}></div>
      </div>
    `;
  }

  /**
   * Инициализирует DOM-элементы
   */
  private initDOMElements(): void {
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
  private init(): void {
    this.createAppHTML();
    this.initDOMElements();

    (async () => {
      this.initializeMap();
      await this.fetchData(this.getStoredIpAddress());
      this.initializeMapLayers();
      if (this.state.elements.form) {
        this.state.elements.form.addEventListener('submit', this.handleFormSubmit.bind(this));
      }
    })();
  }

  /**
   * Получает сохраненный IP-адрес из локального хранилища
   * @returns {string} IP-адрес
   */
  private getStoredIpAddress(): string {
    const defaultIp = '101.11.201.22';
    const storedIp = localStorage.getItem('ip-address');
    return storedIp ? JSON.parse(storedIp) : defaultIp;
  }

  /**
   * Получает данные об IP-адресе и обновляет информацию на странице
   * @param {string} ipAddress - IP-адрес для запроса
   */
  private async fetchData(ipAddress: string): Promise<void> {
    try {
      const { data: { ip, isp, location: { country, region, timezone, lat, lng } } } = 
        await axios.get(`${this.config.apiUrl}?apiKey=${this.config.apiKey}&ipAddress=${ipAddress}`);

      if (this.state.elements.ip) this.state.elements.ip.textContent = ip;
      if (this.state.elements.location) this.state.elements.location.textContent = `${country} ${region}`;
      if (this.state.elements.timezone) this.state.elements.timezone.textContent = timezone;
      if (this.state.elements.isp) this.state.elements.isp.textContent = isp;

      if (this.state.map) {
        this.state.map.setView([lat, lng]);
        if (this.state.marker) {
          L.marker([lat, lng], { icon: this.state.marker }).addTo(this.state.map);
        }
      }

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
  private addOffset(): void {
    if (this.state.map) {
      const offsetY = this.state.map.getSize().y * 0.15;
      this.state.map.panBy([0, -offsetY], { animate: false });
    }
  }

  /**
   * Инициализирует слои карты
   */
  private initializeMapLayers(): void {
    if (this.state.map) {
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(this.state.map);
      if (this.state.marker) {
        L.marker([51.505, -0.09], { icon: this.state.marker }).addTo(this.state.map);
      }
    }
  }

  /**
   * Обрабатывает отправку формы
   * @param {Event} event - Событие отправки формы
   */
  private async handleFormSubmit(event: Event): Promise<void> {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const query = (form.query as HTMLInputElement).value.trim();
    if (!this.isValidateIP(query)) {
      this.utils.showToast('Invalid IP address');
      return;
    }
    this.localStorageSetData(query);
    await this.fetchData(query);
  }

  /**
   * Проверяет, является ли строка валидным IP-адресом
   * @param {string} ipAddress - IP-адрес для проверки
   * @returns {boolean} Результат проверки
   */
  private isValidateIP(idAddress: string): boolean {
    return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
      idAddress,
    );
  }
  /**
   * Сохраняет IP-адрес в локальное хранилище
   * @param {string} idAddress - IP-адрес для сохранения
   */
  private localStorageSetData(idAddress: string): void {
    localStorage.setItem('ip-address', JSON.stringify(idAddress));
  }

  /**
   * Инициализирует карту и маркер
   * Создает объект карты Leaflet и устанавливает начальные координаты и масштаб
   * Также создает иконку маркера с использованием изображения IconPin
   */
  private initializeMap(): void {
    if (this.state.elements.map instanceof HTMLElement) {
      this.state.map = L.map(this.state.elements.map, {
        center: [51.505, -0.09],
        zoom: 13,
      });

      this.state.marker = L.icon({
        iconUrl: IconPin,
        iconSize: [30, 40],
      });
    }

    this.initializeMapLayers();
  }
}

// Создает новый экземпляр класса IPAddress
new IPAddress();
