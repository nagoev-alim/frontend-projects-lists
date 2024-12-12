import { createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '@services';
import { authConstants } from '@features'

const createThunk = (type, apiMethod) => createAsyncThunk(type, apiMethod);

const authActions = {
  register: createThunk(authConstants.ACTIONS.REGISTER, authService.register),
  login: createThunk(authConstants.ACTIONS.LOGIN, authService.login),
  logout: createThunk(authConstants.ACTIONS.LOGOUT, authService.logout),
};

export default authActions;
