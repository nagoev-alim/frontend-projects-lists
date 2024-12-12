import { IoClose } from 'react-icons/io5';
import { forwardRef } from 'react';

/**
 * @component ModalContent
 * @description Компонент содержимого модального окна. Использует forwardRef для передачи ссылки на DOM элемент.
 * @param {Object} props - Свойства компонента.
 * @param {React.ReactNode} props.children - Дочерние элементы, отображаемые внутри модального окна.
 * @param {Function} props.onClose - Функция, вызываемая для закрытия модального окна.
 * @param {React.Ref} ref - Ссылка, передаваемая на корневой элемент компонента.
 * @returns {JSX.Element} Возвращает JSX элемент, представляющий содержимое модального окна.
 */
const ModalContent = forwardRef(({ children, onClose }, ref) => (
  <section className="bg-white p-4 rounded max-w-md relative grid gap-4" ref={ref}>
    <button className="absolute top-2 right-2" onClick={onClose} aria-label="Закрыть">
      <IoClose className="text-2xl" />
    </button>
    {children}
  </section>
));

// Установка отображаемого имени для компонента ModalContent
ModalContent.displayName = 'ModalContent';

export default ModalContent;
