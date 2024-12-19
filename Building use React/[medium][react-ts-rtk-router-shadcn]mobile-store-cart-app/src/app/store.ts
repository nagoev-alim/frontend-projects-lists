import { configureStore } from '@reduxjs/toolkit';
import { mobilesApi } from '../features/mobiles/mobilesApi';
import { cartSlice } from '../features/cart/cartSlice';

export const store = configureStore({
  reducer: {
    [mobilesApi.reducerPath]: mobilesApi.reducer,
    cart: cartSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({}).concat(mobilesApi.middleware),
});
