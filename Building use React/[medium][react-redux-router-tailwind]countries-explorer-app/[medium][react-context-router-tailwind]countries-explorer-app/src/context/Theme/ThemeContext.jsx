/**
 * @module ThemeContext
 * @description Модуль, создающий контекст для управления темой приложения.
 */

import { createContext } from 'react';

/**
 * @constant {React.Context} ThemeContext
 * @description Контекст React для хранения и предоставления данных о теме приложения.
 * Инициализирован значением null, которое должно быть заменено при использовании провайдера.
 */
const ThemeContext = createContext(null);

export default ThemeContext;
