import { configureStore } from '@reduxjs/toolkit';
import { postsApi } from '@/features/posts/postsApi.ts';

// Конфигурация хранилища Redux
export const store = configureStore({
  reducer: {
    [postsApi.reducerPath]: postsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(postsApi.middleware)
});

// Экспорт типов для использования в других частях приложения
