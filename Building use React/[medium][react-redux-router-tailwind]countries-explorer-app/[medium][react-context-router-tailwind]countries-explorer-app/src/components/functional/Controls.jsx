/**
 * @module Controls
 * @description Модуль, содержащий компонент элементов управления для фильтрации списка стран.
 */

import { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { countriesActions } from '../../context/index.js';
import { useCountriesContext } from '../../hooks/index.js';
import { Input } from '../ui/index.js';

/**
 * @function Controls
 * @description Компонент элементов управления для фильтрации списка стран по поисковому запросу и региону.
 * 
 * @param {Object} props - Свойства компонента.
 * @param {Function} props.onPaginationClick - Функция для обновления пагинации при изменении фильтров.
 * 
 * @returns {JSX.Element} Возвращает JSX элемент с элементами управления фильтрацией.
 */
const Controls = ({onPaginationClick}) => {
  /**
   * @description Состояния для хранения значений поискового запроса и выбранного региона.
   */
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('');

  /**
   * @description Получение данных и функций из контекста и экшенов.
   */
  const { items, dispatch } = useCountriesContext();
  const { filterCountriesByRegionAndQuery } = countriesActions;

  /**
   * @description Обработчик изменения значений в полях ввода.
   * @function
   * @param {Event} e - Событие изменения поля ввода.
   */
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    if (name === 'search') setSearch(value);
    if (name === 'region') setRegion(value);
  }, []);

  /**
   * @description Эффект для фильтрации стран при изменении поискового запроса или региона.
   */
  useEffect(() => {
    filterCountriesByRegionAndQuery(dispatch, items, search, region);
    onPaginationClick(0)
  }, [search, region, filterCountriesByRegionAndQuery, dispatch, items, onPaginationClick]);

  /**
   * @description Список доступных регионов для фильтрации.
   */
  const regions = ['Africa', 'America', 'Asia', 'Europe', 'Oceania'];

  return (
    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-[250px_200px] md:justify-between">
      <label>
        <Input
          type="text"
          name="search"
          className="w-full dark:bg-slate-600 dark:border-slate-500"
          placeholder="Search for a country..."
          value={search}
          onChange={handleInputChange}
        />
      </label>

      <label>
        <select
          name="region"
          className="border rounded p-2 w-full cursor-pointer dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
          value={region}
          onChange={handleInputChange}
        >
          <option value="">Select Region</option>
          {regions.map((region) => (
            <option key={region} value={region}>{region}</option>
          ))}
        </select>
      </label>
    </div>
  );
};

Controls.propTypes = {
  onPaginationClick: PropTypes.func.isRequired
}

export default Controls;
