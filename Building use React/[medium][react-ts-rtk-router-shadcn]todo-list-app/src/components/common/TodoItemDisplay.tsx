import { Checkbox } from '@components/ui/checkbox.tsx';
import { Todo } from '@helpers/types.ts';

type TodoItemDisplayProps = {
  todo: Todo;
  onComplete: (id: string, completed: boolean) => void;
}

export const TodoItemDisplay = ({ todo, onComplete }: TodoItemDisplayProps) => (
  <>
    <div className="inline-flex w-full gap-2">
      <h3 className={`font-semibold text-lg ${todo.completed ? 'line-through' : ''}`}>
        {todo.title}
      </h3>
      <div className="ml-auto">
        <Checkbox
          checked={todo.completed}
          onCheckedChange={() => onComplete(todo.id!, todo.completed)}
        />
      </div>
    </div>
    <p>{todo.description}</p>
  </>
);

TodoItemDisplay.displayName = 'TodoItemDisplay';
