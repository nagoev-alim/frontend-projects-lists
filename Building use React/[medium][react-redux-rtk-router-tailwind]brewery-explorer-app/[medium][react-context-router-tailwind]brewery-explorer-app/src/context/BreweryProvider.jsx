import { useEffect, useMemo, useReducer } from 'react';
import PropTypes from 'prop-types';
import { breweryActions, BreweryContext, breweryReducer } from './index';

/**
 * Начальное состояние для контекста пивоварен.
 * @type {Object}
 */
const initialState = {
  isLoading: false,
  isError: false,
  breweryList: [],
  filteredList: [],
  selectedBrewery: null,
};

/**
 * Провайдер контекста пивоварен.
 * 
 * @component
 * @param {Object} props - Свойства компонента.
 * @param {React.ReactNode} props.children - Дочерние элементы, которые будут обернуты провайдером.
 * 
 * @returns {JSX.Element} Провайдер контекста с предоставленным значением.
 * 
 * @description
 * Этот компонент создает контекст для управления состоянием пивоварен и действиями, связанными с ними.
 * Он использует useReducer для управления состоянием и useMemo для оптимизации производительности при создании действий.
 * При монтировании компонента, он автоматически запрашивает случайные пивоварни.
 */
const BreweryProvider = ({ children }) => {
  // Инициализация состояния с использованием редюсера
  const [state, dispatch] = useReducer(breweryReducer, initialState);

  // Мемоизация действий для оптимизации производительности
  const actions = useMemo(() => {
    return Object.keys(breweryActions).reduce((acc, key) => {
      // Привязка dispatch к каждому действию
      acc[key] = (...args) => breweryActions[key](dispatch, ...args);
      return acc;
    }, {});
  }, []);

  // Эффект для загрузки случайных пивоварен при монтировании компонента
  useEffect(() => {
    (async () => {
      await actions.fetchRandomBreweries();
    })();
  }, [actions]);

  // Рендеринг провайдера с объединенным состоянием и действиями
  return (
    <BreweryContext.Provider value={{
      ...state,
      ...actions,
    }}>
      {children}
    </BreweryContext.Provider>
  );
};

// Определение типов пропсов для компонента
BreweryProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default BreweryProvider;
