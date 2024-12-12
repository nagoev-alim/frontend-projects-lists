/**
 * @module CountriesContext
 * @description Модуль, создающий контекст для управления данными о странах в приложении.
 */

import { createContext } from 'react';

/**
 * @constant {React.Context} CountriesContext
 * @description Контекст React для хранения и передачи данных о странах между компонентами.
 * Инициализируется со значением null. Предполагается, что провайдер этого контекста
 * будет предоставлять необходимые данные и функции для работы с информацией о странах.
 */
const CountriesContext = createContext(null);

export default CountriesContext;
