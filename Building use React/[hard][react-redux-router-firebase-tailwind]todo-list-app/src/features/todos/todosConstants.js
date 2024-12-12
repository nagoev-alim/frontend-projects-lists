const todosConstants = {
  SLICE: {
    NAME: 'todos',
    INITIAL_STATE: {
      request: {
        status: 'idle',
        error: null,
        message: null,
      },
      data: {
        todos: [],
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
      state.request.message = action.payload;
    },
  },
  ACTIONS: {
    CREATE: 'todos/CREATE',
    READ: 'todos/READ',
    UPDATE: 'todos/UPDATE',
    DELETE: 'todos/DELETE',
    TOGGLE: 'todos/TOGGLE',
  },
};

export default todosConstants;
