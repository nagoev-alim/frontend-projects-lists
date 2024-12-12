/**
 * @module CountriesProvider
 * @description Модуль, предоставляющий провайдер контекста для управления данными о странах в приложении.
 * 
 * @requires PropTypes
 * @requires react
 * @requires ../index.js
 */

import PropTypes from 'prop-types';
import { countriesActions, CountriesContext, countriesReducer } from '../index.js';
import { useEffect, useReducer } from 'react';

/**
 * @constant {Array} items
 * @description Массив стран, полученный из локального хранилища или пустой массив, если данные отсутствуют.
 */
const items = JSON.parse(localStorage.getItem('countries')) || [];

/**
 * @constant {Object} initialState
 * @description Начальное состояние для редюсера стран.
 * @property {Array} items - Массив всех стран.
 * @property {Object|null} singleItem - Информация об отдельной стране.
 * @property {Array} itemBorders - Массив границ для выбранной страны.
 * @property {Array} filteredItems - Отфильтрованный массив стран.
 * @property {boolean} isLoading - Флаг, указывающий на процесс загрузки данных.
 * @property {boolean} isError - Флаг, указывающий на наличие ошибки.
 */
const initialState = {
  items,
  singleItem: null,
  itemBorders: [],
  filteredItems: [],
  isLoading: false,
  isError: false,
};

/**
 * @function CountriesProvider
 * @description Компонент-провайдер контекста для управления данными о странах.
 * 
 * @param {Object} props - Свойства компонента.
 * @param {React.ReactNode} props.children - Дочерние элементы, которые будут обернуты провайдером.
 * 
 * @returns {React.Component} Провайдер контекста с данными о странах.
 */
const CountriesProvider = ({ children }) => {
  /**
   * @constant {Array} states
   * @constant {Function} dispatch
   * @description Использование хука useReducer для управления состоянием стран.
   */
  const [states, dispatch] = useReducer(countriesReducer, initialState);

  /**
   * @function
   * @description Эффект для загрузки данных о странах при монтировании компонента.
   * Использует countriesActions.fetchAllCountries для получения данных.
   */
  useEffect(() => {
    (async () => {
      await countriesActions.fetchAllCountries(dispatch);
    })();
  }, []);

  return (
    <CountriesContext.Provider value={{
      ...states,
      dispatch,
    }}>
      {children}
    </CountriesContext.Provider>
  );
};

CountriesProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default CountriesProvider;
