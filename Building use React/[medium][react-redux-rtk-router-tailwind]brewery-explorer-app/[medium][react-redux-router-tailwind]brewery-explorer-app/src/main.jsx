import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './store';
import './index.css';
import App from './App';

/**
 * Создает корневой элемент React и рендерит приложение.
 *
 * @function
 * @name renderApp
 * @description Использует createRoot для рендеринга приложения в режиме concurrent mode.
 * Оборачивает приложение в StrictMode для выявления потенциальных проблем
 * и в Provider для обеспечения доступа к Redux store.
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
);
