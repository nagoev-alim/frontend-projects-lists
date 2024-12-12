import { useState } from 'react';

/**
 * Компонент ExpandableText представляет собой расширяемый текстовый блок.
 * Он отображает сокращенную версию текста с возможностью его раскрытия и сворачивания.
 *
 * @param {Object} props - Свойства компонента.
 * @param {React.ReactNode} props.children - Содержимое текстового блока.
 * @param {number} [props.collapsedNumWords=20] - Количество слов, отображаемых в свернутом состоянии.
 * @param {string} [props.expandButtonText='Show more'] - Текст кнопки для раскрытия.
 * @param {string} [props.collapseButtonText='Show less'] - Текст кнопки для сворачивания.
 * @param {string} [props.buttonColor='111111'] - Цвет текста кнопки (в формате HEX без #).
 * @param {boolean} [props.expanded=false] - Начальное состояние блока (раскрыт/свернут).
 * @param {string} [props.className=''] - Дополнительные CSS классы для контейнера.
 * @returns {JSX.Element} Расширяемый текстовый блок.
 */
const ExpandableText = ({
                          children,
                          collapsedNumWords = 20,
                          expandButtonText = 'Show more',
                          collapseButtonText = 'Show less',
                          buttonColor = '111111',
                          expanded = false,
                          className = '',
                        }) => {
  const [isExpanded, setIsExpanded] = useState(expanded);

  /**
   * Обрезает текст до указанного количества слов.
   * @param {string} text - Исходный текст.
   * @returns {string} Обрезанный текст или исходный текст, если он короче указанного количества слов.
   */
  const truncateText = (text) => {
    if (typeof text !== 'string') return text;
    const words = text.split(' ');
    return words.length > collapsedNumWords
      ? `${words.slice(0, collapsedNumWords).join(' ')}...`
      : text;
  };

  return (
    <div className={`border-2 bg-white rounded p-3 ${className}`}>
      <span className="leading-[40px]">
        {isExpanded ? children : truncateText(children)}
      </span>
      <button
        className="border-2 rounded py-1.5 px-2.5 ml-1 font-bold bg-blue-100"
        onClick={() => setIsExpanded((prev) => !prev)}
        style={{ color: `#${buttonColor}` }}
      >
        {isExpanded ? collapseButtonText : expandButtonText}
      </button>
    </div>
  );
};

export default ExpandableText;
