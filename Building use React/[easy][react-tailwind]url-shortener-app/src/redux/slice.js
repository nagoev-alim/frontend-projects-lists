import { createSlice } from '@reduxjs/toolkit';
import { createSelector } from '@reduxjs/toolkit';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from './';

const FETCH_SHORTEN = 'shorten/fetchShorten';

const createThunk = (type, apiMethod) => createAsyncThunk(type, apiMethod);

const shortenActions = {
  fetchShorten: createThunk(FETCH_SHORTEN, apiService.fetchShorten),
};

const initialState = {
  request: {
    status: 'idle',
    error: null,
    message: '',
  },
  data: {
    shortenUrl: null,
  },
};


const handlePending = (state) => {
  state.request.status = 'loading';
  state.request.message = '';
  state.request.error = null;
};

const handleFulfilled = (state, action, updateData) => {
  state.request.status = 'success';
  state.request.message = '';
  state.request.error = null;
  updateData(state.data, action.payload);
};

const handleRejected = (state, action) => {
  state.request.status = 'failed';
  state.request.error = true;
  state.request.message = action.payload;
};


const exampleSlice = createSlice({
  name: 'shorten',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    const addCase = (actionCreator, updateData) => {
      builder
        .addCase(actionCreator.pending, handlePending)
        .addCase(actionCreator.fulfilled, (state, action) => handleFulfilled(state, action, updateData))
        .addCase(actionCreator.rejected, handleRejected);
    };
    addCase(shortenActions.fetchShorten, (data, payload) => {
      data.shortenUrl = payload;
    });
  },
});

const shortenReducer = exampleSlice.reducer;

// Selectors

const selectState = ({ shorten }) => shorten;

const selectShorten = createSelector(
  [selectState],
  ({ data: { shortenUrl } }) => shortenUrl,
);

const selectRequest = createSelector(
  [selectState],
  ({ request: { status, error, message } }) => ({ status, error, message }),
);

const selectStatus = createSelector(
  [selectState],
  ({ request: { status } }) => status,
);

const selectError = createSelector(
  [selectState],
  ({ request: { error } }) => error,
);

const selectMessage = createSelector(
  [selectState],
  ({ request: { message } }) => message,
);


const shortenSelectors = {
  selectShorten,
  selectRequest,
  selectStatus,
  selectError,
  selectMessage,
};


export { shortenReducer, shortenActions, shortenSelectors };
