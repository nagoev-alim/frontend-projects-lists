/**
 * @module useAppContext
 * @description Модуль, содержащий пользовательский хук для доступа к контексту приложения.
 * Этот модуль предоставляет централизованный способ доступа к глобальному состоянию
 * и функциям для его обновления в рамках всего приложения.
 */

import { useContext } from 'react';
import { AppContext } from '../context/index.js';

/**
 * @function useAppContext
 * @description Пользовательский хук для доступа к контексту приложения.
 *
 * @throws {Error} Выбрасывает ошибку, если хук используется вне провайдера AppProvider.
 *
 * @returns {Object} Объект контекста приложения, содержащий:
 *   - state {Object} - текущее состояние приложения
 *   - dispatch {Function} - функция для отправки действий и обновления состояния
 */
const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export default useAppContext;
