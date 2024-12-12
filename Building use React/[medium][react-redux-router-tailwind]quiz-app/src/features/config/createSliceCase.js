import { CONFIG_FEATURES } from '@features';

const createSliceCase = (builder, actionCreator, updateData) => {
  builder
    .addCase(actionCreator.pending, CONFIG_FEATURES.SLICE_CASE_TYPE.PENDING)
    .addCase(actionCreator.fulfilled, (state, action) => CONFIG_FEATURES.SLICE_CASE_TYPE.FULFILLED(state, action, updateData))
    .addCase(actionCreator.rejected, CONFIG_FEATURES.SLICE_CASE_TYPE.REJECTED);
};

export default createSliceCase;
