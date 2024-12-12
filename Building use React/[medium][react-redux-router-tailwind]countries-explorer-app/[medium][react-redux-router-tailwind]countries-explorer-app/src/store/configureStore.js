/**
 * @fileoverview Конфигурация хранилища Redux с поддержкой персистентности
 * @module configureStore
 */

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { countriesReducer as countries } from '../features/countries';
import { themeReducer as theme } from '../features/theme';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

/**
 * Конфигурация для Redux Persist
 * @type {Object}
 * @property {string} key - Ключ, под которым будет сохраняться состояние
 * @property {Object} storage - Объект хранилища (по умолчанию localStorage)
 * @property {string[]} whitelist - Массив ключей редьюсеров, которые нужно сохранять
 */
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['countries', 'theme'],
};

/**
 * Корневой редьюсер, объединяющий все редьюсеры приложения
 * @type {Function}
 */
const rootReducer = combineReducers({
  countries,
  theme,
});

/**
 * Обернутый в persistReducer корневой редьюсер для поддержки персистентности
 * @type {Function}
 */
const persistedReducer = persistReducer(persistConfig, rootReducer);

/**
 * Настроенное хранилище Redux
 * @type {Object}
 */
export const store = configureStore({
  reducer: persistedReducer,
  devTools: process.env.NODE_ENV !== 'production', // Включаем DevTools только в режиме разработки
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Игнорируем некоторые actions для корректной работы с redux-persist
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

/**
 * Персистор для сохранения и восстановления состояния Redux
 * @type {Object}
 */
export const persistor = persistStore(store);
