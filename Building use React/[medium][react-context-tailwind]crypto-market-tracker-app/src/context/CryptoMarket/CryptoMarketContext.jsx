/**
 * @module CryptoMarketContext
 * @description Модуль, содержащий контекст для управления данными криптовалютного рынка.
 * @requires react
 */

import { createContext } from 'react';

/**
 * @constant {React.Context} CryptoMarketContext
 * @description Контекст React для хранения и предоставления данных о криптовалютном рынке.
 * 
 * @remarks
 * Этот контекст используется для передачи данных и функций, связанных с криптовалютным рынком,
 * через дерево компонентов без необходимости передавать пропсы на каждом уровне.
 * 
 * Начальное значение контекста установлено как null. Фактические данные и функции
 * будут предоставлены через CryptoMarketProvider (не показан в данном фрагменте кода).
 */
const CryptoMarketContext = createContext(null);

export default CryptoMarketContext;
