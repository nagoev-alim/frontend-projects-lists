import './App.css';
import { Head } from './components/layout/index.js';
import { MemoryMatchingGame } from './components/functional/index.js';

/**
 * @function App
 * @description Функциональный компонент, представляющий основную структуру приложения.
 * Он включает в себя компонент Head для управления метаданными страницы и основной
 * компонент приложения MemoryMatchingGame.
 *
 * @returns {JSX.Element} Возвращает JSX разметку, содержащую структуру приложения.
 */
const App = () => {
  return (
    <>
      <Head
        title="Memory Matching Game: Brain Training"
        description="An engaging memory game where you match pairs of cards to challenge and improve your memory skills."
        keywords="memory game, brain training, card matching, cognitive skills, puzzle game"
      />
      <div className="grid place-items-center min-h-screen p-2 bg-neutral-100">
        <MemoryMatchingGame />
      </div>
    </>
  );
};

export default App;
