import { createSlice } from '@reduxjs/toolkit';
import mockData from '../../mock/data.json';
import { Jobs } from '../../helpers/types';

type InitialState = {
  positions: Jobs;
}

const initialState: InitialState = {
  positions: mockData,
};

export const positionsSlice = createSlice({
  name: 'positions',
  initialState,
  selectors: {
    selectPositions: (state) => state.positions,
    selectVisiblePositions: (state, filters = []) => {
      if (filters.length === 0) return state.positions;

      return state.positions.filter(position => {
        const positionFilters = [
          position.role,
          position.level,
          ...(position.languages || []),
          ...(position.tools || []),
        ];
        return filters.every((filter:string) => positionFilters.includes(filter));
      });
    },
    reducers: {},
  },
});
