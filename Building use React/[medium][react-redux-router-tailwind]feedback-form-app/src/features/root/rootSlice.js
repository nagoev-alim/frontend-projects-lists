import { createSlice } from '@reduxjs/toolkit';
import { rootActions, rootConstants } from '@features';

const rootName = rootConstants.SLICE.NAME;

const rootSlice = createSlice({
  name: rootName,
  initialState: rootConstants.SLICE.INITIAL_STATE,
  reducers: {
    onEditReview: (state, { payload }) => {
      const reviewIndex = state.data.reviews.findIndex((review) => review.id === payload);
      if (reviewIndex !== -1) {
        state.data.editingReview = JSON.parse(JSON.stringify(state.data.reviews[reviewIndex]));
      }
    },
    onResetEditReview: (state, { payload }) => {
      state.data.editingReview = null;
    },
  },
  extraReducers: (builder) => {
    const addSliceCase = (actionCreator, updateData) => {
      builder
        .addCase(actionCreator.pending, rootConstants.SLICE.PENDING)
        .addCase(actionCreator.fulfilled, (state, action) => rootConstants.SLICE.FULFILLED(state, action, updateData))
        .addCase(actionCreator.rejected, rootConstants.SLICE.REJECTED);
    };
    addSliceCase(rootActions.create, (data, payload) => {
      data.reviews = [payload, ...data.reviews];
    });
    addSliceCase(rootActions.read, (data, payload) => {
      data.reviews = payload;
    });
    addSliceCase(rootActions.update, (data, payload) => {
      const reviewIndex = data.reviews.findIndex((review) => review.id === payload.id);
      if (reviewIndex!== -1) {
        data.reviews[reviewIndex] = payload;
      }
    });
    addSliceCase(rootActions.delete, (data, payload) => {
      data.reviews = data.reviews.filter((review) => review.id!== payload);
    });
  },
});

const rootReducer = rootSlice.reducer;
export const { onEditReview, onResetEditReview } = rootSlice.actions;
export default rootReducer;
