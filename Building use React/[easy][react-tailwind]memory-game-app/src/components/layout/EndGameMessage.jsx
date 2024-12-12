/**
 * @module EndGameMessage
 * @description Этот модуль содержит компонент EndGameMessage, который отображает сообщение о завершении игры.
 */

import { Button } from '../ui/index.js';
import { LANG } from '../../lang/index.js';

/**
 * Компонент EndGameMessage
 * 
 * @function EndGameMessage
 * @description Отображает сообщение о завершении игры, включая количество ходов и кнопку для перезапуска.
 * 
 * @param {Object} props - Свойства компонента
 * @param {number} props.moves - Количество ходов, сделанных игроком
 * @param {Function} props.onRestart - Функция обратного вызова для перезапуска игры
 * 
 * @returns {JSX.Element} Возвращает JSX элемент, содержащий сообщение о завершении игры
 *
 * @description
 * Компонент использует следующие элементы пользовательского интерфейса:
 * - Контейнер div с классами для центрирования и оформления
 * - Заголовок с текстом победы
 * - Параграф, отображающий количество сделанных ходов
 * - Кнопка для перезапуска игры
 * 
 * Компонент не использует хуки React, так как является функциональным компонентом без состояния.
 * Для оптимизации производительности можно использовать React.memo, если компонент часто перерендеривается с теми же props.
 */
const EndGameMessage = ({ moves, onRestart }) => (
  <div className="grid gap-2 text-center max-w-xl mx-auto">
    <p className="text-2xl font-semibold">{LANG.win}</p>
    <p className="text-lg">
      {LANG.complete} <span className="font-semibold">{moves}</span> {LANG.steps}
    </p>
    <Button onClick={onRestart}>{LANG.restartLabel}</Button>
  </div>
);

export default EndGameMessage;
