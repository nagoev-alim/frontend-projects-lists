import PropTypes from 'prop-types';
import { useHangmanContext } from '../../hooks/index';

/**
 * Компонент Letter отображает отдельную букву слова.
 * @param {Object} props - Свойства компонента.
 * @param {string} props.letter - Буква для отображения.
 * @param {boolean} props.isGuessed - Флаг, указывающий, была ли буква угадана.
 * @returns {JSX.Element} - Возвращает JSX элемент, представляющий букву.
 */
const Letter = ({ letter, isGuessed }) => (
  <span
    className="font-bold rounded text-lg uppercase flex justify-center items-center border-2 border-neutral-800 w-[30px] h-[30px]">
    {isGuessed ? letter : ''}
  </span>
);

/**
 * Компонент Word отображает загаданное слово, скрывая неугаданные буквы.
 * @returns {JSX.Element|null} - Возвращает JSX элемент, представляющий слово, или null, если слово не задано.
 */
const Word = () => {
  // Получаем загаданное слово и массив правильно угаданных букв из контекста
  const { word, correctLetters } = useHangmanContext();

  // Если слово не задано, не рендерим ничего
  if (!word) return null;

  return (
    <div className="inline-flex justify-center gap-1">
      {/* Разбиваем слово на буквы и отображаем каждую букву */}
      {word.split('').map((letter, index) => (
        <Letter
          key={`${letter}-${index}`}
          letter={letter}
          isGuessed={correctLetters.includes(letter)}
        />
      ))}
    </div>
  );
};

// Определение propTypes для компонента Letter
Letter.propTypes = {
  letter: PropTypes.string.isRequired,
  isGuessed: PropTypes.bool.isRequired,
};

export default Word;
