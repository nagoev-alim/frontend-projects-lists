import { createAsyncThunk } from '@reduxjs/toolkit';
import { todosService } from '@services';
import { todosConstants } from '@features'

const createThunk = (type, apiMethod) =>
  createAsyncThunk(type, async (arg, { getState, ...thunkAPI }) => {
    const state = getState();
    return apiMethod(arg, state, thunkAPI);
  });

const todosActions = {
  create: createThunk(todosConstants.ACTIONS.CREATE, todosService.create),
  read: createThunk(todosConstants.ACTIONS.READ, todosService.read),
  update: createThunk(todosConstants.ACTIONS.UPDATE, todosService.update),
  toggle: createThunk(todosConstants.ACTIONS.TOGGLE, todosService.toggle),
  delete: createThunk(todosConstants.ACTIONS.DELETE, todosService.delete),
};

export default todosActions;
