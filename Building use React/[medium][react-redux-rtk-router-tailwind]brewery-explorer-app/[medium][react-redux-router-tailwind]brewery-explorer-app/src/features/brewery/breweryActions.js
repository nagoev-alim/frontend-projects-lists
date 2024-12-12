import { createAsyncThunk } from '@reduxjs/toolkit';
import { breweryService } from '../../services';

/**
 * Константы для типов действий, связанных с пивоварнями.
 */
const FETCH_RANDOM = 'brewery/fetchRandom';
const FETCH_BY_ID = 'brewery/fetchById';
const SEARCH_BY_QUERY = 'brewery/searchByQuery';
const SEARCH_BY_COUNTRY = 'brewery/searchByCountry';
const SEARCH_BY_COUNTRY_AND_QUERY = 'brewery/searchByCountryAndQuery';

/**
 * Создает асинхронный thunk для действий, связанных с пивоварнями.
 * @param {string} type - Тип действия.
 * @param {Function} apiMethod - Метод API для выполнения запроса.
 * @returns {Function} Асинхронный thunk.
 */
const createBreweryThunk = (type, apiMethod) => createAsyncThunk(type, apiMethod);

/**
 * Объект, содержащий все действия, связанные с пивоварнями.
 * @type {Object.<string, Function>}
 */
const breweryActions = {
  /** Получение случайной пивоварни */
  fetchRandom: createBreweryThunk(FETCH_RANDOM, breweryService.fetchRandom),
  /** Получение пивоварни по ID */
  fetchById: createBreweryThunk(FETCH_BY_ID, breweryService.fetchById),
  /** Поиск пивоварен по запросу */
  searchByQuery: createBreweryThunk(SEARCH_BY_QUERY, breweryService.searchByQuery),
  /** Поиск пивоварен по стране */
  searchByCountry: createBreweryThunk(SEARCH_BY_COUNTRY, breweryService.searchByCountry),
  /** Поиск пивоварен по стране и запросу */
  searchByCountryAndQuery: createBreweryThunk(SEARCH_BY_COUNTRY_AND_QUERY, breweryService.searchByCountryAndQuery),
};

export default breweryActions;
