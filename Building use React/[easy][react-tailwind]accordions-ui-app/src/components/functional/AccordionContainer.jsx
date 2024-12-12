import { useRef, useState } from 'react';
import { IoInformationCircleSharp } from 'react-icons/io5';
import { AccordionRow } from '@functional';

/**
 * @property {number} MAX_ACCORDIONS - Максимальное количество аккордеонов
 * @property {number} HEIGHT_ACTIVE - Дополнительная высота для активного аккордеона (в пикселях)
 * @property {Object} CONTENT - Содержимое аккордеона
 * @property {string} CONTENT.title - Заголовок аккордеона
 * @property {string} CONTENT.content - Содержание аккордеона
 */
const CONSTANTS = {
  MAX_ACCORDIONS: 4,
  HEIGHT_ACTIVE: 30,
};

/**
 * Компонент контейнера аккордеона
 * @param {Object} props - Свойства компонента
 * @param {string} props.headline - Заголовок аккордеона
 * @param {string} props.description - Описание аккордеона
 * @param {boolean} props.isClosed - Флаг, указывающий, должен ли аккордеон закрываться при открытии другого
 * @returns {JSX.Element} Разметка контейнера аккордеона
 */
const AccordionContainer = ({ headline, description, isClosed }) => {
  // Состояние для хранения индекса активного аккордеона
  const [activeIndex, setActiveIndex] = useState(0);
  // Состояние для хранения флага открытия аккордеона
  const [isOpen, setIsOpen] = useState(false);
  // Ссылка на объект, хранящий ссылки на DOM-элементы тел аккордеонов
  const bodyRefs = useRef({});

  /**
   * Обрабатывает клик по заголовку аккордеона
   * @description Эта функция определяет, нужно ли открыть или закрыть аккордеон,
   * и обновляет соответствующие состояния компонента.
   */
  const handleHeaderClick = (index) => {
    const isClickedAccordionActive = index === activeIndex;
    const shouldCloseAccordion = isClickedAccordionActive && isClosed;

    /**
     * Обновляет индекс активного аккордеона
     */
    const updateActiveIndex = () => setActiveIndex(shouldCloseAccordion ? -1 : index);

    /**
     * Обновляет состояние открытия аккордеона
     */
    const updateOpenState = () => setIsOpen(!shouldCloseAccordion);

    updateActiveIndex();
    updateOpenState();
  };

  /**
   * Устанавливает ссылку на DOM-элемент тела аккордеона
   * @description Эта функция сохраняет ссылку на DOM-элемент тела аккордеона
   * в объекте bodyRefs для последующего использования.
   */
  const setBodyRef = (index, element) => {
    bodyRefs.current[index] = element;
  };

  return (
    <div className="column">
      <h3 className="font-bold text-2xl title">{headline}</h3>
      <p><IoInformationCircleSharp />{description}</p>
      <div className="accordion__item">
        {Array.from({ length: CONSTANTS.MAX_ACCORDIONS }).map((_, i) => (
          <AccordionRow
            key={i}
            index={i}
            isActive={i === activeIndex && isOpen}
            onClick={() => handleHeaderClick(i)}
            setBodyRef={setBodyRef}
          />
        ))}
      </div>
    </div>
  );
};

export default AccordionContainer;
