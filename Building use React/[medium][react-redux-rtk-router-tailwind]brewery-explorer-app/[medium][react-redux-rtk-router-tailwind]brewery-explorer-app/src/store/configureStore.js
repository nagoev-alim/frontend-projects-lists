import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { breweryApi } from '@services';
import { breweryReducer } from '@features';

// Конфигурация Redux store
export const store = configureStore({
  reducer: {
    [breweryApi.reducerPath]: breweryApi.reducer,
    brewery: breweryReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().concat(breweryApi.middleware),
});

// Настройка слушателей для RTK Query
setupListeners(store.dispatch);
