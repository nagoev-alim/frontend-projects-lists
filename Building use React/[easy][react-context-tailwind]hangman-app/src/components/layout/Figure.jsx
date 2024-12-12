import { createElement } from 'react';
import { useHangmanContext } from '../../hooks/index';

/**
 * Компонент Figure отображает виселицу и части тела человечка в игре "Виселица".
 * Использует контекст игры для определения количества неправильных букв.
 * @returns {JSX.Element} SVG-изображение виселицы и человечка.
 */
const Figure = () => {
  // Получаем массив неправильных букв из контекста игры
  const { wrongLetters } = useHangmanContext();
  // Количество ошибок равно длине массива неправильных букв
  const errorCount = wrongLetters.length;

  /**
   * Массив частей тела человечка.
   * Каждый элемент - это объект, описывающий SVG-элемент (тип и свойства).
   * @type {Array<{type: string, props: Object}>}
   */
  const bodyParts = [
    { type: 'circle', props: { cx: 140, cy: 70, r: 20, fill: '#fff' } }, // Голова
    { type: 'line', props: { x1: 140, y1: 90, x2: 140, y2: 150 } }, // Тело
    { type: 'line', props: { x1: 140, y1: 120, x2: 120, y2: 100 } }, // Левая рука
    { type: 'line', props: { x1: 140, y1: 120, x2: 160, y2: 100 } }, // Правая рука
    { type: 'line', props: { x1: 140, y1: 150, x2: 120, y2: 180 } }, // Левая нога
    { type: 'line', props: { x1: 140, y1: 150, x2: 160, y2: 180 } }, // Правая нога
  ];

  return (
    <div className="grid justify-items-center">
      <svg height="250" width="200" className="stroke-black stroke-[5px]">
        {/* Рисуем виселицу */}
        <line x1="60" y1="20" x2="140" y2="20" />
        <line x1="140" y1="20" x2="140" y2="50" />
        <line x1="60" y1="20" x2="60" y2="230" />
        <line x1="20" y1="230" x2="100" y2="230" />

        {/* Рисуем части тела в зависимости от количества ошибок */}
        {bodyParts.map((part, index) => (
          errorCount > index && createElement(part.type, { key: index, ...part.props })
        ))}
      </svg>
    </div>
  );
};

export default Figure;
