/**
 * @module AppContext
 * @description Модуль, создающий и экспортирующий контекст приложения.
 * Этот контекст используется для передачи глобального состояния
 * и функций через дерево компонентов без необходимости передавать пропсы
 * на каждом уровне вручную.
 */

import { createContext } from 'react';

/**
 * @typedef {Object} AppContextType
 * @property {Object} state - Глобальное состояние приложения
 * @property {function} dispatch - Функция для отправки действий и обновления состояния
 */

/**
 * Контекст приложения
 * @type {React.Context<AppContextType|null>}
 */
const AppContext = createContext(null);

export default AppContext;
