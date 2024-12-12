/**
 * @module TodoItem
 * @description Модуль, содержащий компонент TodoItem для отображения отдельной задачи в списке дел.
 */

import { useCallback } from 'react';
import { Button } from '@ui';
import { priorities } from '@pages';
import { useDispatch } from 'react-redux';
import { todosActions } from '@features';
import { showToast } from '@utils';

/**
 * @function TodoItem
 * @description Компонент для отображения отдельной задачи в списке дел.
 * @param {Object} props - Свойства компонента.
 * @param {string} props.userId - Идентификатор пользователя.
 * @param {Object} props.todo - Объект задачи.
 * @param {string} props.todo.id - Уникальный идентификатор задачи.
 * @param {string} props.todo.text - Текст задачи.
 * @param {string} props.todo.description - Описание задачи (опционально).
 * @param {boolean} props.todo.completed - Статус выполнения задачи.
 * @param {string} props.todo.priority - Приоритет задачи.
 * @param {Function} props.onEdit - Функция для редактирования задачи.
 * @param {Function} props.onDelete - Функция для удаления задачи.
 * @returns {JSX.Element} Возвращает JSX элемент, представляющий отдельную задачу.
 */
const TodoItem = ({ userId, todo, onEdit, onDelete }) => {
  const dispatch = useDispatch();

  /**
   * @function handleToggleItem
   * @description Обработчик для переключения статуса выполнения задачи.
   * Использует useCallback для оптимизации производительности.
   */
  const handleToggleItem = useCallback(async () => {
    try {
      const result = await dispatch(todosActions.toggle({ userId, id: todo.id }));
      if (result.meta.requestStatus === 'fulfilled') {
        showToast('Item toggled successfully', 'success');
      }
    } catch (error) {
      showToast('Failed to toggle item', 'error');
    }
  }, [dispatch, userId, todo.id]);

  /**
   * @function getPriorityEmoji
   * @description Функция для получения эмодзи приоритета задачи.
   * @param {string} priority - Приоритет задачи.
   * @returns {string} Эмодзи, соответствующее приоритету.
   */
  const getPriorityEmoji = (priority) => priorities.find(p => p.value === priority)?.emoji || '';

  return (
    <li className="flex items-center justify-between p-2 border gap-2">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          className="sr-only"
          type="checkbox"
          checked={todo.completed}
          onChange={handleToggleItem}
        />
        <span
          className={`checkbox min-w-[24px] ${todo.completed ? 'bg-green-600 border-green-600' : ''}`}
        />
        <div className="grid gap-1">
          <span className="font-semibold">
            {getPriorityEmoji(todo.priority)} {todo.text}
          </span>
          {todo.description && <p>{todo.description}</p>}
        </div>
      </label>
      <div className="flex gap-2">
        <Button onClick={() => onEdit(todo)}>Edit</Button>
        <Button variant="danger" onClick={() => onDelete(todo.id)}>Delete</Button>
      </div>
    </li>
  );
};

export default TodoItem;
