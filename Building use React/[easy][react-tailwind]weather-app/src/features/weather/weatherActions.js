import { createAsyncThunk } from '@reduxjs/toolkit';
import { weatherService } from '../../services';

const SEARCH_BY_QUERY = 'weather/searchByQuery';

const createWeatherThunk = (type, apiMethod) => createAsyncThunk(type, apiMethod);

const weatherActions = {
  searchByQuery: createWeatherThunk(SEARCH_BY_QUERY, weatherService.searchByQuery),
};

export default weatherActions;
