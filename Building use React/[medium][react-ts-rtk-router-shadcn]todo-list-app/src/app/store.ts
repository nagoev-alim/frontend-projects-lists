import { configureStore } from '@reduxjs/toolkit';
import { todosApi } from '@/features/todos/todosApi.ts';

export const store = configureStore({
  reducer: {
    [todosApi.reducerPath]: todosApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(todosApi.middleware),
});
