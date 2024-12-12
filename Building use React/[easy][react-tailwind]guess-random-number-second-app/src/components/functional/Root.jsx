import { useCallback, useRef, useState } from 'react';
import { getRandomNumber, showConfetti } from '@utils';

/**
 * Функция компонента игры "Угадай число".
 * @returns {JSX.Element} Компонент игры "Угадай число".
 */
function Root() {
  /**
   * Состояние и ссылки компонента игры "Угадай число".
   * @typedef {Object} GameState
   * @property {string|null} userGuess - Имя пользователя, вводится перед началом игры.
   * @property {Array<{number: number, message: string, isGuessed: boolean}>} guesses - Массив попыток угадывания числа.
   * @property {number} secretNumber - Загаданное число, которое нужно угадать.
   * @property {boolean} isFinished - Флаг, указывающий на завершение игры.
   * @property {React.RefObject<HTMLInputElement>} inputRef - Ссылка на элемент ввода.
   */
  const [userGuess, setUserGuess] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [secretNumber] = useState(() => getRandomNumber(1, 100));
  const [isFinished, setIsFinished] = useState(false);
  const inputRef = useRef(null);

  /**
   * Обрабатывает отправку формы для игры "Угадай число".
   * @description
   * Эта функция выполняет следующие действия:
   * 1. Предотвращает стандартное поведение отправки формы.
   * 2. Проверяет валидность введенных данных (имя пользователя или число).
   * 3. Обновляет состояние игры на основе введенных данных.
   * 4. Сравнивает введенное число с загаданным и обновляет список попыток.
   * 5. Завершает игру, если число угадано.
   * @throws {Error} Может выбросить исключение, если возникнут проблемы с доступом к DOM-элементам.
   */
  const handleFormSubmit = useCallback((e) => {
    e.preventDefault();
    const inputType = inputRef.current.type;
    const inputValue = inputRef.current.value.trim();

    if (inputValue.length === 0 && inputType === 'text' && !userGuess) {
      showToast('Please enter a valid input', 'error');
      return;
    }

    if (inputType === 'text' && userGuess === null) {
      setUserGuess(inputValue);
      inputRef.current.value = '';
      inputRef.current.focus();
      return;
    }

    const value = Number(inputValue);

    if (userGuess && (!Number.isFinite(value) || value < 0 || value > 100)) {
      showToast('Please enter a valid number between 0 and 100', 'error');
      inputRef.current.value = '';
      return;
    }

    if (inputType === 'number' && userGuess) {
      setGuesses(prevState => {
        const message = value > secretNumber
          ? 'Too high. Try again 😸'
          : value < secretNumber
            ? 'Too low. Try again 😸'
            : `🎊 Right. The number you've guessed: ${value}`;
        const isGuessed = value === secretNumber;
        if (isGuessed) {
          setIsFinished(true);
          showConfetti();
        }
        return [...prevState, { number: value, message, isGuessed }];
      });
    }

    inputRef.current.value = '';
    inputRef.current.focus();
  }, [secretNumber, userGuess]);

  return (
    <div className="grid gap-3 p-4 text-yellow-400 xl:text-2xl">
      <h1 className="text-2xl font-bold md:text-5xl">🎲 Guess number</h1>
      {userGuess !== null && (
        <p>😄 <span className="font-bold uppercase">{userGuess}</span>, there is a number between <span
          className="font-bold">0</span> and <span className="font-bold">100</span>. Try to
          guess it in the
          fewest number of tries. After each attempt, there will be a message with the text - <span
            className="font-bold uppercase">low</span> or <span className="font-bold uppercase">high</span>
        </p>
      )}

      {guesses.length !== 0 && (
        <ul className="grid gap-3">{guesses.map(({ number, message, isGuessed }, idx) =>
          <li className="grid gap-2" key={idx}>
            <p className="text-2xl font-medium">➡️ {number}</p>
            <p>{message}</p>
            {isGuessed && <p>🎉 Number of attempts: <span className="font-bold">{guesses.length}</span></p>}
          </li>,
        )}
        </ul>
      )}
      {!isFinished && (
        <form onSubmit={handleFormSubmit}>
          <label>
            <input
              className="border-b-2 border-yellow-400 bg-transparent px-3 py-2.5 outline-none"
              type={!userGuess ? 'text' : 'number'}
              name={!userGuess ? 'name' : 'guess'}
              placeholder={!userGuess ? '👋 Enter your name' : 'Enter number'}
              ref={inputRef}
              autoFocus
            />
          </label>
        </form>
      )}
    </div>
  );
}

export default Root;
