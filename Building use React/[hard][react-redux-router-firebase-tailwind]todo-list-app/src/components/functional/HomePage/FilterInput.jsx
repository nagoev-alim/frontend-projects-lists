/**
 * @module FilterInput
 * @description Модуль, предоставляющий компонент для фильтрации списка задач на домашней странице.
 */

import { Input } from '@ui';

/**
 * @function FilterInput
 * @description Компонент, отображающий поле ввода для фильтрации списка задач.
 * Позволяет пользователю вводить текст для поиска и фильтрации задач.
 * @param {Object} props - Свойства компонента
 * @param {string} props.value - Текущее значение поля ввода
 * @param {Function} props.onChange - Функция обратного вызова, вызываемая при изменении значения поля ввода
 * @returns {JSX.Element} Возвращает JSX элемент, представляющий поле ввода для фильтрации
 */
const FilterInput = ({ value, onChange }) => (
  <Input
    fullWidth={true}
    placeholder="Filter todos"
    value={value}
    onChange={(e) => onChange(e.target.value)}
  />
);

export default FilterInput;
