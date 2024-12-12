import { useEffect, useRef } from 'react';
import { IoChevronDown, IoChevronUpOutline } from 'react-icons/io5';

/**
 * @typedef {Object} Constants
 * @property {number} MAX_ACCORDIONS - Максимальное количество аккордеонов
 * @property {number} HEIGHT_ACTIVE - Дополнительная высота для активного аккордеона (в пикселях)
 * @property {Object} CONTENT - Содержимое аккордеона
 * @property {string} CONTENT.title - Заголовок аккордеона
 * @property {string} CONTENT.content - Содержание аккордеона
 */
const CONSTANTS = {
  MAX_ACCORDIONS: 4,
  HEIGHT_ACTIVE: 30,
  CONTENT: {
    title: 'Lorem ipsum dolor sit amet',
    content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Exercitationem minima nesciunt sapiente veniam voluptatem Consectetur dicta enim laudantium reprehenderit voluptas',
  },
};


/**
 * Генерирует стили для аккордеона в зависимости от его состояния
 * @param {boolean} isActive - Флаг, указывающий, активен ли аккордеон
 * @param {number} scrollHeight - Высота содержимого аккордеона
 * @returns {Object} Объект стилей для аккордеона
 */
const accordionStyles = (isActive, scrollHeight) => ({
  height: isActive ? `${scrollHeight + CONSTANTS.HEIGHT_ACTIVE}px` : '0px',
  paddingTop: isActive ? '15px' : '0px',
  paddingBottom: isActive ? '15px' : '0px',
});


/**
 * Компонент строки аккордеона
 * @param {Object} props - Свойства компонента
 * @param {number} props.index - Индекс строки аккордеона
 * @param {boolean} props.isActive - Флаг, указывающий, активна ли строка
 * @param {Function} props.onClick - Обработчик клика по заголовку аккордеона
 * @param {Function} props.setBodyRef - Функция для установки ссылки на тело аккордеона
 * @returns {JSX.Element} Разметка строки аккордеона
 */
const AccordionRow = ({ index, isActive, onClick, setBodyRef }) => {
  // Ссылка на DOM-элемент тела аккордеона
  const bodyRef = useRef(null);

  /**
   * Эффект для установки ссылки на DOM-элемент тела аккордеона
   * @description Этот эффект выполняется при монтировании компонента и при изменении index или setBodyRef.
   * Он проверяет наличие текущего DOM-элемента в bodyRef и, если элемент существует,
   * вызывает функцию setBodyRef для сохранения ссылки на этот элемент.
   */
  useEffect(() => {
    if (bodyRef.current) {
      setBodyRef(index, bodyRef.current);
    }
  }, [setBodyRef, index]);

  return (
    <div className={`accordion__container ${isActive ? 'open' : ''}`}>
      <div className="accordion__header" onClick={onClick}>
        <span className="h5 accordion__title">{CONSTANTS.CONTENT.title} {index + 1}</span>
        <div className="accordion__icon">
          {isActive ? <IoChevronUpOutline /> : <IoChevronDown />}
        </div>
      </div>
      <div
        className="accordion__body"
        ref={bodyRef}
        style={accordionStyles(isActive, bodyRef.current?.scrollHeight || 0)}
      >
        <p>{CONSTANTS.CONTENT.content}</p>
        <p>{CONSTANTS.CONTENT.content}</p>
      </div>
    </div>
  );
};

export default AccordionRow;
