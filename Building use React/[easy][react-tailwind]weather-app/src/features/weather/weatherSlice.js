import { createSlice } from '@reduxjs/toolkit';
import { weatherActions } from './';

const initialState = {
  request: {
    status: 'idle',
    error: null,
    message: '',
  },
  data: {
    weather: null,
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


const weatherSlice = createSlice({
  name: 'weather',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    const addWeatherCase = (actionCreator, updateData) => {
      builder
        .addCase(actionCreator.pending, handlePending)
        .addCase(actionCreator.fulfilled, (state, action) => handleFulfilled(state, action, updateData))
        .addCase(actionCreator.rejected, handleRejected);
    };
    addWeatherCase(weatherActions.searchByQuery, (data, payload) => {
      data.weather = payload;
    });
  },
});

const nameReducer = weatherSlice.reducer;

export default nameReducer;
