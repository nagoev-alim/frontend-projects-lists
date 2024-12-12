import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import countryCodes from '@mock/mock.js';
import icon from '/pin.svg';
import { showToast } from '@utils';
import { Button, Input } from '@ui';

/**
 * Корневой компонент приложения ZipCode
 * @returns {JSX.Element} Возвращает JSX разметку компонента
 */
const Root = () => {
  // Состояние для хранения данных формы
  const [formData, setFormData] = useState({ source: '', zip: '' });
  // Состояние для хранения данных о месте
  const [placeData, setPlaceData] = useState(null);
  // Реф для доступа к DOM-элементу карты
  const mapRef = useRef(null);
  // Реф для хранения экземпляра карты Leaflet
  const mapInstanceRef = useRef(null);

  /**
   * Инициализирует карту Leaflet
   * @name initMap
   */
  const initMap = useCallback(() => {
    mapInstanceRef.current = L.map(mapRef.current, {
      center: [51.505, -0.09],
      zoom: 13,
    });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);
    L.marker([51.505, -0.09], { icon: createIcon() }).addTo(mapInstanceRef.current);
  }, []);

  /**
   * Создает иконку для маркера на карте
   * @returns {L.Icon} Возвращает объект иконки Leaflet
   */
  const createIcon = useCallback(() => L.icon({
    iconUrl: icon,
    iconSize: [30, 40],
  }), []);

  /**
   * Обновляет карту с новыми координатами
   * @param {string} latitude - Широта
   * @param {string} longitude - Долгота
   */
  const updateMap = useCallback((latitude, longitude) => {
    const newPosition = [latitude, longitude];
    const zoomLevel = 8;

    mapInstanceRef.current.setView(newPosition, zoomLevel);
    mapInstanceRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapInstanceRef.current.removeLayer(layer);
      }
    });
    L.marker(newPosition, { icon: createIcon() }).addTo(mapInstanceRef.current);
    mapInstanceRef.current.invalidateSize();
  }, [createIcon]);

  // Эффект для инициализации карты при монтировании компонента
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      initMap();
    }
  }, [initMap]);

  // Эффект для обновления карты при изменении данных о месте
  useEffect(() => {
    if (placeData && mapInstanceRef.current) {
      updateMap(placeData.latitude, placeData.longitude);
    }
  }, [placeData, updateMap]);

  /**
   * Обработчик изменения ввода в форме
   * @param {React.ChangeEvent<HTMLInputElement|HTMLSelectElement>} e - Событие изменения
   */
  const handleInputChange = useCallback((e) => {
    setFormData(prevData => ({ ...prevData, [e.target.name]: e.target.value }));
  }, []);

  /**
   * Обработчик отправки формы
   * @param {React.FormEvent<HTMLFormElement>} e - Событие отправки формы
   */
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!(formData.source && formData.zip)) {
      showToast('Please fill in all fields', 'error');
      return;
    }
    try {
      const { data } = await axios.get(`https://api.zippopotam.us/${formData.source}/${formData.zip}`);
      const { latitude, longitude, state, 'place name': placeName } = data.places[0];
      setPlaceData({ latitude, longitude, state, placeName });
    } catch (error) {
      showToast('An error occurred while fetching data', 'error');
    }
  }, [formData]);

  return (
    <div className="grid max-w-md w-full gap-4 rounded border bg-white p-3 shadow">
      <h1 className="text-center text-2xl font-bold">ZipCode App</h1>
      <form className="grid gap-3" onSubmit={handleSubmit}>
        <select
          className="w-full border-2 px-3 py-2 focus:border-blue-400 focus:outline-none"
          name="source"
          value={formData.source}
          onChange={handleInputChange}
        >
          <option value="">Select Country</option>
          {countryCodes.map(({ name, value }) => (
            <option key={value} value={value}>{name}</option>
          ))}
        </select>
        <Input
          name="zip"
          fullWidth={true}
          placeholder="Zip Code"
          value={formData.zip}
          onChange={handleInputChange}
        />
        <Button type="submit">Submit</Button>
      </form>
      {placeData && (
        <div>
          <div className="mb-3 grid gap-3">
            <h5 className="font-bold text-center">About Place</h5>
            <p className="grid grid-cols-2">
              <span className="border font-medium p-2">Latitude:</span>
              <span className="border p-2">{placeData.latitude}</span>
            </p>
            <p className="grid grid-cols-2">
              <span className="border font-medium p-2">Longitude:</span>
              <span className="border p-2">{placeData.longitude}</span>
            </p>
            <p className="grid grid-cols-2">
              <span className="border font-medium p-2">State:</span>
              <span className="border p-2">{placeData.state}</span>
            </p>
            <p className="grid grid-cols-2">
              <span className="border font-medium p-2">Place Name:</span>
              <span className="border p-2">{placeData.placeName}</span>
            </p>
          </div>
          <div className="min-h-[300px] w-full" ref={mapRef}></div>
        </div>
      )}
    </div>
  );
};

export default Root;
