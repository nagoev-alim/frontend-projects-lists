import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { drinksSlice } from '@features/drinks/drinksSlice';

const rootReducer = combineReducers({
  drinks: drinksSlice.reducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false,
    immutableCheck: false,
  }),
});
