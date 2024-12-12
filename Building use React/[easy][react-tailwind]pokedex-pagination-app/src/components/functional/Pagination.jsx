import { Button } from '@ui';

/**
 * Компонент пагинации.
 *
 * @param {Object} props - Свойства компонента.
 * @param {number} props.currentPage - Текущая страница.
 * @param {number} props.totalPages - Общее количество страниц.
 * @param {Function} props.onPageChange - Функция обработки изменения страницы (для кнопок "Prev" и "Next").
 * @param {Function} props.onNumberClick - Функция обработки клика по номеру страницы.
 * @returns {JSX.Element} Возвращает JSX элемент пагинации.
 */
const Pagination = ({ currentPage, totalPages, onPageChange, onNumberClick }) => {
  /**
   * Создает кнопку пагинации.
   *
   * @param {string} text - Текст кнопки.
   * @param {string} type - Тип кнопки ('prev', 'next' или 'number').
   * @param {boolean} disabled - Флаг, указывающий, должна ли кнопка быть отключена.
   * @returns {JSX.Element} Возвращает JSX элемент кнопки.
   */
  const createButton = (text, type, disabled) => (
    <Button
      onClick={() => type === 'number' ? onNumberClick(Number(text) - 1) : onPageChange(type)}
      disabled={disabled}
    >
      {text}
    </Button>
  );

  return (
    <nav aria-label="Pagination">
      <ul className="flex flex-wrap items-center justify-center gap-2">
        {/* Кнопка "Предыдущая страница" */}
        <li>{createButton('Prev', 'prev', currentPage <= 0)}</li>
        {/* Кнопки с номерами страниц */}
        {[...Array(totalPages)].map((_, index) => (
          <li key={index}>{createButton(String(index + 1), 'number', currentPage === index)}</li>
        ))}
        {/* Кнопка "Следующая страница" */}
        <li>{createButton('Next', 'next', currentPage >= totalPages - 1)}</li>
      </ul>
    </nav>
  );
};

export default Pagination;
