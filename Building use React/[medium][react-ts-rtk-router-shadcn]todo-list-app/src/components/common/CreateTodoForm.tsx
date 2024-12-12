import { toast } from '@hooks/use-toast.ts';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { validateSchema } from '@/helpers';
import { useCreateTodoMutation } from '@features/todos/todosApi.ts';
import { FormSchemaType } from '@helpers/types.ts';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@components/ui/form.tsx';
import { Input } from '@components/ui/input.tsx';
import { Textarea } from '@components/ui/textarea.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select.tsx';
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover.tsx';
import { Button } from '@components/ui/button.tsx';
import { cn } from '@/lib/utils.ts';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@components/ui/calendar.tsx';

export const CreateTodoForm = () => {
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(validateSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'personal',
      date: new Date(),
      color: '#222222',
    },
  });
  const [createTodo, { isLoading: isCreating }] = useCreateTodoMutation();

  const onSubmit = async (data: FormSchemaType) => {
    try {
      await createTodo({
        title: data.title,
        description: data.description,
        category: data.category,
        date: data.date,
        color: data.color,
        completed: false,
      }).unwrap();
      form.reset();
      toast({ description: 'Todo created successfully' });
    } catch (error) {
      console.error('Failed to create todo:', error);
      toast({ description: 'Failed to create todo' });
    }
  };

  return (
    <Form {...form}>
      <form className="grid gap-3" onSubmit={form.handleSubmit(onSubmit)}>
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
        <div className="grid md:grid-cols-[1fr_1fr_auto] gap-3">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="shopping">Shopping</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground',
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type="color" {...field} className="w-full md:w-10 h-10 cursor-pointer p-1" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={isCreating}>
          {isCreating ? 'Adding...' : 'Add Todo'}
        </Button>
      </form>
    </Form>
  );
};

CreateTodoForm.displayName = 'CreateTodoForm';
