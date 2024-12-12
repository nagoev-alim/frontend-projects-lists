import CURRENCY_LIST from '../../mock/mock.js';

/**
 * Компонент выбора валюты.
 * @param {Object} props - Свойства компонента.
 * @param {string} props.label - Метка для выбора валюты (например, "From" или "To").
 * @param {string} props.value - Текущее выбранное значение валюты.
 * @param {Function} props.onChange - Функция обратного вызова для обработки изменений выбора.
 * @param {string} props.flagUrl - URL изображения флага для выбранной валюты.
 * @returns {JSX.Element} Возвращает JSX элемент с выпадающим списком для выбора валюты.
 * @description
 * Этот компонент отображает выпадающий список для выбора валюты с изображением флага.
 * Он использует предоставленный список валют (CURRENCY_LIST) для создания опций.
 * Компонент стилизован с использованием Tailwind CSS для отзывчивого дизайна.
 */
const CurrencySelect = ({ label, value, onChange, flagUrl }) => (
  <label className="grid gap-1">
    <span className="text-sm font-medium">{label}</span>
    <div className="relative">
      <img
        className="absolute left-2 top-1/2 w-8 -translate-y-1/2 transform"
        src={flagUrl}
        alt={`Flag for ${value}`}
      />
      <select
        className="w-full rounded border-2 bg-gray-50 px-3 py-2.5 pl-12 focus:border-blue-400 focus:outline-none appearance-none"
        name={label.toLowerCase()}
        value={value}
        onChange={onChange}
        aria-label={`Select ${label.toLowerCase()} currency`}
      >
        {CURRENCY_LIST.map(({ name }) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  </label>
);

export default CurrencySelect;
