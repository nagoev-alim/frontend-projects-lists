import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://api.github.com/' }),
  endpoints: (builder) => ({
    searchUsers: builder.query<any, string>({
      query: (searchTerm) => `search/users?q=${searchTerm}`,
    }),
    getUserDetails: builder.query<any, string>({
      query: (username) => `users/${username}`,
    }),
    getUserRepos: builder.query<any, string>({
      query: (username) => `users/${username}/repos`,
    }),
  }),
});

export const { 
  useSearchUsersQuery,
  useLazySearchUsersQuery, // Добавляем lazy вариант
  useGetUserDetailsQuery, 
  useGetUserReposQuery 
} = usersApi;
