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
 * Класс ZipCode представляет основную функциональность приложения для поиска информации по почтовому индексу
 */
class ZipCode {
  /**
   * Создает экземпляр класса ZipCode и инициализирует приложение
   */
  constructor() {
    /**
     * Конфигурация приложения
     * @type {Object}
     */
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

    /**
     * Состояние приложения
     * @type {Object}
     */
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

    /**
     * Утилиты приложения
     * @type {Object}
     */
    this.utils = {
      /**
       * Рендерит атрибуты данных
       * @param {string} element - Строка с атрибутом данных
       * @returns {string} Обработанная строка атрибута
       */
      renderDataAttributes: (element) => element.slice(1, -1),
      
      /**
       * Конфигурация для Toastify
       * @type {Object}
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
          ...this.utils.toastConfig,
        }).showToast();
      },
      
      /**
       * Обрабатывает ошибки
       * @param {string} message - Сообщение об ошибке
       * @param {Error} [error] - Объект ошибки (необязательно)
       */
      handleError: (message, error = null) => {
        this.utils.showToast(message);
        if (error) console.error(message, error);
      },
    };

    this.init();
  }

  /**
   * Создает HTML структуру приложения
   */
  createAppHTML() {
    const {
      root,
      selectors: {
        form,
        submit,
        result,
        info,
        map,
      },
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
  initDOMElements() {
    this.state.elements = {
      form: document.querySelector(this.config.selectors.form),
      submit: document.querySelector(this.config.selectors.submit),
      result: document.querySelector(this.config.selectors.result),
      info: document.querySelector(this.config.selectors.info),
      map: document.querySelector(this.config.selectors.map),
    };
  }

  /**
   * Инициализирует приложение
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();
    this.initMap();
    this.mapConfiguration();
    this.state.elements.form.addEventListener('submit', this.handleFormSubmit.bind(this));
  }

  /**
   * Инициализирует карту
   */
  initMap() {
    this.state.map = L.map(this.state.elements.map, {
      center: [51.505, -0.09],
      zoom: 13,
    });

    this.mapUpdate(51.505, -0.09);
  }

  /**
   * Настраивает карту
   */
  mapConfiguration() {
    L.tileLayer(this.state.tileLayerUrl, this.state.tileLayerOptions).addTo(this.state.map);
    L.marker([51.505, -0.09], { icon: this.state.marker }).addTo(this.state.map);
  }

  /**
   * Обрабатывает отправку формы
   * @param {Event} event - Событие отправки формы
   */
  async handleFormSubmit(event) {
    event.preventDefault();
    const { source, zip } = Object.fromEntries(new FormData(event.target));
    if (!(source && zip)) {
      this.utils.showToast('Please fill in all fields');
      return;
    }
    await this.fetchData(source, zip);
  }

  /**
   * Получает данные о местоположении
   * @param {string} source - Код страны
   * @param {string} zip - Почтовый индекс
   */
  async fetchData(source, zip) {
    try {
      const {
        data: {
          places: [{ latitude, longitude, state, 'place name': placeName }],
        },
      } = await axios.get(`${this.config.url}${source}/${zip}`);
      this.renderData(latitude, longitude, state, placeName);
    } catch (error) {
      this.utils.handleError('An error occurred while fetching data', error);
    }
  }

  /**
   * Создает строку информации
   * @param {string} label - Метка
   * @param {string} value - Значение
   * @returns {string} HTML строка с информацией
   */
  createInfoRow(label, value) {
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
   * @param {string} state - Штат
   * @param {string} placeName - Название места
   */
  renderData(latitude, longitude, state, placeName) {
    this.state.elements.result.classList.remove('hidden');
    this.state.elements.info.innerHTML = `
      <h5 class='font-bold text-center'>About Place</h5>
      ${this.createInfoRow('Latitude', latitude)}
      ${this.createInfoRow('Longitude', longitude)}
      ${this.createInfoRow('State', state)}
      ${this.createInfoRow('Place Name', placeName)}
    `;
    setTimeout(() => {
      this.mapUpdate(latitude, longitude);
    }, 100);
  }

  /**
   * Обновляет карту
   * @param {string} latitude - Широта
   * @param {string} longitude - Долгота
   */
  mapUpdate(latitude, longitude) {
    const newPosition = [latitude, longitude];
    const zoomLevel = 8;

    this.state.map.setView(newPosition, zoomLevel);
    this.state.map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        this.state.map.removeLayer(layer);
      }
    });
    L.marker(newPosition, { icon: this.state.marker }).addTo(this.state.map);
    this.state.map.invalidateSize();
  }
}

new ZipCode();
