import { createSelector } from '@reduxjs/toolkit';

const selectState = ({ todos }) => todos;

const selectTodosData = createSelector(
    [selectState],
    ({ request: { status, error, message }, data: { todos } }) => ({
      todos,
      status,
      error,
      message,
    }));

const todosSelectors = {
  selectTodosData,
};

export default todosSelectors;
