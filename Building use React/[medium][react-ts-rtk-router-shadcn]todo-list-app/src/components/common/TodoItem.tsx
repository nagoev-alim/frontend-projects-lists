import React, { useState } from 'react';
import { Card } from '@components/ui/card.tsx';
import { cn, hexToRgba } from '@/lib/utils.ts';
import { toast } from '@hooks/use-toast.ts';
import { Badge } from '@components/ui/badge.tsx';
import { format } from 'date-fns';
import { Button } from '@components/ui/button.tsx';
import { Check, Pencil, Trash2 } from 'lucide-react';
import { FormSchemaType, Todo } from '@helpers/types.ts';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { validateSchema } from '@/helpers';
import { Form } from '@components/ui/form.tsx';
import { TodoItemDisplay, TodoItemForm } from '@components/common';

type TodoItemProps = {
  todo: Todo;
  onComplete: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onUpdate: (todo: Todo) => void;
}

export const TodoItem = React.memo(({ todo, onComplete, onDelete, onUpdate }: TodoItemProps) => {
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(validateSchema),
    defaultValues: {
      title: todo.title,
      description: todo.description,
      category: todo.category,
      date: new Date(todo.date),
      color: todo.color,
    },
  });

  const onSubmit = async (data: FormSchemaType) => {
    try {
      await onUpdate({ ...todo, ...data });
      setEditingTodo(null);
      toast({ description: 'Todo updated successfully' });
    } catch (error) {
      console.error('Failed to update todo:', error);
      toast({ description: 'Failed to update todo' });
    }
  };

  return (
    <Card
      className={cn(
        'grid gap-3 p-4 border-l-4',
        todo.color ? `border-l-[${todo.color}]` : 'border-l-amber-300',
      )}
      style={{
        borderLeftColor: todo.color || '#fcd34d',
        backgroundColor: hexToRgba(todo.color || '#fcd34d', 0.02), // 10% непрозрачности (90% прозрачности)
      }}
    >
      <Form {...form}>
        <form className="grid gap-3" onSubmit={form.handleSubmit(onSubmit)}>
          {editingTodo && editingTodo.id === todo.id ? (
            <TodoItemForm form={form} />
          ) : (
            <TodoItemDisplay todo={todo} onComplete={onComplete} />
          )}
          <div className="inline-flex flex-wrap gap-2 justify-between w-full">
            <Badge>{todo.category}</Badge>
            <p className="text-neutral-500 dark:text-white">{format(todo.date, 'PPP')}</p>
          </div>
          <div className="flex justify-end gap-2">
            {editingTodo && editingTodo.id === todo.id && (
              <Button className="p-2" variant="outline" type="submit">
                <Check />
              </Button>
            )}
            <Button type="button" className="p-2" variant="outline" onClick={() => setEditingTodo(todo)}>
              <Pencil />
            </Button>
            <Button type="button" className="p-2" variant="outline" onClick={() => onDelete(todo.id!)}>
              <Trash2 />
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
});

TodoItem.displayName = 'TodoItem';
