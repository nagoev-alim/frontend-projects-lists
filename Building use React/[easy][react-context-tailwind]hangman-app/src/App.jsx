import { Toaster } from 'react-hot-toast';
import { Hangman } from './components/functional/index';
import { Head } from './components/layout/index';
import { HangmanProvider } from './context/index';

/**
 * @function App
 * @description Функциональный компонент, представляющий основную структуру приложения.
 * Он включает в себя компонент Head для управления метаданными страницы и основной
 * компонент приложения Hangman.
 *
 * @returns {JSX.Element} Возвращает JSX разметку, содержащую структуру приложения.
 */
const App = () => (
  <HangmanProvider>
    <Head
      title="Hangman Game | Guess the Word"
      description="Exciting online Hangman game. Try to guess the word by choosing letters. Improve your vocabulary and logical thinking!"
      keywords="hangman, word game, guess the word, online game, logic game, vocabulary building"
    />
    <div className="grid place-items-center min-h-screen p-2 bg-neutral-100">
      <Hangman />
      <Toaster />
    </div>
  </HangmanProvider>
);

export default App;
