import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Mobile } from '../../helpers/types';
import { cartSlice } from '../cart/cartSlice';

export const mobilesApi = createApi({
  reducerPath: 'mobilesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://gist.githubusercontent.com/nagoev-alim/07dd3efcc92990ad475513a7e28704d3/raw/e66748f5c17252662bfed9fb91d2f2f1434834a5/mobile-store-cart-app.json',
  }),
  endpoints: (builder) => ({
    getPhones: builder.query<Mobile[], string>({
      query: () => '',
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(cartSlice.actions.setItems(data));
        } catch (error) {
          console.error('Error fetching phones:', error);
        }
      },
    }),
  }),
});

export const { useGetPhonesQuery } = mobilesApi;
