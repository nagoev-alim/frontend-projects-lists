import { createSelector } from '@reduxjs/toolkit';

const selectState = ({ auth }) => auth;

const selectAuthData = createSelector(
  [selectState],
  ({ request: { status, error, message }, data: { user, isAuthenticated } }) => ({
    user,
    isAuthenticated,
    status,
    error,
    message,
  }),
);


const authSelectors = {
  selectAuthData,
};

export default authSelectors;
