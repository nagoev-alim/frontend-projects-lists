import { useContext } from 'react';
import { BreweryContext } from '../context/index';

/**
 * @module useBreweryContext
 * @description Пользовательский хук для доступа к контексту пивоварен.
 * @throws {Error} Выбрасывает ошибку, если хук используется вне провайдера BreweryProvider.
 * @returns {Object} Возвращает объект контекста пивоварен, содержащий состояние и функции для работы с данными о пивоварнях.
 */
const useBreweryContext = () => {
  const context = useContext(BreweryContext);
  if (context === undefined) {
    throw new Error('useBreweryContext must be used within an BreweryProvider');
  }
  return context;
};

export default useBreweryContext;
