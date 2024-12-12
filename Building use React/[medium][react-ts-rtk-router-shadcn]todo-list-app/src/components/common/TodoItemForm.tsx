import { FormControl, FormField, FormItem, FormMessage } from '@components/ui/form.tsx';
import { Input } from '@components/ui/input.tsx';
import { Textarea } from '@components/ui/textarea.tsx';
import { FormSchemaType } from '@helpers/types.ts';
import { UseFormReturn } from 'react-hook-form';

type TodoItemFormProps = {
  form: UseFormReturn<FormSchemaType>;
}

export const TodoItemForm = ({ form }: TodoItemFormProps) => (
  <>
    <FormField
      control={form.control}
      name="title"
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <Input placeholder="Todo title" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <Textarea placeholder="Todo description" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </>
);

TodoItemForm.displayName = 'TodoItemForm';
