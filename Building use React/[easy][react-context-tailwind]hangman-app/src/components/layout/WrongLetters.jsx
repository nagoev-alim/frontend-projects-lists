import { useHangmanContext } from '../../hooks/index';
import { LANG } from '../../lang/index';

/**
 * Компонент WrongLetters отображает список неправильно угаданных букв в игре "Виселица".
 * @returns {JSX.Element|null} Возвращает JSX элемент со списком неправильных букв или null, если таких букв нет.
 */
const WrongLetters = () => {
  // Получаем массив неправильно угаданных букв из контекста игры
  const { wrongLetters } = useHangmanContext();

  // Если нет неправильно угаданных букв, не рендерим компонент
  if (wrongLetters.length === 0) return null;

  return (
    <div className="grid gap-1">
      {/* Заголовок для списка неправильных букв */}
      <p className="text-lg font-bold text-red-500 text-center">{LANG.wrongLetters.title}</p>

      {/* Контейнер для отображения неправильных букв */}
      <div className="inline-flex justify-center gap-1">
        {/* Отображаем каждую неправильно угаданную букву */}
        {wrongLetters.map((letter, index) => (
          <span
            key={index}
            className="font-bold rounded text-lg uppercase flex justify-center items-center border-2 border-neutral-800 w-[30px] h-[30px]"
          >
            {letter}
          </span>
        ))}
      </div>
    </div>
  );
};

export default WrongLetters;
