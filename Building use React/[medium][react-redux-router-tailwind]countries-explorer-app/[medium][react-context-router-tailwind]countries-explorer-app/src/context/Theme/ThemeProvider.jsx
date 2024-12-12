/**
 * @module ThemeProvider
 * @description Модуль, предоставляющий провайдер темы для приложения.
 */

import { useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { ThemeContext, themeReducer } from '../index.js';

/**
 * @function ThemeProvider
 * @description Компонент-провайдер для управления темой приложения.
 * 
 * @param {Object} props - Свойства компонента.
 * @param {React.ReactNode} props.children - Дочерние элементы, которые будут обернуты провайдером.
 * 
 * @returns {React.ReactElement} Провайдер контекста темы с дочерними элементами.
 */
const ThemeProvider = ({ children }) => {
  /**
   * @constant {Array} [state, dispatch]
   * @description Состояние и функция dispatch, полученные с помощью хука useReducer.
   * Начальное состояние берется из localStorage или устанавливается как 'light'.
   */
  const [state, dispatch] = useReducer(themeReducer, {
    theme: localStorage.getItem('theme') ?? 'light',
  });

  /**
   * @function
   * @description Эффект для применения темы к документу.
   * Добавляет или удаляет класс 'dark' у корневого элемента HTML в зависимости от текущей темы.
   */
  useEffect(() => {
    const action = state.theme === 'dark' ? 'add' : 'remove';
    document.documentElement.classList[action]('dark');
  }, [state.theme]);

  return (
    <ThemeContext.Provider value={{ ...state, dispatch }}>
      {children}
    </ThemeContext.Provider>
  );
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ThemeProvider;
