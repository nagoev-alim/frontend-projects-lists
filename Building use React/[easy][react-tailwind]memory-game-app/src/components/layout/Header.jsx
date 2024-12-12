/**
 * @module Header
 * @description Этот модуль содержит компонент Header, который отображает заголовок приложения и счетчик ходов.
 */

import { MovesCounter } from './index.js';
import { LANG } from '../../lang/index.js';

/**
 * Компонент Header
 * 
 * @function Header
 * @description Отображает заголовок приложения и счетчик ходов в верхней части интерфейса.
 * 
 * @param {Object} props - Свойства компонента
 * @param {number} props.moves - Количество ходов, сделанных в игре
 * 
 * @returns {JSX.Element} Возвращает JSX элемент, содержащий заголовок и счетчик ходов
 * 
 * @description
 * Компонент использует следующие элементы пользовательского интерфейса:
 * - Контейнер div с классами для флексбокс-выравнивания
 * - Заголовок h1 с текстом из языкового файла
 * - Компонент MovesCounter для отображения количества ходов
 * 
 * Компонент не использует хуки React, так как является простым функциональным компонентом без состояния.
 * Для оптимизации производительности можно использовать React.memo, если компонент часто перерендеривается с теми же props.
 */
const Header = ({ moves }) => (
  <div className="flex gap-2 items-center justify-center">
    <h1 className="text-center text-lg font-medium md:text-4xl">{LANG.title}</h1>
    <MovesCounter moves={moves} />
  </div>
);

export default Header;
