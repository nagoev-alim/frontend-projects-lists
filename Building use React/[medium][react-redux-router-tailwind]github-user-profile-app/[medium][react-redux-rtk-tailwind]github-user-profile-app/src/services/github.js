import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setError, setStatus, setUsers } from '@features/githubSlice.js';


const CACHE_TIME = 60 * 1000; // 1 минута

const handleError = (error) => {
  console.error('API Error:', error);
  return {
    error: {
      status: error.status || 'CUSTOM_ERROR',
      message: error.data?.message || 'An unexpected error occurred',
    },
  };
};

export const githubApi = createApi({
  reducerPath: 'githubApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://api.github.com',
    timeout: 10000,
  }),
  keepUnusedDataFor: CACHE_TIME,
  endpoints: (builder) => ({
    searchUser: builder.query({
      query: (query) => ({
        url: `/search/users`,
        params: { q: query },
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          dispatch(setStatus('pending'));
          const { data: { items } } = await queryFulfilled;
          dispatch(setUsers(items));
        } catch (error) {
          dispatch(setError(error.message || 'Failed to fetch breweries'));
          return handleError(error);
        }
      },
    }),
    getUserById: builder.query({
  query: (login) => ({
    url: `/users/${login}`,
  }),
  async onQueryStarted(login, { queryFulfilled, dispatch }) {
    try {
      dispatch(setStatus('pending'));
      const { data: user } = await queryFulfilled;
      
      const reposResponse = await fetch(`https://api.github.com/users/${login}/repos?sort=created&per_page=10`);
      const repos = await reposResponse.json();

      dispatch(setUsers([{ ...user, repos }]));
    } catch (error) {
      dispatch(setError(error.message || 'Failed to fetch user'));
      return handleError(error);
    }
  },
})
  }),
});

export const {
  useLazySearchUserQuery,
} = githubApi;

export default githubApi;
