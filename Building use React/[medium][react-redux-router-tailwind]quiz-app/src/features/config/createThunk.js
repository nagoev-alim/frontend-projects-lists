import { createAsyncThunk } from '@reduxjs/toolkit';

const createThunk = (type, apiMethod) =>
  createAsyncThunk(type, async (arg, { getState, ...thunkAPI }) => {
    const state = getState();
    return apiMethod(arg, state, thunkAPI);
  });

export default createThunk;
