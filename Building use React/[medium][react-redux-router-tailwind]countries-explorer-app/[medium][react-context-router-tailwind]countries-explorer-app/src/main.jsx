/**
 * @module main
 * @description Этот модуль является точкой входа для React-приложения. Он отвечает за рендеринг
 * корневого компонента App в DOM и настройку строгого режима React.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'
import App from './App.jsx';

/**
 * @function
 * @description Основная функция, которая инициализирует и рендерит приложение.
 * Она создает корневой элемент React, оборачивает приложение в StrictMode
 * и рендерит его в DOM-элемент с id 'root'.
 * 
 * @returns {void}
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
