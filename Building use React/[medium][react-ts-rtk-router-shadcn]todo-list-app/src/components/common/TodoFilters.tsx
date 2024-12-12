import { Input } from '@components/ui/input.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select.tsx';
import { format } from 'date-fns';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { Todo } from '@helpers/types.ts';

type TodoFilterProps = {
  todos: Todo[];
  onSetFilteredTodos: (filteredTodos: Todo[]) => void;
}

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'personal', label: 'Personal' },
  { value: 'work', label: 'Work' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'other', label: 'Other' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'completed', label: 'Completed' },
  { value: 'incomplete', label: 'Incomplete' },
];

export const TodoFilters = ({ todos, onSetFilteredTodos }: TodoFilterProps) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<Date | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleDateChange = useCallback((value: string) => {
    setDateFilter(value === 'all' ? 'all' : new Date(value));
  }, []);

  const dateOptions = useMemo(() => {
    const uniqueDates = Array.from(new Set(todos?.map(todo => format(new Date(todo.date), 'yyyy-MM-dd'))));
    return uniqueDates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  }, [todos]);

  const filteredTodos = useMemo(() => {
    return todos?.filter(todo => {
      const matchesSearch = todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        todo.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || todo.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'completed' && todo.completed) ||
        (statusFilter === 'incomplete' && !todo.completed);
      const matchesDate = dateFilter === 'all' || format(new Date(todo.date), 'yyyy-MM-dd') === format(dateFilter, 'yyyy-MM-dd');

      return matchesSearch && matchesCategory && matchesStatus && matchesDate;
    });
  }, [todos, searchTerm, categoryFilter, statusFilter, dateFilter]);

  useEffect(() => {
    onSetFilteredTodos(filteredTodos);
  }, [filteredTodos, onSetFilteredTodos]);

  return (
    <div className="grid gap-3 md:grid-cols-[2fr_1fr_1fr_1fr]">
      <Input
        placeholder="Search todos"
        value={searchTerm}
        onChange={handleSearchChange}
      />
      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
        <SelectTrigger>
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          {CATEGORY_OPTIONS.map(option => (
            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger>
          <SelectValue placeholder="All" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map(option => (
            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={dateFilter === 'all' ? 'all' : format(dateFilter, 'yyyy-MM-dd')}
        onValueChange={handleDateChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Date" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {dateOptions.map(dateString => (
            <SelectItem key={dateString} value={dateString}>
              {format(new Date(dateString), 'PPP')}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

TodoFilters.displayName = 'TodoFilters';
