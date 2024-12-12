import { createSelector } from '@reduxjs/toolkit';

/**
 * Базовый селектор для получения состояния пивоварни.
 * @param {Object} state - Глобальное состояние Redux.
 * @returns {Object} Состояние пивоварни.
 */
const selectBreweryState = ({ brewery }) => brewery;

/**
 * Селектор для получения списка пивоварен.
 * @type {function}
 * @returns {Array} Список пивоварен.
 */
const selectBreweryList = createSelector(
  [selectBreweryState],
  ({ data: { breweryList } }) => breweryList,
);

/**
 * Селектор для получения отфильтрованного списка пивоварен.
 * @type {function}
 * @returns {Array} Отфильтрованный список пивоварен.
 */
const selectFilteredList = createSelector(
  [selectBreweryState],
  ({ data: { filteredList } }) => filteredList,
);

/**
 * Селектор для получения статуса запроса пивоварни.
 * @type {function}
 * @returns {string} Статус запроса.
 */
const selectBreweryStatus = createSelector(
  [selectBreweryState],
  ({ request: { status } }) => status,
);

/**
 * Селектор для получения ошибки запроса пивоварни.
 * @type {function}
 * @returns {Object|null} Объект ошибки или null.
 */
const selectBreweryError = createSelector(
  [selectBreweryState],
  ({ request: { error } }) => error,
);

/**
 * Селектор для получения сообщения запроса пивоварни.
 * @type {function}
 * @returns {string|null} Сообщение запроса или null.
 */
const selectBreweryMessage = createSelector(
  [selectBreweryState],
  ({ request: { message } }) => message,
);

/**
 * Селектор для получения деталей выбранной пивоварни.
 * @type {function}
 * @returns {Object|null} Детали выбранной пивоварни или null.
 */
const selectBreweryDetails = createSelector(
  [selectBreweryState],
  ({ data: { selectedBrewery } }) => selectedBrewery,
);

/**
 * Объект, содержащий все селекторы для работы с данными пивоварни.
 * @type {Object.<string, function>}
 */
const brewerySelectors = {
  selectBreweryList,
  selectFilteredList,
  selectBreweryStatus,
  selectBreweryError,
  selectBreweryMessage,
  selectBreweryDetails,
};

export default brewerySelectors;
