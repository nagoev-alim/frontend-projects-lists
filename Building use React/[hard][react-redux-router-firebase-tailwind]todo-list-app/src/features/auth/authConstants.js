const authConstants = {
  SLICE: {
    INITIAL_STATE: {
      request: {
        status: 'idle',
        error: null,
        message: null,
      },
      data: {
        user: null,
        isAuthenticated: false,
      },
    },
    PENDING: (state) => {
      state.request.status = 'loading';
      state.request.message = '';
      state.request.error = null;
    },
    FULFILLED: (state, action, updateData) => {
      state.request.status = 'success';
      state.request.message = '';
      state.request.error = null;
      updateData(state.data, action.payload);
    },
    REJECTED: (state, action) => {
      state.request.status = 'failed';
      state.request.error = true;
      state.request.message = action.error.message;
    },
  },
  ACTIONS: {
    LOGIN: 'auth/LOGIN',
    REGISTER: 'auth/REGISTER',
    LOGOUT: 'auth/LOGOUT',
  },
};

export default authConstants;
