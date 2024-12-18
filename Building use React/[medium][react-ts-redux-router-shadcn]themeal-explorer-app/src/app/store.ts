import { configureStore } from '@reduxjs/toolkit';
import { mealsApi } from '@features/meals/mealsApi';

export const store = configureStore({
  reducer: {
    [mealsApi.reducerPath]: mealsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(mealsApi.middleware)
});
