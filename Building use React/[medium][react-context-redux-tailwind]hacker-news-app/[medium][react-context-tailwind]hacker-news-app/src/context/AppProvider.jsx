/**
 * @module AppProvider
 * @description Модуль, обеспечивающий глобальное состояние приложения с использованием React Context API.
 * Он управляет данными, связанными с поиском и пагинацией, и предоставляет эти данные дочерним компонентам.
 */

import { useEffect, useReducer } from 'react';
import { reducer, AppContext, appActions } from './index.js';
import PropTypes from 'prop-types';

/**
 * Начальное состояние приложения.
 * @type {Object}
 * @property {boolean} isLoading - Флаг, указывающий на загрузку данных.
 * @property {boolean} isError - Флаг, указывающий на наличие ошибки.
 * @property {Array} hits - Массив результатов поиска.
 * @property {string} query - Текущий поисковый запрос.
 * @property {number} page - Текущая страница результатов.
 * @property {number} nbPages - Общее количество страниц результатов.
 */
const initialState = {
  isLoading: true,
  isError: false,
  hits: [],
  query: 'react',
  page: 0,
  nbPages: 0,
};

/**
 * @function AppProvider
 * @description Компонент-провайдер, который оборачивает приложение и предоставляет глобальное состояние через контекст.
 *
 * @param {Object} props - Свойства компонента.
 * @param {React.ReactNode} props.children - Дочерние компоненты, которые будут иметь доступ к контексту.
 *
 * @returns {JSX.Element} React элемент, представляющий провайдер контекста.
 */
const AppProvider = ({ children }) => {
  /**
   * Использование хука useReducer для управления сложным состоянием приложения.
   * @type {[Object, Function]}
   */
  const [state, dispatch] = useReducer(reducer, initialState);

  /**
   * Эффект для загрузки данных при изменении страницы или поискового запроса.
   * Оптимизирует производительность, предотвращая ненужные запросы.
   */
  useEffect(() => {
    appActions.fetchData(dispatch, state.query, state.page);
  }, [state.page, state.query]);

  /**
   * Объект, содержащий все значения, которые будут доступны через контекст.
   * @type {Object}
   */
  const values = {
    isLoading: state.isLoading,
    isError: state.isError,
    hits: state.hits,
    query: state.query,
    page: state.page,
    nbPages: state.nbPages,
    dispatch,
  };

  return (
    <AppContext.Provider value={values}>
      {children}
    </AppContext.Provider>
  );
};

AppProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AppProvider;
