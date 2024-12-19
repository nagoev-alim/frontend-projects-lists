import { Input } from '@ui';

/**
 * Компонент для фильтрации постов.
 * @param {Object} props - Свойства компонента
 * @param {string} props.value - Текущее значение фильтра
 * @param {Function} props.onChange - Функция обратного вызова для обновления значения фильтра
 * @returns {JSX.Element} Отрендеренный компонент фильтрации
 */
const FilterInput = ({ value, onChange }) => (
  <label className="grid gap-2 rounded border bg-white p-4">
    {/* Заголовок для поля фильтрации */}
    <span className="font-bold text-lg">Filter Posts:</span>
    <Input
      fullWidth={true}
      value={value}
      onChange={onChange}
      placeholder="Filter posts..."
    />
  </label>
);

export default FilterInput;
