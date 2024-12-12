import { combineReducers } from '@reduxjs/toolkit';
import { breweryReducer as brewery } from '../features/brewery';

/**
 * Корневой редуктор приложения.
 * Объединяет все редукторы функций в один общий редуктор.
 *
 * @type {import('@reduxjs/toolkit').Reducer}
 */
const rootReducer = combineReducers({
  brewery, // Редуктор для функционала, связанного с пивоварнями
});

export default rootReducer;
