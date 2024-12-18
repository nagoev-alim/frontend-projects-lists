import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@features/utils/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { drinks as drinksData } from '../mock/drinks';
import { useEffect, useState } from 'react';
import { Drink } from '../mock/types';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';
import { Badge } from '../components/ui/badge';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form';
import { Input } from '../components/ui/input';
import { drinksSlice } from '../features/drinks/drinksSlice';
import { toast } from '../hooks/use-toast';

const FormSchema = z.object({
  name: z.string().min(2, {
    message: 'Cocktail must be at least 2 characters.',
  }),
});

type FormSchemaType = z.infer<typeof FormSchema>;

const HomePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const randomDrinks = useSelector(drinksSlice.selectors.getRandomDrinks);
  const searchResults = useSelector(drinksSlice.selectors.getSearchResults);
  console.log(randomDrinks);
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
    },
    mode: 'onChange',
  });


  useEffect(() => {
    dispatch(drinksSlice.actions.setDrinks(drinksData));
    dispatch(drinksSlice.actions.setRandomDrinks(drinksData));
  }, [dispatch]);


  const onSubmit = async (formData: FormSchemaType) => {
    try {
      await dispatch(drinksSlice.actions.searchDrinks(formData.name));
    } catch (error) {
      console.error('Failed to fetch cocktails:', error);
      toast({
        description: 'Failed to search for cocktails',
      });
    }
  };

  const handleResetClick = () => {
    dispatch(drinksSlice.actions.setSearchResults(null));
    form.reset();
  };

  return (
    <Card className="p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-3 rounded-lg border-2 grid gap-2.5">
          <div className="grid gap-1.5 md:flex md:items-end">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-gray-700 dark:text-gray-300">Search for a Cocktail:</FormLabel>
                  <FormControl>
                    <Input placeholder="For example: Mojito" {...field}
                           className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
                  </FormControl>
                  <FormMessage className="text-red-500 dark:text-red-400" />
                </FormItem>
              )}
            />
            <Button type="submit">Submit</Button>
          </div>
          {searchResults && searchResults.length > 0 && (
            <Button variant="destructive" type="button" onClick={handleResetClick}>Reset Search</Button>
          )}
        </form>
      </Form>
      {searchResults && searchResults.length === 0 && (
        <p className="text-gray-700 dark:text-gray-300">No results found.</p>
      )}
      {searchResults && searchResults.length > 0 && (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {searchResults.map((drink: Drink) => (
            <Card key={drink.idDrink}>
              <CardContent className="p-2 flex flex-col items-start gap-1.5">
                <img src={drink.strDrinkThumb} alt={drink.strDrink} className="rounded-md" />
                <h3 className="font-semibold">{drink.strDrink}</h3>
                <p>{drink.strGlass}</p>
                <Badge>{drink.strAlcoholic}</Badge>
              </CardContent>
              <CardFooter className="p-2">
                <Button className="w-full whitespace-normal" asChild>
                  <Link to={`/cocktail/${drink.idDrink}`}>About {drink.strDrink}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      {!searchResults && randomDrinks.length > 0 && (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {randomDrinks.map((drink: Drink) => (
            <Card key={drink.idDrink}>
              <CardContent className="p-2 flex flex-col items-start gap-1.5">
                <img src={drink.strDrinkThumb} alt={drink.strDrink} className="rounded-md" />
                <h3 className="font-semibold">{drink.strDrink}</h3>
                <p>{drink.strGlass}</p>
                <Badge>{drink.strAlcoholic}</Badge>
              </CardContent>
              <CardFooter className="p-2">
                <Button className="w-full" asChild>
                  <Link to={`/cocktail/${drink.idDrink}`}>About {drink.strDrink}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </Card>
  );
};

HomePage.displayName = 'HomePage';

export default HomePage;
