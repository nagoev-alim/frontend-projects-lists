import { useCallback, useMemo } from 'react';
import { useDeleteTodoMutation, useUpdateTodoMutation } from '@features/todos/todosApi.ts';
import { toast } from '@hooks/use-toast.ts';
import { Todo } from '@helpers/types.ts';
import { TodoItem } from '@components/common';

type TodoListProps = {
  todos: Todo[];
}

export const TodoList = ({ todos }: TodoListProps) => {
  const [updateTodo] = useUpdateTodoMutation();
  const [deleteTodo] = useDeleteTodoMutation();

  const handleCompletedTodo = useCallback(async (id: string, completed: boolean) => {
    try {
      await updateTodo({ id, completed: !completed }).unwrap();
      toast({ description: 'Todo status updated successfully' });
    } catch (error) {
      console.error('Failed to update todo status:', error);
      toast({ description: 'Failed to update todo status' });
    }
  }, [updateTodo]);

  const handleDeleteTodo = useCallback(async (id: string) => {
    try {
      await deleteTodo(id).unwrap();
      toast({ description: 'Todo deleted successfully' });
    } catch (error) {
      console.error('Failed to delete todo:', error);
      toast({ description: 'Failed to delete todo' });
    }
  }, [deleteTodo]);

  const memoizedTodos = useMemo(() => todos.map(todo => (
    <li key={todo.id}>
      <TodoItem
        todo={todo}
        onComplete={handleCompletedTodo}
        onDelete={handleDeleteTodo}
        onUpdate={updateTodo}
      />
    </li>
  )), [todos, handleCompletedTodo, handleDeleteTodo, updateTodo]);

  return (
    <ul className="grid gap-3">
      {memoizedTodos}
    </ul>
  );
};

TodoList.displayName = 'TodoList';
