/**
 * @module TodoList
 * @description Модуль, содержащий компонент TodoList для отображения списка задач.
 */

import { TodoItem } from '@functional';

/**
 * @function TodoList
 * @description Компонент для отображения списка задач.
 * @param {Object} props - Свойства компонента.
 * @param {string} props.userId - Идентификатор пользователя.
 * @param {Array<Object>} props.todos - Массив объектов задач.
 * @param {function} props.onEdit - Функция для редактирования задачи.
 * @param {function} props.onDelete - Функция для удаления задачи.
 * @returns {JSX.Element} Возвращает JSX элемент, представляющий список задач.
 */
const TodoList = ({ userId, todos, onEdit, onDelete }) => (
  /**
   * @description Создает неупорядоченный список (ul) с сеточной структурой и отступами между элементами.
   * Каждый элемент списка представлен компонентом TodoItem.
   */
  <ul className="grid gap-2">
    {todos.map((todo) => (
      <TodoItem 
        key={todo.id} 
        todo={todo} 
        onEdit={onEdit} 
        onDelete={onDelete} 
        userId={userId} 
      />
    ))}
  </ul>
);

export default TodoList;
