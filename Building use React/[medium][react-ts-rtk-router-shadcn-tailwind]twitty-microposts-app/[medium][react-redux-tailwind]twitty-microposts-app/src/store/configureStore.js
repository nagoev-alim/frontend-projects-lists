/**
 * @description Модуль для настройки хранилища Redux с поддержкой персистентности.
 * Этот модуль объединяет редьюсеры, настраивает middleware и создает персистентное хранилище.
 */

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE } from 'redux-persist/es/constants';
import { rootReducer as root } from '@features';

/**
 * Конфигурация и создание хранилища Redux.
 * @description Создает хранилище Redux с персистентностью для определенных срезов состояния.
 * Настраивает middleware для обработки асинхронных действий и игнорирования несериализуемых значений.
 * @returns {Object} Сконфигурированное хранилище Redux.
 */
export const store = configureStore({
  reducer: persistReducer({
      key: 'root',
      storage,
      whitelist: [], // Только состояние аутентификации будет сохраняться
    },
    combineReducers({ root })),
  devTools: process.env.NODE_ENV !== 'production',
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: {
      ignoreActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
    },
  }),
});

/**
 * Создание персистора для хранилища Redux.
 * @description Создает объект персистора, который управляет сохранением и восстановлением состояния.
 */
export const persistor = persistStore(store);
