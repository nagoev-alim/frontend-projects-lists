import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { filtersSlice } from '../features/filters/filtersSlice';
import { positionsSlice } from '../features/positions/positionsSlice';

const rootReducer = combineReducers({
  filters: filtersSlice.reducer,
  positions: positionsSlice.reducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false,
    immutableCheck: false,
  }),
});
