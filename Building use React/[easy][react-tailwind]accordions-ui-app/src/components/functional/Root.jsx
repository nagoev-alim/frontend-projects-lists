import { AccordionContainer } from '@functional';

/**
 * Компонент Root
 * @description Рендерит контейнер с двумя аккордеонами, каждый из которых имеет
 * разное поведение при открытии/закрытии.
 * @returns {JSX.Element} Возвращает JSX элемент, содержащий два компонента AccordionContainer
 * с различными описаниями и поведением.
 */
const Root = () => (
  <div className="accordion">
    {[
      'Shows the block without closing the previously opened',
      'Shows the block by closing the previously opened',
    ].map((description, index) => (
      <AccordionContainer
        key={index}
        headline={`Accordion ${index + 1}`}
        description={description}
        isClosed={index === 1}
      />
    ))}
  </div>
);
export default Root;
