/**
 * @module HomePage
 * @description Модуль, содержащий компонент HomePage, который представляет главную страницу приложения для управления задачами.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Loader } from '@ui';
import { authSelectors, todosActions, todosSelectors } from '@features';
import { FilterButtons, FilterInput, TodoForm, TodoList } from '@functional';

/**
 * @description Массив приоритетов задач.
 */
export const priorities = [
  { value: 0, emoji: '🟢', label: 'Low' },
  { value: 1, emoji: '🟠', label: 'Medium' },
  { value: 2, emoji: '🔴', label: 'High' },
];

/**
 * @function HomePage
 * @description Компонент главной страницы приложения для управления задачами.
 * @returns {JSX.Element} Возвращает JSX элемент, представляющий главную страницу.
 */
const HomePage = () => {
  const dispatch = useDispatch();
  const [editingTodo, setEditingTodo] = useState(null);
  const [filterInput, setFilterInput] = useState('');
  const [filter, setFilter] = useState('all');
  const { user: { uid } } = useSelector(authSelectors.selectAuthData);
  const { todos, status, error, message } = useSelector(todosSelectors.selectTodosData);

  /**
   * @description Загружает задачи пользователя при монтировании компонента.
   */
  useEffect(() => {
    dispatch(todosActions.read({ userId: uid }));
  }, [dispatch, uid]);

  /**
   * @function handleSubmit
   * @description Обрабатывает отправку формы создания/редактирования задачи.
   * @param {Object} data - Данные задачи.
   */
  const handleSubmit = useCallback((data) => {
    if (editingTodo) {
      dispatch(todosActions.update({ userId: uid, id: editingTodo.id, ...data }));
      setEditingTodo(null);
    } else {
      dispatch(todosActions.create({ userId: uid, ...data }));
    }
  }, [dispatch, editingTodo, uid]);

  /**
   * @function handleEdit
   * @description Устанавливает задачу для редактирования.
   * @param {Object} todo - Задача для редактирования.
   */
  const handleEdit = useCallback((todo) => {
    setEditingTodo(todo);
  }, []);

  /**
   * @function handleDelete
   * @description Удаляет задачу после подтверждения.
   * @param {string} id - Идентификатор задачи.
   */
  const handleDelete = useCallback(async (id) => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      await dispatch(todosActions.delete({ userId: uid, id }));
    }
  }, [dispatch, uid]);

  /**
   * @function handleFilterChange
   * @description Обновляет текстовый фильтр задач.
   * @param {string} value - Новое значение фильтра.
   */
  const handleFilterChange = useCallback((value) => {
    setFilterInput(value);
  }, []);

  /**
   * @function handleFilterButtonChange
   * @description Обновляет кнопочный фильтр задач.
   * @param {string} newFilter - Новое значение фильтра.
   */
  const handleFilterButtonChange = useCallback((newFilter) => {
    setFilter(newFilter);
  }, []);

  /**
   * @description Фильтрует и сортирует задачи на основе текущего состояния фильтров.
   * Использует useMemo для оптимизации производительности.
   */
  const filteredAndSortedTodos = useMemo(() => {
    return [...todos]
      .filter(todo => {
        const matchesText = todo.text.toLowerCase().includes(filterInput.toLowerCase()) ||
          todo.description.toLowerCase().includes(filterInput.toLowerCase());

        switch (filter) {
          case 'active':
            return matchesText && !todo.completed;
          case 'completed':
            return matchesText && todo.completed;
          default: // 'all'
            return matchesText;
        }
      })
      .sort((a, b) => b.priority - a.priority);
  }, [todos, filterInput, filter]);

  return (
    <div className="container mx-auto p-4 max-w-2xl bg-white border-2 grid gap-2">
      <TodoForm onSubmit={handleSubmit} editingTodo={editingTodo} setEditingTodo={setEditingTodo} />

      {status === 'loading' && <Loader />}
      {error && <p className="text-red-500 text-center mb-4">{message}</p>}
      {status === 'success' && todos.length === 0 && <p className="text-center">No todos</p>}
      {status === 'success' && todos.length > 0 && (
        <>
          <FilterInput value={filterInput} onChange={handleFilterChange} />
          <FilterButtons filter={filter} onFilterChange={handleFilterButtonChange} />
          <TodoList
            todos={filteredAndSortedTodos}
            onEdit={handleEdit}
            onDelete={handleDelete}
            userId={uid}
          />
        </>
      )}
      {status === 'success' && filteredAndSortedTodos.length === 0 && (
        <p className="text-center">No todos match your filter</p>
      )}
    </div>
  );
};

export default HomePage;
