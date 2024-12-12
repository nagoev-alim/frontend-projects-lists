import { Head } from './components/layout/index.js';
import { CryptoMarketProvider, ModalProvider } from './context/index.js';
import { CryptoMarketData, ModalWindow } from './components/functional/index.js';
import { Toaster } from 'react-hot-toast';

/**
 * @function App
 * @description Функциональный компонент, представляющий основную структуру приложения.
 * Он включает в себя компонент Head для управления метаданными страницы и основной
 * компонент приложения CryptoMarketData.
 *
 * @returns {JSX.Element} Возвращает JSX разметку, содержащую структуру приложения.
 */
const App = () => {
  return (
    <CryptoMarketProvider>
      <ModalProvider>
        <Head
          title="Crypto Market Tracker"
          description="Track real-time cryptocurrency market data"
          keywords="cryptocurrency, bitcoin, market data, real-time updates"
        />
        <div className="grid place-items-start min-h-screen bg-neutral-50">
          <CryptoMarketData />
          <ModalWindow />
        </div>
        <Toaster />
      </ModalProvider>
    </CryptoMarketProvider>
  );
};

export default App;
