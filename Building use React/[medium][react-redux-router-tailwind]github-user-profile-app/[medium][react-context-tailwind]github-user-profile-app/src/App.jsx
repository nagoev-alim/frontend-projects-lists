import { Head } from './components/layout/index.js';
import { GitHubUserSearcher } from './components/functional/index.js';
import { AppProvider } from './context/index.js';

/**
 * @function App
 * @description Функциональный компонент, представляющий основную структуру приложения.
 * Он включает в себя компонент Head для управления метаданными страницы и
 * компонент GitHubUserSearcher для поиска профилей пользователей GitHub.
 *
 * @returns {JSX.Element} Возвращает JSX разметку, содержащую структуру приложения.
 */
const App = () => {
  return (
    <AppProvider>
      <Head
        title="GitHub Profile Searcher"
        description="Search and view GitHub profiles with real-time updates."
        keywords="GitHub, search, profile, real-time updates"
      />
      <div className="grid place-items-center min-h-screen p-2 bg-neutral-50">
        <GitHubUserSearcher />
      </div>
    </AppProvider>
  );
};

export default App;
