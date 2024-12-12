import { useDispatch, useSelector } from 'react-redux';
import { passwordSelectors } from '@redux';
import { optionToggle } from '@redux/slice.js';

/**
 * @typedef {Object} PasswordOption
 * @property {string} id - Уникальный идентификатор опции
 * @property {boolean} checked - Флаг, указывающий, выбрана ли опция
 * @property {string} label - Текстовое описание опции
 */

/**
 * Компонент для отображения и управления опциями генерации пароля
 * @returns {JSX.Element} Отрендеренный компонент с опциями пароля
 */
const PasswordOptions = () => {
  // Получаем функцию dispatch для отправки действий в Redux
  const dispatch = useDispatch();

  // Получаем опции пароля из Redux store
  const { options } = useSelector(passwordSelectors.selectPassword);

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {options.map(({ id, checked, label }) => (
        <li key={id}>
          <label className="flex items-center cursor-pointer">
            <input
              className="sr-only" // Скрытый нативный чекбокс
              type="checkbox"
              checked={checked}
              onChange={() => dispatch(optionToggle(id))} // Вызываем действие optionToggle при изменении
            />
            {/* Кастомный визуальный чекбокс */}
            <span className="checkbox mr-2"></span>
            {/* Текст опции */}
            <span>{label}</span>
          </label>
        </li>
      ))}
    </ul>
  );
};

export default PasswordOptions;
