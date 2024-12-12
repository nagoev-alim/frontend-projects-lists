import { Head } from './components/layout/index.js';
import { AppProvider } from './context/index.js';
import { HackerNews } from './components/functional/index.js';
import { Toaster } from 'react-hot-toast';

/**
 * @function App
 * @description Функциональный компонент, представляющий основную структуру приложения.
 * Он включает в себя компонент Head для управления метаданными страницы и основной
 * компонент HackerNews приложения.
 *
 * @returns {JSX.Element} Возвращает JSX разметку, содержащую структуру приложения.
 */
const App = () => {
  return (
    <AppProvider>
      <Head
        title="Hacker News Reader"
        description="Современное приложение для чтения новостей с Hacker News, построенное на React с использованием контекста"
        keywords="hacker news, react, context api, новости технологий, программирование"
      />
      <div className="grid place-items-start min-h-screen bg-neutral-50">
        <HackerNews />
      </div>
      <Toaster />
    </AppProvider>
  );
};

export default App;
