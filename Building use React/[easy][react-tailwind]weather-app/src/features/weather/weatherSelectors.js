import { createSelector } from '@reduxjs/toolkit';

const selectWeatherState = ({ weather }) => weather;

const selectWeather = createSelector(
  [selectWeatherState],
  ({ data: { weather } }) => weather,
);

const selectRequest = createSelector(
  [selectWeatherState],
  ({ request: { status, error, message } }) => ({ status, error, message }),
);

const selectStatus = createSelector(
  [selectWeatherState],
  ({ request: { status } }) => status,
);

const selectError = createSelector(
  [selectWeatherState],
  ({ request: { error } }) => error,
);

const selectMessage = createSelector(
  [selectWeatherState],
  ({ request: { message } }) => message,
);


const weatherSelectors = {
  selectWeather,
  selectRequest,
  selectStatus,
  selectError,
  selectMessage,
};

export default weatherSelectors;
