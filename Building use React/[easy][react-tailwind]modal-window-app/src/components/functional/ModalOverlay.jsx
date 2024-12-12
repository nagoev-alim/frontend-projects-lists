/**
 * @component ModalOverlay
 * @description Компонент оверлея для модального окна. Создает затемненный фон и центрирует содержимое.
 * @param {Object} props - Свойства компонента.
 * @param {React.ReactNode} props.children - Дочерние элементы, которые будут отображены внутри оверлея.
 * @param {Function} props.onClose - Функция, вызываемая при клике на оверлей для закрытия модального окна.
 * @returns {JSX.Element} Возвращает JSX элемент, представляющий оверлей модального окна.
 */
const ModalOverlay = ({ children, onClose }) => (
  <div className="fixed inset-0 bg-neutral-900/50 grid place-items-center p-3" onClick={onClose}>
    {children}
  </div>
);

export default ModalOverlay;
