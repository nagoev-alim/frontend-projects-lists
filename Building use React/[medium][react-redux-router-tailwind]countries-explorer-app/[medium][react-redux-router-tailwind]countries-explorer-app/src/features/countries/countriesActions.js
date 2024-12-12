import { createAsyncThunk } from '@reduxjs/toolkit';
import { countriesService } from '../../services';

/**
 * Константа для действия получения всех стран.
 * @type {string}
 */
const FETCH_ALL_COUNTRIES = 'countries/fetchRandom';

/**
 * Константа для действия получения страны по имени.
 * @type {string}
 */
const FETCH_COUNTRY_BY_NAME = 'countries/fetchCountryByName';

/**
 * Функция для создания асинхронного thunk'а.
 * @param {string} type - Тип действия.
 * @param {Function} apiMethod - Метод API для выполнения запроса.
 * @returns {Function} Асинхронный thunk.
 */
const createCountriesThunk = (type, apiMethod) => createAsyncThunk(type, apiMethod);

/**
 * Объект, содержащий асинхронные действия для работы со странами.
 * @type {Object}
 */
const countriesActions = {
  /**
   * Действие для получения всех стран.
   * @type {Function}
   */
  fetchAllCountries: createCountriesThunk(FETCH_ALL_COUNTRIES, countriesService.fetchAllCountries),

  /**
   * Действие для получения страны по имени.
   * @type {Function}
   */
  fetchCountryByName: createCountriesThunk(FETCH_COUNTRY_BY_NAME, countriesService.fetchCountryByName),
};

export default countriesActions;
