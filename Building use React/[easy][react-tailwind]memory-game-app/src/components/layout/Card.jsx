/**
 * Компонент Card
 * 
 * @function Card
 * @description Отображает интерактивную карточку, которая может быть перевернута.
 * 
 * @param {Object} props - Свойства компонента
 * @param {Object} props.item - Объект, представляющий данные карточки
 * @param {string|number} props.item.value - Значение, отображаемое на лицевой стороне карточки
 * @param {boolean} props.isFlipped - Флаг, указывающий, перевернута ли карточка
 * @param {Function} props.onClick - Функция обратного вызова, вызываемая при клике на карточку
 * 
 * @returns {JSX.Element} Возвращает JSX элемент, представляющий карточку
 * 
 * @description
 * Компонент использует следующие элементы пользовательского интерфейса:
 * - Внешний div с классом 'card' и дополнительным классом 'flipped', если карточка перевернута
 * - Внутренний div с классом 'inner' для создания эффекта переворота
 * - Два div'а: 'front' для отображения значения карточки и 'back' для отображения обратной стороны
 * 
 * Компонент не использует хуки React, так как является простым функциональным компонентом без состояния.
 * Для оптимизации производительности рекомендуется использовать React.memo, 
 * особенно если компонент часто перерендеривается с теми же props:
 * 
 * const MemoizedCard = React.memo(Card);
 * export default MemoizedCard;
 */
const Card = ({ item, isFlipped, onClick }) => (
  <div className={`card ${isFlipped ? 'flipped' : ''}`} onClick={onClick}>
    <div className="inner">
      <div className="front">{item.value}</div>
      <div className="back">?</div>
    </div>
  </div>
);

export default Card;
