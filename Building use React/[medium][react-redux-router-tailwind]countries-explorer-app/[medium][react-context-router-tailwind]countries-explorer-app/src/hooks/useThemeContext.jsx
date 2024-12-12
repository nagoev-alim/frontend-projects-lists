/**
 * @module useThemeContext
 * @description Модуль, предоставляющий хук для доступа к контексту темы приложения.
 */

import { useContext } from 'react';
import { ThemeContext } from '../context/index.js';

/**
 * @function useThemeContext
 * @description Хук для получения доступа к контексту темы приложения.
 * 
 * @throws {Error} Выбрасывает ошибку, если хук используется вне компонента ThemeProvider.
 * 
 * @returns {Object} Объект контекста темы, содержащий текущее состояние темы и функции для её изменения.
 */
const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within an ThemeProvider');
  }
  return context;
};

export default useThemeContext;
