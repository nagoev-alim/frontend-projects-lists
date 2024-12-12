import { configureStore } from '@reduxjs/toolkit';
import { usersApi } from '../features/users/usersApi';

// Конфигурация хранилища Redux
export const store = configureStore({
  reducer: {
    [usersApi.reducerPath]: usersApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(usersApi.middleware),
});

// Экспорт типов для использования в других частях приложения
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
