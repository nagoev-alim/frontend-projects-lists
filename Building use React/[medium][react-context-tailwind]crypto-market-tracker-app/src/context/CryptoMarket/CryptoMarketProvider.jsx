/**
 * @module CryptoMarketProvider
 * @description Модуль, содержащий провайдер контекста для управления данными криптовалютного рынка.
 */

import { useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { cryptoMarketActions, CryptoMarketContext, cryptoMarketReducer } from '../index.js';

/**
 * @constant {Object} initialState
 * @description Начальное состояние для редюсера криптовалютного рынка.
 */
const initialState = {
  isLoading: false,
  isError: false,
  items: [],
  sortType: 'price_change_percentage_24h',
  sortOrder: 'DESC',
};

/**
 * @function CryptoMarketProvider
 * @description Компонент-провайдер для контекста криптовалютного рынка.
 *
 * @param {Object} props - Свойства компонента.
 * @param {React.ReactNode} props.children - Дочерние элементы, которые будут обернуты провайдером.
 *
 * @returns {React.ReactElement} Возвращает провайдер контекста с переданными дочерними элементами.
 *
 * @description
 * Компонент использует следующие хуки:
 * - useReducer: для управления состоянием криптовалютного рынка.
 * - useEffect: для загрузки начальных данных при монтировании компонента.
 *
 * Структура данных:
 * - isLoading: флаг, указывающий на процесс загрузки данных.
 * - isError: флаг, указывающий на наличие ошибки.
 * - items: массив объектов с данными о криптовалютах.
 * - sortType: тип сортировки данных.
 * - sortOrder: порядок сортировки (по возрастанию или убыванию).
 *
 * Оптимизация производительности:
 * - Использование useReducer для эффективного управления сложным состоянием.
 * - Мемоизация значения контекста для предотвращения ненужных ре-рендеров.
 * - Использование useEffect с пустым массивом зависимостей для загрузки данных только при монтировании.
 */
const CryptoMarketProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cryptoMarketReducer, initialState);

  useEffect(() => {
    (async () => {
      await cryptoMarketActions.fetchData(dispatch);
    })();
  }, []);

  return (
    <CryptoMarketContext.Provider value={{
      isLoading: state.isLoading,
      isError: state.isError,
      items: state.items,
      sortType: state.sortType,
      sortOrder: state.sortOrder,
      dispatch,
    }}>
      {children}
    </CryptoMarketContext.Provider>
  );
};

CryptoMarketProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default CryptoMarketProvider;
