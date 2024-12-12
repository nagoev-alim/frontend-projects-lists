/**
 * @module useCountriesContext
 * @description Модуль, предоставляющий хук для доступа к контексту стран в приложении.
 */

import { useContext } from 'react';
import { CountriesContext } from '../context/index.js';

/**
 * @function useCountriesContext
 * @description Хук для получения доступа к контексту стран.
 * 
 * @throws {Error} Выбрасывает ошибку, если хук используется вне компонента CountriesProvider.
 * 
 * @returns {Object} Объект контекста стран, содержащий данные о странах и функции для их управления.
 */
const useCountriesContext = () => {
  const context = useContext(CountriesContext);
  if (context === undefined) {
    throw new Error('useCountriesContext must be used within an CountriesProvider');
  }
  return context;
};

export default useCountriesContext;
