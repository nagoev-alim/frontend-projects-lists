import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { postsReducer as posts } from '../features/posts';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

/**
 * Конфигурация для redux-persist.
 * @typedef {Object} PersistConfig
 * @property {string} key - Ключ, под которым будет сохраняться состояние.
 * @property {Object} storage - Объект хранилища для сохранения состояния.
 * @property {string[]} whitelist - Массив ключей редьюсеров, которые нужно сохранять.
 */

/**
 * Конфигурация персистентности для Redux store.
 * @type {PersistConfig}
 */
const persistConfig = {
  key: 'root',
  storage,
  whitelist: [], // Сохраняем только состояние темы
};

/**
 * Корневой редьюсер, объединяющий все редьюсеры приложения.
 * @type {import('@reduxjs/toolkit').Reducer}
 */
const rootReducer = combineReducers({
  posts,
});

/**
 * Персистентный редьюсер, обёрнутый redux-persist.
 * @type {import('redux-persist').Persistor}
 */
const persistedReducer = persistReducer(persistConfig, rootReducer);

/**
 * Настроенный Redux store с поддержкой персистентности.
 * @type {import('@reduxjs/toolkit').EnhancedStore}
 */
export const store = configureStore({
  reducer: persistedReducer,
  devTools: process.env.NODE_ENV !== 'production', // Включаем DevTools только в разработке
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Игнорируем действия redux-persist при проверке на сериализуемость
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

/**
 * Персистор для сохранения и восстановления состояния Redux store.
 * @type {import('redux-persist').Persistor}
 */
export const persistor = persistStore(store);
