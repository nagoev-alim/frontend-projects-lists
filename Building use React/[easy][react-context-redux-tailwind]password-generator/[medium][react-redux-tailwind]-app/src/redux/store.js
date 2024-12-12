/**
 * @fileoverview Конфигурация Redux store с поддержкой персистентности
 */

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { passwordReducer as password } from '@redux';

/**
 * Конфигурация для redux-persist
 * @type {Object}
 * @property {string} key - Ключ, под которым будет сохраняться состояние в хранилище
 * @property {Object} storage - Объект хранилища (по умолчанию localStorage)
 * @property {string[]} whitelist - Массив ключей редьюсеров, которые нужно сохранять
 */
const persistConfig = {
  key: 'root',
  storage,
  whitelist: [], // Пустой массив означает, что ничего не будет сохраняться персистентно
};

/**
 * Корневой редьюсер, объединяющий все редьюсеры приложения
 * @type {Function}
 */
const rootReducer = combineReducers({ password });

/**
 * Персистентный редьюсер, обернутый в persistReducer
 * @type {Function}
 */
const persistedReducer = persistReducer(persistConfig, rootReducer);

/**
 * Конфигурация и создание Redux store
 * @type {Object}
 */
export const store = configureStore({
  reducer: persistedReducer,
  devTools: process.env.NODE_ENV !== 'production', // Включение Redux DevTools только в режиме разработки
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Игнорирование определенных действий при проверке на сериализуемость
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

/**
 * Персистор для сохранения и восстановления состояния Redux store
 * @type {Object}
 */
export const persistor = persistStore(store);
