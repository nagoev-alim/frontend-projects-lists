import { useCallback, useEffect, useRef, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { getRandomNumber, showConfetti, showToast } from '@utils';
import { Button, Input } from '@ui';

/**
 * @function Root
 * @description Компонент игры "Угадай число". Управляет состоянием игры и рендерит пользовательский интерфейс.
 * @returns {JSX.Element} Возвращает JSX элемент, представляющий интерфейс игры.
 */
function Root() {
  /**
   * @constant {string} inputValue - Текущее значение введенное пользователем.
   * @constant {boolean} isFinished - Флаг, указывающий завершена ли игра.
   * @constant {number} randomNumber - Случайное число, которое нужно угадать.
   * @constant {number} attemptsLeft - Количество оставшихся попыток.
   * @constant {boolean} isDisableForm - Флаг, указывающий заблокирована ли форма ввода.
   * @constant {React.RefObject} inputRef - Ссылка на элемент ввода для управления фокусом.
   */
  const [inputValue, setInputValue] = useState('');
  const [isFinished, setFinished] = useState(false);
  const [randomNumber, setRandomNumber] = useState(() => getRandomNumber(1, 10));
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [isDisableForm, setIsDisabledForm] = useState(false);
  const inputRef = useRef(null);

  /**
   * @function handleFieldChange
   * @description Обработчик изменения значения в поле ввода.
   */
  const handleFieldChange = useCallback((e) => setInputValue(e.target.value), []);

  /**
   * @function handleFormSubmit
   * @description Обработчик отправки формы. Проверяет введенное число и обновляет состояние игры.
   */
  const handleFormSubmit = useCallback((e) => {
    e.preventDefault();
    const guessInput = Number(inputValue);

    if (!guessInput || isNaN(guessInput) || guessInput < 1 || guessInput > 10) {
      showToast('Please enter a valid number between 1 and 10.', 'error');
      return;
    }

    if (guessInput === randomNumber) {
      setFinished(true);
      setIsDisabledForm(true);
      showToast('Congratulations! You guessed it!', 'success');
      showConfetti();
    } else {
      const newAttemptsLeft = attemptsLeft - 1;
      setAttemptsLeft(newAttemptsLeft);

      if (newAttemptsLeft === 0) {
        setFinished(true);
        setIsDisabledForm(true);
        showToast(`You lost! The guessed number was ${randomNumber}`, 'error');
      } else {
        showToast(`Try again. Attempts left: ${newAttemptsLeft}`, 'error');
        setIsDisabledForm(true);
        setTimeout(() => setIsDisabledForm(false), 3000);
      }
    }
    setInputValue('');
  }, [inputValue, randomNumber, attemptsLeft]);

  /**
   * @function handleButtonClick
   * @description Обработчик нажатия кнопки для начала новой игры. Сбрасывает все состояния к начальным значениям.
   */
  const handleButtonClick = useCallback(() => {
    setInputValue('');
    setAttemptsLeft(3);
    setFinished(false);
    setRandomNumber(getRandomNumber(1, 10));
    setIsDisabledForm(false);
  }, []);

  /**
   * @function
   * @description Эффект для установки фокуса на поле ввода при определенных условиях.
   */
  useEffect(() => {
    if (!isFinished && !isDisableForm) {
      inputRef.current?.focus();
    }
  }, [isFinished, isDisableForm]);

  return (
    <div className="grid max-w-md w-full gap-4 rounded border p-3 shadow bg-white">
      <h1 className="text-center text-2xl font-bold">Guess the number</h1>
      <p>
        Guess the Number is a game in which you have to guess a number given by the computer from <span
        className="font-bold">1</span> to <span className="font-bold">10</span>. Use as few
        tries as possible. Good luck!
      </p>
      {!isFinished ? (
        <form onSubmit={handleFormSubmit}>
          <label aria-label="Enter a number">
            <Input
              fullWidth={true}
              type="number"
              name="guess"
              placeholder="Enter a number"
              min="1"
              max="10"
              value={inputValue}
              onChange={handleFieldChange}
              disabled={isDisableForm}
              ref={inputRef}
            />
          </label>
        </form>
      ) : (
        <Button onClick={handleButtonClick}>
          Play it again?
        </Button>
      )}
      <Toaster position="bottom-center" />
    </div>
  );
}

export default Root;
