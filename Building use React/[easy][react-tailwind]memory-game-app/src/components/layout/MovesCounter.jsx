/**
 * @module MovesCounter
 * @description Модуль, содержащий компонент для отображения количества сделанных ходов в игре.
 */

import { LANG } from '../../lang/index.js';

/**
 * Компонент MovesCounter
 *
 * @function MovesCounter
 * @description Отображает количество сделанных ходов в игре. Если количество ходов равно нулю, компонент не рендерится.
 *
 * @param {Object} props - Свойства компонента
 * @param {number} props.moves - Количество сделанных ходов
 *
 * @returns {JSX.Element|null} Возвращает JSX элемент с отображением количества ходов или null, если ходов еще не было сделано
 */
const MovesCounter = ({ moves }) => {
  if (moves === 0) return null;

  return (
    <p className="bg-blue-400 p-1.5 rounded inline-flex gap-1 text-white text-lg">
      <span className="font-bold">{moves}</span>{' '}
      {LANG.moves}
    </p>
  );
};

export default MovesCounter;
