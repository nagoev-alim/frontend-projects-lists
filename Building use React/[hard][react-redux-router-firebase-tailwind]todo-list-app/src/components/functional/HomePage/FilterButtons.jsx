/**
 * @module FilterButtons
 * @description Модуль, предоставляющий компонент для фильтрации списка задач на домашней странице.
 */
import { Button } from '@ui';

/**
 * @function FilterButtons
 * @description Компонент, отображающий кнопки для фильтрации списка задач.
 * Позволяет пользователю выбрать отображение всех задач, только активных или только завершенных.
 * @param {Object} props - Свойства компонента
 * @param {string} props.filter - Текущий выбранный фильтр ('all', 'active' или 'completed')
 * @param {Function} props.onFilterChange - Функция обратного вызова для изменения текущего фильтра
 * @returns {JSX.Element} Возвращает JSX элемент, представляющий группу кнопок фильтрации
 */
const FilterButtons = ({ filter, onFilterChange }) => {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      <Button 
        onClick={() => onFilterChange('all')} 
        variant={filter === 'all' ? 'primary' : 'secondary'}
      >
        All
      </Button>
      <Button 
        onClick={() => onFilterChange('active')} 
        variant={filter === 'active' ? 'primary' : 'secondary'}
      >
        Active
      </Button>
      <Button 
        onClick={() => onFilterChange('completed')} 
        variant={filter === 'completed' ? 'primary' : 'secondary'}
      >
        Completed
      </Button>
    </div>
  );
};

export default FilterButtons;
