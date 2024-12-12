import { useMemo } from 'react';

/**
 * Компонент для ввода рейтинга.
 * @param {Object} props - Свойства компонента
 * @param {string|number} props.value - Текущее значение рейтинга
 * @param {Function} props.onChange - Функция обратного вызова для изменения рейтинга
 * @returns {JSX.Element} Компонент ввода рейтинга
 */
const RatingInput = ({ value, onChange }) => {
  // Создаем массив рейтингов от 1 до 10
  const ratings = useMemo(() => Array.from({ length: 10 }, (_, i) => i + 1), []);

  return (
    <ul className="flex flex-wrap items-center justify-center gap-2">
      {ratings.map((number) => (
        <li key={number}>
          <label>
            <input
              className="sr-only" // Скрываем стандартный input
              type="radio"
              name="rating"
              value={number}
              checked={value === number.toString()}
              onChange={onChange}
              aria-label={`Rate ${number} out of 10`} // Улучшаем доступность
            />
            <span
              className={`flex h-12 w-12 cursor-pointer items-center justify-center rounded-full text-lg font-bold transition-colors
                ${value === number.toString()
                ? 'bg-neutral-900 text-white' // Стили для выбранного рейтинга
                : 'bg-gray-300 hover:bg-neutral-900 hover:text-white'}`} // Стили для невыбранного рейтинга
            >
              {number}
            </span>
          </label>
        </li>
      ))}
    </ul>
  );
};

export default RatingInput;
