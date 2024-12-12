/**
 * @fileoverview Компонент игры "Камень, ножницы, бумага"
 *
 * Этот файл содержит React-компонент, реализующий игру "Камень, ножницы, бумага".
 * Игрок соревнуется с компьютером, делая выбор между камнем, ножницами и бумагой.
 * Игра продолжается до достижения максимального количества попыток (по умолчанию 3).
 * Результаты отображаются на экране, и победитель определяется по окончании игры.
 */

import { useEffect, useState } from 'react';
import { LiaHandScissors, LiaHandPaper, LiaHandRock } from 'react-icons/lia';
import { getRandomNumber, showConfetti, showToast } from '@utils';
import { Button } from '@ui';

// Массив возможных вариантов выбора в игре
const CHOICES = ['rock', 'paper', 'scissors'];

// Объект для отображения выбора на экране
const CHOICES_DISPLAY = { rock: 'Rock', paper: 'Paper', scissors: 'Scissors' };

// Объект для отображения результата игры
const RESULT_TEXT = { win: 'beats', lose: 'loses to', draw: 'equals' };

// Максимальное количество попыток в игре
const MAX_ATTEMPTS = 3;

/**
 * Компонент игры "Камень, ножницы, бумага"
 * @returns {JSX.Element} Возвращает JSX элемент с игрой
 */
function Root() {
  // Текущее сообщение, отображаемое в игре.
  const [message, setMessage] = useState('Get Started, Let\'s Rock!');
  // Максимальное количество попыток в игре.
  const [maxAttempts] = useState(MAX_ATTEMPTS);
  // Текущий счет игры.
  const [score, setScore] = useState({ user: 0, computer: 0 });
  // Флаг, указывающий на завершение игры.
  const [isFinished, setIsFinished] = useState(false);

  /**
   * Определяет результат игры "Камень, ножницы, бумага" для двух игроков.
   * @description
   * Функция сравнивает выборы пользователя и компьютера и определяет результат игры.
   * Если выборы одинаковы, возвращается 'draw' (ничья).
   * В противном случае, результат определяется на основе правил игры:
   * - Камень побеждает ножницы
   * - Ножницы побеждают бумагу
   * - Бумага побеждает камень
   */
  const getResult = (user, computer) => {
    if (user === computer) {
      return 'draw';
    }

    const winConditions = {
      rock: 'scissors',
      paper: 'rock',
      scissors: 'paper',
    };

    return winConditions[user] === computer ? 'win' : 'lose';
  };

  /**
   * Отображает сообщение о результате игры.
   * @description
   * Функция формирует сообщение о результате игры, используя выборы пользователя и компьютера,
   * а также результат игры. Сформированное сообщение устанавливается с помощью функции setMessage.
   * В сообщении используются HTML-теги для стилизации текста.
   */
  const showMessage = (userChoice, computerChoice, result) => {
    const message = `
    ${CHOICES_DISPLAY[userChoice]} <span class="text-sm">(user)</span> 
    ${RESULT_TEXT[result].toUpperCase()} 
    ${CHOICES_DISPLAY[computerChoice]} <span class="text-sm">(comp)</span>.
  `;
    setMessage(message.trim());
  };

  /**
   * Завершает игру и обновляет состояние компонента.
   * @description
   * Функция выполняет следующие действия:
   * 1. Устанавливает флаг завершения игры.
   * 2. Выбирает соответствующее сообщение о результате игры.
   * 3. Обновляет отображаемое сообщение.
   * 4. Показывает уведомление с результатом игры.
   * 5. При победе запускает анимацию конфетти.
   */
  const finishGame = (typeEnd) => {
    setIsFinished(true);
    const messages = {
      success: 'You won the game! 🏆',
      loading: 'It\'s a draw! 🤝',
      error: 'You lost the game! 🤡',
    };
    const resultMessage = messages[typeEnd] || 'Game over!';
    setMessage(resultMessage);
    showToast(resultMessage, typeEnd);
    if (typeEnd === 'success') {
      showConfetti();
    }
  };

  /**
   * Отображает результат игры и обновляет счет.
   * @description
   * Функция выполняет следующие действия:
   * 1. Обновляет счет игры в зависимости от результата.
   * 2. Вызывает функцию showMessage для отображения сообщения о результате.
   */
  const showResult = (userChoice, computerChoice, result) => {
    setScore(prevScore => {
      const newScore = { ...prevScore };
      if (result === 'draw') {
        newScore.user += 1;
        newScore.computer += 1;
      } else if (result === 'win') {
        newScore.user += 1;
      } else {
        newScore.computer += 1;
      }
      return newScore;
    });

    showMessage(userChoice, computerChoice, result);
  };

  /**
   * Обрабатывает выбор пользователя в игре "Камень, ножницы, бумага".
   * @description
   * Функция выполняет следующие действия:
   * 1. Генерирует случайный выбор компьютера.
   * 2. Определяет результат игры, вызывая функцию getResult.
   * 3. Отображает результат игры, вызывая функцию showResult.
   */
  const handleOptionClick = (userChoice) => {
    const computerChoice = CHOICES[getRandomNumber(0, CHOICES.length - 1)];
    const result = getResult(userChoice, computerChoice);
    showResult(userChoice, computerChoice, result);
  };

  /**
   * Эффект для проверки завершения игры и определения победителя.
   * @description
   * Этот эффект выполняется при изменении счета или максимального количества попыток.
   * Он проверяет, достиг ли один из игроков максимального количества очков, и вызывает
   * соответствующую функцию завершения игры.
   * Условия завершения игры:
   * 1. Если пользователь достиг максимального количества очков, а компьютер нет - победа пользователя.
   * 2. Если компьютер достиг максимального количества очков, а пользователь нет - победа компьютера.
   * 3. Если оба игрока достигли максимального количества очков - ничья.
   */
  useEffect(() => {
    if (score.user === maxAttempts && score.computer < maxAttempts) {
      finishGame('success');
    } else if (score.computer === maxAttempts && score.user < maxAttempts) {
      finishGame('error');
    } else if (score.user === maxAttempts && score.computer === maxAttempts) {
      finishGame('loading');
    }
  }, [score, maxAttempts]);

  /**
   * Обработчик сброса игры.
   * @description
   * Эта функция выполняет следующие действия:
   * 1. Устанавливает начальное сообщение для игры.
   * 2. Сбрасывает счет игры, устанавливая значения для пользователя и компьютера на 0.
   * 3. Устанавливает флаг завершения игры в false, что позволяет начать новую игру.
   */
  const handleResetGameClick = () => {
    setMessage('Get Started, Let\'s Rock!');
    setScore({ user: 0, computer: 0 });
    setIsFinished(false);
  };

  return (
    <div className="border shadow rounded max-w-xl w-full p-3 grid gap-4 md:p-5 bg-white">
      <h1 className="text-center font-bold text-2xl md:text-4xl">Rock Paper Scissors</h1>
      <main>
        <div
          className="border-4 border-black relative font-bold text-6xl md:text-8xl flex justify-center items-center p-10">
          <span className="absolute top-1/2 -translate-y-1/2 text-sm left-0 p-2 bg-red-400 text-white">user</span>
          <span className="absolute top-1/2 -translate-y-1/2 text-sm right-0 p-2 bg-red-400 text-white">computer</span>
          <span>{score.user}</span>:
          <span>{score.computer}</span>
        </div>
        <div className="text-center font-bold my-4 text-xl" dangerouslySetInnerHTML={{ __html: message }} />
        {!isFinished && (
          <ul className="options grid gap-4 grid-cols-3 justify-items-center max-w-md mx-auto">
            {CHOICES.map((choice) => (
              <li key={choice}>
                <button
                  className={`border-4 border-black w-[80px] sm:w-[100px] h-[80px] sm:h-[100px] p-2 rounded-full active:scale-95 transition active:border-red-400`}
                  onClick={() => handleOptionClick(choice)}
                >
                  <div className="pointer-events-none flex justify-center">
                    {choice === 'rock' && <LiaHandRock size={50} />}
                    {choice === 'paper' && <LiaHandPaper size={50} />}
                    {choice === 'scissors' && <LiaHandScissors size={50} />}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
      <footer className="text-center grid place-items-center gap-3">
        {!isFinished && <p>Make your move.</p>}
        {isFinished && (
          <Button variant='danger' onClick={handleResetGameClick}>
            Repeat Game
          </Button>
        )}
      </footer>
    </div>
  );
}

export default Root;
