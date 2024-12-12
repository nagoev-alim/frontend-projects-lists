import { IoMan } from 'react-icons/io5';
import { Figure, Word, WrongLetters } from '../layout/index';
import { useHangmanContext } from '../../hooks/index';
import { EndGame } from './index';
import { Loader } from '../ui/index';
import { LANG } from '../../lang/index';

/**
 * @typedef {Object} HangmanContextProps
 * @property {boolean} playable - Флаг, указывающий, можно ли играть в игру
 * @property {boolean} isLoading - Флаг, указывающий, загружается ли игра
 * @property {boolean} isError - Флаг, указывающий, произошла ли ошибка
 */

/**
 * Компонент Hangman - основной компонент игры "Виселица"
 *
 * @returns {JSX.Element} Возвращает JSX разметку игры "Виселица"
 */
const Hangman = () => {
  // Получаем необходимые данные из контекста игры
  const { playable, isLoading, isError } = useHangmanContext();

  return (
    <div className="grid gap-2 p-4 bg-white rounded-md shadow-md">
      {/* Заголовок игры */}
      <h1 className="font-bold text-lg text-center lg:text-2xl inline-flex gap-1 items-center justify-center">
        <IoMan aria-hidden="true" />
        <span>{LANG.hangman.title}</span>
      </h1>

      {/* Отображение загрузчика, если игра загружается */}
      {isLoading && <Loader isLoading={isLoading} />}

      {/* Отображение сообщения об ошибке, если произошла ошибка */}
      {isError && (
        <p className="text-center text-red-500">{LANG.hangman.errorMessage}</p>
      )}

      {/* Отображение игрового поля, если игра готова к игре */}
      {!isLoading && !isError && playable && (
        <>
          <p className="text-center">{LANG.hangman.instruction}</p>
          <WrongLetters />
          <Figure />
          <Word />
        </>
      )}

      {/* Компонент завершения игры */}
      <EndGame />
    </div>
  );
};

export default Hangman;
