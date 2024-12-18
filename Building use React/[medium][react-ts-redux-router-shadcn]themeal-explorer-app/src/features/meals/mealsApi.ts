import { Meal } from '../utils/types';
import { createApi, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';

export const mealsApi = createApi({
  reducerPath: 'mealsApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://www.themealdb.com/api/json/v1/1' }),
  endpoints: (builder) => ({
    searchMealByName: builder.query<Meal[], string>({
      query: (name) => `search.php?s=${name}`,
      transformResponse: (response: { meals: Meal[] | null }) => response.meals || [],
    }),
    getRandomMeals: builder.query<Meal[], void>({
      async queryFn(_arg, _queryApi, _extraOptions, fetchWithBQ) {
        const fetchRandomMeal = async (): Promise<Meal | null> => {
          const result = await fetchWithBQ('random.php');
          if (result.error) throw result.error;
          const data = result.data as { meals: Meal[] };
          return data.meals?.[0] || null;
        };

        try {
          const meals = await Promise.all(Array(4).fill(null).map(fetchRandomMeal));
          const uniqueMeals = meals.reduce((acc: Meal[], meal: Meal | null) => {
            if (meal && !acc.some(m => m.idMeal === meal.idMeal)) {
              acc.push(meal);
            }
            return acc;
          }, []);
          return { data: uniqueMeals };
        } catch (error) {
          return { error: error as FetchBaseQueryError };
        }
      },
    }),
    searchMealById: builder.query<Meal, string>({
      query: (id) => `lookup.php?i=${id}`,
      transformResponse: (response: { meals: Meal[] | null }) => response.meals?.[0] || {} as Meal,
    }),
  }),
});

export const {
  useSearchMealByIdQuery,
  useLazySearchMealByNameQuery,
  useGetRandomMealsQuery,
} = mealsApi;
