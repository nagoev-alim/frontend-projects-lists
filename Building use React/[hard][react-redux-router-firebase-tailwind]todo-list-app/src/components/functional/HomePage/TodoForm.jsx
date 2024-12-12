/**
 * @module TodoForm
 * @description Модуль, содержащий компонент формы для создания и редактирования задач (todos).
 */

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, Input, Select, Textarea } from '@ui';
import { priorities } from '@pages';

/**
 * Схема валидации для формы задачи.
 */
const schema = z.object({
  text: z
    .string({ required_error: 'Todo text is required' })
    .min(3, { message: 'Must be at 3 or more characters long.' })
    .max(100, 'Todo text must be less than 100 characters'),
  description: z.string().optional(),
  priority: z.number().min(0).max(2),
});

/**
 * @function TodoForm - Компонент формы для создания и редактирования задач.
 * @param {Object} props - Свойства компонента.
 * @param {Function} props.onSubmit - Функция, вызываемая при отправке формы.
 * @param {Object|null} props.editingTodo - Объект редактируемой задачи или null.
 * @param {Function} props.setEditingTodo - Функция для установки редактируемой задачи.
 * @returns {JSX.Element} Форма для создания/редактирования задачи.
 *
 * @description
 * Этот компонент представляет собой форму для создания новых задач или редактирования существующих.
 * Он использует библиотеку react-hook-form для управления состоянием формы и валидации,
 * а также zod для определения схемы валидации.
 */
const TodoForm = ({ onSubmit, editingTodo, setEditingTodo }) => {
  // Инициализация хука useForm с настройками валидации и начальными значениями
  const { register, handleSubmit, reset, control, formState: { errors }, setValue } = useForm({
    resolver: zodResolver(schema), // Использование zod для валидации формы
    defaultValues: {
      text: '',
      description: '',
      priority: 0,
    },
  });

  // Эффект для обновления значений формы при изменении редактируемой задачи
  useEffect(() => {
    if (editingTodo) {
      // Если есть редактируемая задача, заполняем форму её значениями
      setValue('text', editingTodo.text || '');
      setValue('description', editingTodo.description || '');
      setValue('priority', editingTodo.priority || 0);
    } else {
      // Если нет редактируемой задачи, сбрасываем форму к начальным значениям
      reset({ text: '', description: '', priority: 0 });
    }
  }, [editingTodo, setValue, reset]); // Зависимости эффекта

  // Обработчик отправки формы
  const handleFormSubmit = (data) => {
    onSubmit(data);
    reset();
  };

  // Обработчик отмены редактирования
  const handleCancelClick = () => {
    setEditingTodo(null);
    reset({ text: '', description: '', priority: 0 });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="grid gap-2">
      <label className="grid gap-1">
        <span className="text-sm font-semibold">Name:</span>
        <Input
          {...register('text')}
          placeholder="Enter new todo"
          fullWidth={true}
          className="border-neutral-500"
        />
        {errors.text && <span className="text-red-500 text-xs">{errors.text.message}</span>}
      </label>
      <label className="grid gap-1">
        <span className="text-sm font-semibold">Description:</span>
        <Textarea
          {...register('description')}
          placeholder="Enter description"
          fullWidth={true}
          resizeNone={true}
          className="border-neutral-500"
        />
      </label>
      <label className="grid gap-1">
        <span className="text-sm font-semibold">Priority:</span>
        <Controller
          name="priority"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Select
              options={priorities.map(p => ({ value: p.value, label: p.emoji + ' ' + p.label }))}
              fullWidth={true}
              className="border-neutral-500"
              value={priorities.find(p => p.value === value)}
              onChange={(selectedOption) => {
                onChange(selectedOption.value);
              }}
            />
          )}
        />
      </label>
      <Button type="submit" fullWidth={true}>
        {editingTodo ? 'Update Todo' : 'Add Todo'}
      </Button>
      {editingTodo && (<Button variant="danger" onClick={handleCancelClick}>Cancel</Button>)}
    </form>
  );
};

export default TodoForm;
