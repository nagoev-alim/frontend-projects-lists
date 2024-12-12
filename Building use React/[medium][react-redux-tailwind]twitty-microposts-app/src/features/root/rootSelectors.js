import { createSelector } from '@reduxjs/toolkit';

const selectState = ({ root }) => root;

const selectRootData = createSelector(
  [selectState],
  ({ request: { status, error, message }, data: { reviews, editingReview } }) => ({
    reviews,
    editingReview,
    status,
    error,
    message,
  }),
);

const rootSelectors = {
  selectRootData,
};

export default rootSelectors;
