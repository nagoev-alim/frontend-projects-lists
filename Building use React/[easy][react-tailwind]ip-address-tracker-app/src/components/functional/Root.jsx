/**
 * @module IPAddressTracker
 * @description Модуль для отслеживания и отображения информации об IP-адресах.
 * Предоставляет функциональность для поиска информации об IP-адресах и отображения их местоположения на карте.
 */
import { Input } from '@ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import { renderToString } from 'react-dom/server';

import { showToast } from '@utils';
import { MdPushPin } from 'react-icons/md';

/**
 * @description Стандартный IP-адрес, используемый по умолчанию.
 */
const DEFAULT_IP = '101.11.201.22';

/**
 * @description Ключ API для доступа к сервису геолокации IP-адресов.
 */
const API_KEY = 'at_D5MQsxItBHTAuuGXJEefzDtDNm2QH';

/**
 * @description URL-адрес API для запросов геолокации IP-адресов.
 */
const API_URL = 'https://geo.ipify.org/api/v2/country,city';

/**
 * @constant {Array<Object>} INITIAL_LOCATION_CONFIG
 * @description Начальная конфигурация данных о местоположении.
 * @property {string} name - Название поля данных.
 * @property {string} value - Значение поля данных.
 * @property {string} dataType - Тип данных (ip, location, timezone, isp).
 */
const INITIAL_LOCATION_CONFIG = [
  { name: 'IP Address', value: DEFAULT_IP, dataType: 'ip' },
  { name: 'Location', value: 'TW Taiwan', dataType: 'location' },
  { name: 'Timezone', value: 'UTC +08:00', dataType: 'timezone' },
  { name: 'ISP', value: 'Taiwan Mobile Co., Ltd.', dataType: 'isp' },
];

/**
 * @function Root
 * @description Основной компонент для отслеживания IP-адресов и отображения информации на карте.
 * @returns {JSX.Element} Возвращает JSX элемент с интерфейсом трекера IP-адресов.
 */
const Root = () => {
  /**
   * @description Состояние для хранения конфигурации карты.
   */
  const [mapConfig, setMapConfig] = useState(null);

  /**
   * @description Ссылка на DOM-элемент карты.
   */
  const mapRef = useRef(null);

  /**
   * @description Состояние для хранения конфигурации местоположения.
   */
  const [locationConfig, setLocationConfig] = useState(INITIAL_LOCATION_CONFIG);

  /**
   * @function createCustomMarker
   * @description Создает пользовательский маркер для карты.
   * @returns {Object} Возвращает объект L.divIcon для использования в качестве маркера на карте.
   */
  const createCustomMarker = useCallback(() => {
    // Создание HTML-разметки для иконки маркера
    const iconMarkup = renderToString(<MdPushPin size={30} />);

    // Возвращение объекта L.divIcon с настройками
    return L.divIcon({
      html: iconMarkup,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      className: 'custom-icon',
    });
  }, []);

  /**
   * @function getStoredIpAddress
   * @description Получает сохраненный IP-адрес из локального хранилища или возвращает адрес по умолчанию.
   * @returns {string} Возвращает сохраненный IP-адрес или DEFAULT_IP.
   */
  const getStoredIpAddress = useCallback(() => {
    const storedIp = localStorage.getItem('ip-address');
    return storedIp ? JSON.parse(storedIp) : DEFAULT_IP;
  }, []);

  /**
   * @function isValidIpAddress
   * @description Проверяет, является ли строка действительным IP-адресом.
   * @param {string} ipAddress - IP-адрес для проверки.
   * @returns {boolean} Возвращает true, если IP-адрес действителен, иначе false.
   */
  const isValidIpAddress = (ipAddress) => {
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    return ipPattern.test(ipAddress) && ipAddress.split('.').every(num => parseInt(num, 10) <= 255);
  };

  /**
   * @function updateMap
   * @description Обновляет карту, устанавливая новый центр и добавляя маркер.
   * @param {number} lat - Широта новой точки.
   * @param {number} lng - Долгота новой точки.
   */
  const updateMap = useCallback((lat, lng) => {
    if (!mapConfig) return;

    const { map, marker } = mapConfig;
    map.setView([lat, lng]);
    // Удаляем все существующие маркеры
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });
    // Добавляем новый маркер
    L.marker([lat, lng], { icon: marker }).addTo(map);
  }, [mapConfig]);

  /**
   * @function fetchData
   * @description Получает данные о местоположении для заданного IP-адреса и обновляет состояние приложения.
   * @param {string} ipAddress - IP-адрес для поиска.
   */
  const fetchData = useCallback(async (ipAddress) => {
    try {
      const { data } = await axios.get(`${API_URL}?apiKey=${API_KEY}&ipAddress=${ipAddress}`);
      const { ip, isp, location: { country, region, timezone, lat, lng } } = data;

      // Обновляем конфигурацию местоположения
      setLocationConfig([
        { name: 'IP Address', value: ip, dataType: 'ip' },
        { name: 'Location', value: `${country} ${region}`, dataType: 'location' },
        { name: 'Timezone', value: timezone, dataType: 'timezone' },
        { name: 'ISP', value: isp, dataType: 'isp' },
      ]);

      // Обновляем карту с новыми координатами
      updateMap(lat, lng);
    } catch (error) {
      showToast('Failed to fetch IP data', 'error');
    }
  }, [updateMap]);

  /**
   * @function handleFormSubmit
   * @description Обрабатывает отправку формы поиска IP-адреса.
   * @param {Event} event - Событие отправки формы.
   */
  const handleFormSubmit = useCallback(async (event) => {
    event.preventDefault();
    const query = event.target.query.value.trim();
    if (!isValidIpAddress(query)) {
      showToast('Invalid IP address', 'error');
      return;
    }
    localStorage.setItem('ip-address', JSON.stringify(query));
    await fetchData(query);
  }, [fetchData]);

  /**
   * @function useEffect
   * @description Эффект для инициализации карты и загрузки начальных данных.
   */
  useEffect(() => {
    if (mapRef.current && !mapConfig) {
      // Инициализация карты
      const map = L.map(mapRef.current).setView([51.505, -0.09], 13);
      const customMarker = createCustomMarker();

      // Добавление слоя тайлов
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Сохранение конфигурации карты
      setMapConfig({ map, marker: customMarker });
    }

    // Загрузка данных для сохраненного IP-адреса
    fetchData(getStoredIpAddress());
  }, [mapConfig, getStoredIpAddress, fetchData, createCustomMarker]);

  return (
    <div className="grid max-w-md w-full gap-4 rounded border bg-white p-3 shadow">
      <h1 className="text-center text-2xl font-bold">IP Address Tracker</h1>
      <form onSubmit={handleFormSubmit}>
        <Input
          className="w-full rounded border bg-slate-50 px-3 py-2 focus:border-blue-400 focus:outline-none"
          type="text"
          name="query"
          placeholder="Search for any IP address or domain"
        />
      </form>
      <ul className="grid gap-3 place-items-center text-center sm:grid-cols-2">
        {locationConfig.map(({ name, value, dataType }) => (
          <li className="grid gap-1" key={name}>
            <p className="font-bold">{name}</p>
            <p>{dataType === 'timezone' && 'UTC '}{value}</p>
          </li>
        ))}
      </ul>
      <div className="map min-h-[300px]" ref={mapRef}></div>
    </div>
  );
};

export default Root;
