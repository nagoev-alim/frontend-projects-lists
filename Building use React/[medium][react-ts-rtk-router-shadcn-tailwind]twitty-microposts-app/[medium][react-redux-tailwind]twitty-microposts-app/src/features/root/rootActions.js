import { createAsyncThunk } from '@reduxjs/toolkit';
import { rootService } from '@services';
import { rootConstants } from '@features'

const createThunk = (type, apiMethod) =>
  createAsyncThunk(type, async (arg, { getState, ...thunkAPI }) => {
    const state = getState();
    return apiMethod(arg, state, thunkAPI);
  });

const rootActions = {
  create: createThunk(rootConstants.ACTIONS.CREATE, rootService.create),
  read: createThunk(rootConstants.ACTIONS.READ, rootService.read),
  update: createThunk(rootConstants.ACTIONS.UPDATE, rootService.update),
  delete: createThunk(rootConstants.ACTIONS.DELETE, rootService.delete),
};

export default rootActions;
