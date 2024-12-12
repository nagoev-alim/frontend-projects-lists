import { Card } from '@/components/ui/card.tsx';
import { useGetTodosQuery } from '@features/todos/todosApi.ts';
import { useState } from 'react';
import { CreateTodoForm, TodoFilters, TodoList } from '@components/common';
import { Spinner } from '@components/ui';
import { Todo } from '@helpers/types.ts';

const HomePage = () => {
  const { data: todos, isError, isSuccess, isLoading } = useGetTodosQuery();
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>(todos ?? []);

  return (
    <Card className="grid gap-3 p-4">
      <CreateTodoForm />
      {isLoading && <Spinner/>}
      {isError && (<p className='text-red-500 font-semibold text-center'>Failed to load todos. Please try again later.</p>)}
      {isSuccess && todos.length === 0 && <p>You haven't created any todos yet. Start by creating a new todo above.</p>}
      {isSuccess && todos.length > 0 && (
        <div className="grid gap-3">
          <TodoFilters todos={todos} onSetFilteredTodos={setFilteredTodos} />
          <TodoList todos={filteredTodos} />
        </div>
      )}
    </Card>
  );
};

HomePage.displayName = 'HomePage';

export default HomePage;
