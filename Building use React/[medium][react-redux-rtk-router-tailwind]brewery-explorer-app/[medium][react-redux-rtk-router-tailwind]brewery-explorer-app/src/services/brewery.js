import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setBreweryList, setLoading, setError } from '@features/brewerySlice.js';

const normalizeQuery = (query) => encodeURIComponent(query.trim().toLowerCase());

const CACHE_TIME = 60 * 1000; // 1 минута

const transformBreweryResponse = (response) => {
  if (!Array.isArray(response)) {
    return [response].filter(Boolean);
  }
  return response;
};

const handleError = (error) => {
  console.error('API Error:', error);
  return {
    error: {
      status: error.status || 'CUSTOM_ERROR',
      message: error.data?.message || 'An unexpected error occurred',
    },
  };
};

export const breweryApi = createApi({
  reducerPath: 'breweryApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://api.openbrewerydb.org/v1/',
    timeout: 10000,
  }),
  keepUnusedDataFor: CACHE_TIME,
  endpoints: (builder) => ({
    getRandomBrewery: builder.query({
      query: () => ({
        url: 'breweries/random',
        params: { size: 50 },
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          dispatch(setLoading('pending'));
          const { data } = await queryFulfilled;
          dispatch(setBreweryList(data));
        } catch (error) {
          dispatch(setError(error.message || 'Failed to fetch breweries'));
          return handleError(error);
        }
      },
    }),
    getBreweryById: builder.query({
      query: (breweryId) => ({
        url: `breweries/${breweryId}`,
        validateStatus: (response, result) =>
          response.status === 200 && Boolean(result),
      }),
      transformResponse: response => response,
      transformErrorResponse: handleError,
    }),
    searchBreweryByValue: builder.query({
      query: (searchValue) => ({
        url: 'breweries/search',
        params: { query: normalizeQuery(searchValue) },
      }),
      transformResponse: transformBreweryResponse,
      transformErrorResponse: handleError,
    }),
    searchBreweryByCountry: builder.query({
      query: (country) => ({
        url: 'breweries',
        params: { by_country: normalizeQuery(country) },
      }),
      transformResponse: transformBreweryResponse,
      transformErrorResponse: handleError,
    }),
    searchBreweryByCountryAndValue: builder.query({
      async queryFn(arg, _queryApi, _extraOptions, fetchWithBQ) {
        const { country, searchValue } = arg;
        try {
          const countryResult = await fetchWithBQ(`breweries?by_country=${normalizeQuery(country)}`);
          if (countryResult.error) return handleError(countryResult.error);

          const filteredBreweries = countryResult.data.filter(brewery =>
            ['name', 'city', 'state'].some(field =>
              brewery[field]?.toLowerCase().includes(normalizeQuery(searchValue)),
            ),
          );

          return { data: filteredBreweries };
        } catch (error) {
          return handleError(error);
        }
      },
    }),
  }),
});

export const {
  useGetRandomBreweryQuery,
  useGetBreweryByIdQuery,
  useLazySearchBreweryByValueQuery,
  useLazySearchBreweryByCountryQuery,
  useLazySearchBreweryByCountryAndValueQuery,
} = breweryApi;

export default breweryApi;
