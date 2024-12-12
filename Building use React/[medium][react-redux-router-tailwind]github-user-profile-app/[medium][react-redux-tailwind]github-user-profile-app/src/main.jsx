import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import './index.css';
import App from './App';

/**
 * Точка входа в приложение
 * Рендерит корневой компонент приложения с необходимыми обертками
 */

/**
 * Создает корневой элемент React и рендерит приложение
 * @function
 * @name renderApp
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Оборачиваем приложение в StrictMode для выявления потенциальных проблем */}
    <Provider store={store}>
      {/* Предоставляем доступ к Redux store всему приложению */}
      <PersistGate loading={null} persistor={persistor}>
        {/* Оборачиваем в PersistGate для поддержки персистентного состояния */}
        <App />
        {/* Рендерим основной компонент приложения */}
      </PersistGate>
    </Provider>
  </StrictMode>,
);
