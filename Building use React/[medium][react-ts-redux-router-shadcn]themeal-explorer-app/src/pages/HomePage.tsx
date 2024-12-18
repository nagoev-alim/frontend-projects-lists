import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Meal } from '@features/utils/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { useGetRandomMealsQuery, useLazySearchMealByNameQuery } from '@/features/meals/mealsApi';
import { Spinner } from '@/components/ui';

const FormSchema = z.object({
  name: z.string().min(2, {
    message: 'Meal must be at least 2 characters.',
  }),
});

type FormSchemaType = z.infer<typeof FormSchema>;

const HomePage = () => {
  const [searchMealByName, { data: searchResults, isLoading, isError, isSuccess }] = useLazySearchMealByNameQuery();
  const {
    data: randomMeals,
    isLoading: isLoadingRandom,
    isError: isErrorRandom,
    isSuccess: isSuccessRandom,
  } = useGetRandomMealsQuery();
  const [searchResultsData, setSearchResultsData] = useState<Meal[] | null>(null);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (searchResults && searchResults.length > 0) {
      setSearchResultsData(searchResults);
    }
  }, [searchResults]);

  const onSubmit = useCallback(async (formData: FormSchemaType) => {
    try {
      await searchMealByName(formData.name);
    } catch (error) {
      console.error('Failed to fetch meals:', error);
      toast({
        description: 'Failed to search for meals',
      });
    }
  }, [searchMealByName]);

  const handleResetClick = useCallback(() => {
    setSearchResultsData(null);
    form.reset();
  }, [form]);

  const renderMealCard = useCallback((meal: Meal) => (
    <Card key={meal.idMeal}>
      <CardContent className="p-2 flex flex-col items-start gap-1.5">
        <img src={meal.strMealThumb} alt={meal.strMeal} className="rounded-md" />
        <h3 className="font-semibold">{meal.strMeal}</h3>
        <p>{meal.strArea}</p>
        <Badge>{meal.strCategory}</Badge>
      </CardContent>
      <CardFooter className="p-2">
        <Button className="w-full whitespace-normal" asChild>
          <Link to={`/meal/${meal.idMeal}`}>More Info</Link>
        </Button>
      </CardFooter>
    </Card>
  ), []);

  return (
    <Card className="grid gap-4 p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-3 rounded-lg border-2 grid gap-2.5">
          <div className="grid gap-1.5 md:flex md:items-end">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-gray-700 dark:text-gray-300">Search for a Meal:</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="For example: Arrabiata"
                      {...field}
                      className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 dark:text-red-400" />
                </FormItem>
              )}
            />
            <Button type="submit">Submit</Button>
          </div>
          {isSuccess && searchResultsData && searchResultsData.length > 0 && (
            <Button variant="destructive" type="button" onClick={handleResetClick}>Reset Search</Button>
          )}
        </form>
      </Form>

      {(isError || isErrorRandom) && (
        <p className="text-red-500 text-center">Error while fetching meal data.</p>
      )}

      {(isLoadingRandom || isLoading) && <Spinner />}

      {searchResultsData && searchResultsData.length === 0 && (
        <p className="text-gray-700 text-center dark:text-gray-300">No results found.</p>
      )}

      {searchResultsData && searchResultsData.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {searchResultsData.map(renderMealCard)}
        </div>
      )}

      {!searchResultsData && isSuccessRandom && randomMeals && randomMeals.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {randomMeals.map(renderMealCard)}
        </div>
      )}
    </Card>
  );
};

export default HomePage;
