import { createSlice } from '@reduxjs/toolkit';
import { authActions, authConstants } from '@features';

const authSlice = createSlice({
  name: 'auth',
  initialState: authConstants.SLICE.INITIAL_STATE,
  reducers: {},
  extraReducers: (builder) => {
    const addSliceCase = (actionCreator, updateData) => {
      builder
        .addCase(actionCreator.pending, authConstants.SLICE.PENDING)
        .addCase(actionCreator.fulfilled, (state, action) =>
          authConstants.SLICE.FULFILLED(state, action, updateData))
        .addCase(actionCreator.rejected, authConstants.SLICE.REJECTED);
    };

    addSliceCase(authActions.register, (data, payload) => {
      data.user = payload;
      data.isAuthenticated = true;
    });

    addSliceCase(authActions.login, (data, payload) => {
      data.user = payload;
      data.isAuthenticated = true;
    });

    addSliceCase(authActions.logout, (data) => {
      data.user = null;
      data.isAuthenticated = false;
    });
  },
});

const authReducer = authSlice.reducer;

export default authReducer;
