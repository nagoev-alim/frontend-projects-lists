import PropTypes from 'prop-types';

/**
 * @function Pagination
 * @description Компонент пагинации, отображающий кнопки для навигации по страницам.
 * @param {Object} props - Свойства компонента
 * @param {number} props.currentPage - Текущая активная страница (начиная с 0)
 * @param {number} props.totalPages - Общее количество страниц
 * @param {function} props.onPageChange - Функция обратного вызова для навигации по страницам ('prev' или 'next')
 * @param {function} props.onNumberClick - Функция обратного вызова при нажатии на номер страницы
 * @returns {JSX.Element} Возвращает JSX элемент, представляющий компонент пагинации
 */
const Pagination = ({ currentPage, totalPages, onPageChange, onNumberClick }) => {
  /**
   * @function createButton
   * @description Вспомогательная функция для создания кнопки пагинации
   * @param {string} text - Текст кнопки
   * @param {string} type - Тип кнопки ('prev', 'next', или 'number')
   * @param {boolean} disabled - Флаг, указывающий, должна ли кнопка быть отключена
   * @returns {JSX.Element} Возвращает JSX элемент кнопки
   */
  const createButton = (text, type, disabled) => (
    <button
      onClick={() => type === 'number' ? onNumberClick(Number(text) - 1) : onPageChange(type)}
      className={`font-medium px-3 py-2 border rounded dark:bg-neutral-700 dark:text-white dark:hover:bg-neutral-800 dark:border-neutral-800 ${
        disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:border-gray-800' : 'bg-white hover:bg-slate-50 text-blue-600'
      }`}
      disabled={disabled}
    >
      {text}
    </button>
  );

  return (
    <nav aria-label="Pagination">
      <ul className="flex flex-wrap items-center justify-center gap-2">
        <li>{createButton('Prev', 'prev', currentPage <= 0)}</li>
        {[...Array(totalPages)].map((_, index) => (
          <li key={index}>{createButton(String(index + 1), 'number', currentPage === index)}</li>
        ))}
        <li>{createButton('Next', 'next', currentPage >= totalPages - 1)}</li>
      </ul>
    </nav>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onNumberClick: PropTypes.func.isRequired
};

export default Pagination;
