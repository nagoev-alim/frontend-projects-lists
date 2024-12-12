/**
 * @fileoverview Точка входа в приложение React
 * @module main
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import './index.css';
import App from './App';

/**
 * Рендеринг корневого компонента приложения
 * 
 * @function
 * @name renderApp
 * @description Создает корневой элемент React и рендерит приложение с настройками Redux и Redux Persist
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Оборачиваем приложение в Provider для доступа к Redux store */}
    <Provider store={store}>
      {/* Используем PersistGate для синхронизации состояния с localStorage */}
      <PersistGate loading={null} persistor={persistor}>
        {/* Рендерим основной компонент приложения */}
        <App />
      </PersistGate>
    </Provider>
  </StrictMode>,
);
