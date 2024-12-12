import { createSelector } from '@reduxjs/toolkit';

/**
 * Базовый селектор для получения состояния стран.
 * @param {Object} state - Глобальное состояние Redux.
 * @returns {Object} Состояние стран.
 */
const selectCountriesState = ({ countries }) => countries;

/**
 * Селектор для получения списка всех стран.
 * @type {function}
 * @returns {Array} Массив стран.
 */
const selectCountries = createSelector(
  [selectCountriesState],
  ({ data: { countries } }) => countries,
);

/**
 * Селектор для получения отфильтрованного списка стран.
 * @type {function}
 * @returns {Array} Массив отфильтрованных стран.
 */
const selectCountriesFiltered = createSelector(
  [selectCountriesState],
  ({ data: { countriesFiltered } }) => countriesFiltered,
);

/**
 * Селектор для получения деталей выбранной страны.
 * @type {function}
 * @returns {Object|null} Детали выбранной страны или null.
 */
const selectCountryDetails = createSelector(
  [selectCountriesState],
  ({ data: { selectedCountry } }) => selectedCountry,
);

/**
 * Селектор для получения статуса запроса стран.
 * @type {function}
 * @returns {string} Статус запроса.
 */
const selectCountriesStatus = createSelector(
  [selectCountriesState],
  ({ request: { status } }) => status,
);

/**
 * Селектор для получения ошибки запроса стран.
 * @type {function}
 * @returns {string|null} Текст ошибки или null.
 */
const selectCountriesError = createSelector(
  [selectCountriesState],
  ({ request: { error } }) => error,
);

/**
 * Селектор для получения сообщения запроса стран.
 * @type {function}
 * @returns {string|null} Текст сообщения или null.
 */
const selectCountriesMessage = createSelector(
  [selectCountriesState],
  ({ request: { message } }) => message,
);

/**
 * Объект, содержащий все селекторы для работы с данными стран.
 * @type {Object}
 */
const countriesSelectors = {
  selectCountries,
  selectCountriesFiltered,
  selectCountryDetails,
  selectCountriesStatus,
  selectCountriesError,
  selectCountriesMessage,
};

export default countriesSelectors;
