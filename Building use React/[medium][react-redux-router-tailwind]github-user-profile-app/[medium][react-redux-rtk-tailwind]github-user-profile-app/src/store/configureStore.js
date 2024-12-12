import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { breweryApi } from '@services';
import { themeReducer, githubReducer } from '@features';
import githubApi from '@services/github.js';

// Конфигурация Redux store
export const store = configureStore({
  reducer: {
    [githubApi.reducerPath]: githubApi.reducer,
    theme: themeReducer,
    github: githubReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().concat(breweryApi.middleware),
});

// Настройка слушателей для RTK Query
setupListeners(store.dispatch);
