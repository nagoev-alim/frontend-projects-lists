import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { githubReducer as github } from '../features/github';
import { themeReducer as theme } from '../features/theme';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

/**
 * @typedef {Object} PersistConfig
 * @property {string} key - Ключ, под которым будет сохраняться состояние
 * @property {Object} storage - Объект хранилища для сохранения состояния
 * @property {string[]} whitelist - Массив ключей редьюсеров, которые нужно сохранять
 */

/**
 * Конфигурация для redux-persist
 * @type {PersistConfig}
 */
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['theme'], // Сохраняем только состояние темы
};

/**
 * Корневой редьюсер, объединяющий все редьюсеры приложения
 * @type {import('@reduxjs/toolkit').Reducer}
 */
const rootReducer = combineReducers({
  github,
  theme,
});

/**
 * Обернутый персистентный редьюсер
 * @type {import('redux-persist').Persistor}
 */
const persistedReducer = persistReducer(persistConfig, rootReducer);

/**
 * Конфигурация и создание Redux store
 * @type {import('@reduxjs/toolkit').EnhancedStore}
 */
export const store = configureStore({
  reducer: persistedReducer,
  devTools: process.env.NODE_ENV !== 'production', // Включаем DevTools только в режиме разработки
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Игнорируем действия redux-persist при проверке на сериализуемость
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

/**
 * Персистор для сохранения и восстановления состояния Redux
 * @type {import('redux-persist').Persistor}
 */
export const persistor = persistStore(store);
