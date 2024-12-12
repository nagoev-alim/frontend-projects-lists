import {configureStore} from '@reduxjs/toolkit';
import rootReducer from './rootReducer';

const store = configureStore({
    reducer: rootReducer,
    devTools: true,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({}),
});

export default store;
