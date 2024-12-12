const rootConstants = {
  SLICE: {
    NAME: 'root',
    INITIAL_STATE: {
      request: {
        status: 'idle',
        error: null,
        message: null,
      },
      data: {
        reviews: [],
        editingReview: null,
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
    CREATE: 'root/CREATE',
    READ: 'root/READ',
    UPDATE: 'root/UPDATE',
    DELETE: 'root/DELETE',
  },
  COMPONENTS: {
    STATUS: {
      LOADING: 'loading',
      ERROR: 'error',
      SUCCESS: 'success',
    },
    ERROR_MESSAGES: {
      FETCH: 'Error fetching reviews',
      INCOMPLETE_FORM: 'Please provide both rating and review',
      DELETE_FAIL: 'Failed to delete review',
    },
  },
};

export default rootConstants;
