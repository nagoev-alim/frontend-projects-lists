import { memo, useEffect } from 'react';
import { IoMdClose } from 'react-icons/io';
import { TOAST_CONFIG } from '@utils';

/**
 * Компонент Toast для отображения уведомлений.
 * @param {Object} props - Свойства компонента.
 * @param {string} props.type - Тип уведомления (например, 'success', 'error').
 * @param {Function} props.onClose - Функция для закрытия уведомления.
 * @returns {JSX.Element} Возвращает JSX элемент уведомления.
 */
const Toast = memo(({ type, onClose }) => {
  // Извлекаем необходимые свойства из конфигурации для данного типа уведомления
  const { icon, text, color } = TOAST_CONFIG.types[type];

  useEffect(() => {
    // Устанавливаем таймер для автоматического закрытия уведомления
    const timer = setTimeout(onClose, TOAST_CONFIG.time);
    // Очищаем таймер при размонтировании компонента
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <li className={`flex toast ${type}`}>
      {/* Иконка уведомления */}
      <div style={{ color }}>{icon}</div>
      {/* Текст уведомления */}
      <span className="flex-grow">{text}</span>
      {/* Кнопка закрытия уведомления */}
      <button onClick={onClose}>
        <IoMdClose />
      </button>
    </li>
  );
});

export default Toast;
