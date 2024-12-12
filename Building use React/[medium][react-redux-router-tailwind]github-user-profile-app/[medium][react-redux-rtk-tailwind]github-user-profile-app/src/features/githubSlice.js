import { createSelector, createSlice } from '@reduxjs/toolkit';

const githubSlice = createSlice({
  name: 'github',
  initialState: {
    users: [],
    currentUser: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    setUsers: (state, { payload }) => {
      state.users = payload;
      state.status = 'success';
    },
    clearUsers: (state) => {
      state.users = [];
      state.error = null;
      state.status = 'idle';
    },
    setError: (state, { payload }) => {
      state.error = payload;
      state.status = 'error';
    },
    setStatus: (state, { payload }) => {
      state.status = payload;
      state.error = null;
    },
  },
});

const githubReducer = githubSlice.reducer;

export const { setError, setUsers, clearUsers, setStatus } = githubSlice.actions;


const githubSelectors = {
  selectAll: createSelector(
    [({ github }) => github],
    ({ users, status, error }) => ({ users, status, error }),
  ),
};


export { githubSelectors, githubReducer };
