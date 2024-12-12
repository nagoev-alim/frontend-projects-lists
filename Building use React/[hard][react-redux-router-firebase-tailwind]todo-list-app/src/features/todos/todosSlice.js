import { createSlice } from '@reduxjs/toolkit';
import { todosActions, todosConstants } from '@features';

const todosName = todosConstants.SLICE.NAME;

const todosSlice = createSlice({
  name: todosName,
  initialState: todosConstants.SLICE.INITIAL_STATE,
  reducers: {},
  extraReducers: (builder) => {
    const addSliceCase = (actionCreator, updateData) => {
      builder
        .addCase(actionCreator.pending, todosConstants.SLICE.PENDING)
        .addCase(actionCreator.fulfilled, (state, action) =>
          todosConstants.SLICE.FULFILLED(state, action, updateData))
        .addCase(actionCreator.rejected, todosConstants.SLICE.REJECTED);
    };
    addSliceCase(todosActions.create, (data, payload) => {
      data.todos = [payload, ...data.todos];
    });
    addSliceCase(todosActions.read, (data, payload) => {
      data.todos = payload;
    });
    addSliceCase(todosActions.update, (data, payload) => {
      const index = data.todos.findIndex(todo => todo.id === payload.id);
      if (index !== -1) {
        data.todos[index] = { ...data.todos[index], ...payload };
      }
    });
    addSliceCase(todosActions.toggle, (data, payload) => {
      const index = data.todos.findIndex(todo => todo.id === payload.id);
      if (index !== -1) {
        data.todos[index] = { ...data.todos[index], ...payload };
      }
    });
    addSliceCase(todosActions.delete, (data, payload) => {
      data.todos = data.todos.filter(todo => todo.id !== payload.id);
    });
  },
});

const todosReducer = todosSlice.reducer;

export default todosReducer;
